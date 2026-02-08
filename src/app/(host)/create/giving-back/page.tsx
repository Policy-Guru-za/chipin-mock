import { redirect } from 'next/navigation';
import { z } from 'zod';

import { GivingBackForm } from '@/app/(host)/create/giving-back/GivingBackForm';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { listActiveCharities } from '@/lib/charities';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { LOCKED_CHARITY_SPLIT_MODES } from '@/lib/ux-v2/decision-locks';

const givingBackSchema = z
  .object({
    charityEnabled: z.boolean(),
    charityId: z.string().uuid().optional(),
    charitySplitType: z.enum(LOCKED_CHARITY_SPLIT_MODES).optional(),
    charityPercentage: z.coerce.number().int().min(5).max(50).optional(),
    charityThresholdAmount: z.coerce.number().int().min(50).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.charityEnabled) {
      return;
    }

    if (!data.charityId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a charity',
        path: ['charityId'],
      });
    }

    if (!data.charitySplitType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select how to split',
        path: ['charitySplitType'],
      });
      return;
    }

    if (data.charitySplitType === 'percentage' && data.charityPercentage === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charityPercentage'],
        message: 'Set a percentage between 5% and 50%',
      });
    }

    if (data.charitySplitType === 'threshold' && data.charityThresholdAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charityThresholdAmount'],
        message: 'Set an amount between R50 and R500',
      });
    }
  });

const givingBackErrorMessages: Record<string, string> = {
  invalid: 'Please complete the giving-back details.',
  charity_required: 'Please select a charity.',
  split_required: 'Please choose how to split the goal.',
  percentage_range: 'Set a percentage between 5% and 50%.',
  threshold_range: 'Set a fixed amount between R50 and R500.',
};

const getGivingBackErrorMessage = (error?: string) =>
  error ? (givingBackErrorMessages[error] ?? null) : null;

const normalizeNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function saveGivingBackAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'giving-back', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }

  const payload = {
    charityEnabled: formData.get('charityEnabled') === 'on',
    charityId: typeof formData.get('charityId') === 'string' ? formData.get('charityId') || undefined : undefined,
    charitySplitType:
      typeof formData.get('charitySplitType') === 'string'
        ? formData.get('charitySplitType') || undefined
        : undefined,
    charityPercentage: normalizeNumber(formData.get('charityPercentage')),
    charityThresholdAmount: normalizeNumber(formData.get('charityThresholdAmount')),
  };

  const parsed = givingBackSchema.safeParse(payload);
  if (!parsed.success) {
    const firstPath = parsed.error.issues[0]?.path[0];
    if (firstPath === 'charityId') {
      redirect('/create/giving-back?error=charity_required');
    }
    if (firstPath === 'charitySplitType') {
      redirect('/create/giving-back?error=split_required');
    }
    if (firstPath === 'charityPercentage') {
      redirect('/create/giving-back?error=percentage_range');
    }
    if (firstPath === 'charityThresholdAmount') {
      redirect('/create/giving-back?error=threshold_range');
    }
    redirect('/create/giving-back?error=invalid');
  }

  if (!parsed.data.charityEnabled) {
    await updateDreamBoardDraft(session.hostId, {
      charityEnabled: false,
      charityId: undefined,
      charitySplitType: undefined,
      charityPercentageBps: undefined,
      charityThresholdCents: undefined,
    });
    redirect('/create/payout');
  }

  const charitySplitType = parsed.data.charitySplitType;
  if (!charitySplitType || !parsed.data.charityId) {
    redirect('/create/giving-back?error=invalid');
  }

  const charityPercentageBps =
    charitySplitType === 'percentage' && parsed.data.charityPercentage !== undefined
      ? parsed.data.charityPercentage * 100
      : undefined;
  const charityThresholdCents =
    charitySplitType === 'threshold' && parsed.data.charityThresholdAmount !== undefined
      ? parsed.data.charityThresholdAmount * 100
      : undefined;

  await updateDreamBoardDraft(session.hostId, {
    charityEnabled: true,
    charityId: parsed.data.charityId,
    charitySplitType,
    charityPercentageBps,
    charityThresholdCents,
  });

  redirect('/create/payout');
}

type GivingBackSearchParams = {
  error?: string;
};

export default async function CreateGivingBackPage({
  searchParams,
}: {
  searchParams?: GivingBackSearchParams;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'giving-back', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft?.goalCents) {
    redirect('/create/gift');
  }

  const charities = await listActiveCharities();
  const activeCharities = charities.map((charity) => ({
    id: charity.id,
    name: charity.name,
    description: charity.description,
    category: charity.category,
    logoUrl: charity.logoUrl ?? null,
  }));
  const hasActiveCharities = activeCharities.length > 0;

  const defaultSplitType =
    draft.charitySplitType === 'percentage' || draft.charitySplitType === 'threshold'
      ? draft.charitySplitType
      : 'percentage';

  const errorMessage = getGivingBackErrorMessage(searchParams?.error);

  return (
    <CreateFlowShell
      currentStep={4}
      totalSteps={6}
      stepLabel={view.stepLabel}
      title={view.title}
      subtitle={view.subtitle}
    >
      <Card>
        <CardHeader>
          <CardTitle>Giving back</CardTitle>
          <CardDescription>Choose whether to share a portion of the goal with charity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
          {!hasActiveCharities ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No active charities are configured. You can continue without giving back for now.
              </div>
              <form action={saveGivingBackAction}>
                <Button type="submit">
                  Continue to payout setup
                </Button>
              </form>
            </div>
          ) : (
            <GivingBackForm
              action={saveGivingBackAction}
              charities={activeCharities}
              defaultCharityEnabled={draft.charityEnabled}
              defaultCharityId={draft.charityId}
              defaultSplitType={defaultSplitType}
              defaultPercentage={
                draft.charityPercentageBps ? Math.round(draft.charityPercentageBps / 100) : 25
              }
              defaultThresholdAmount={
                draft.charityThresholdCents ? Math.round(draft.charityThresholdCents / 100) : 100
              }
              goalCents={draft.goalCents}
              childName={draft.childName}
            />
          )}
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
