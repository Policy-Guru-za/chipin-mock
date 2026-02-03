import { redirect } from 'next/navigation';
import { z } from 'zod';

import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { GiftArtworkGenerator } from '@/components/gift/GiftArtworkGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const manualGiftSchema = z.object({
  giftName: z.string().min(2).max(200),
  giftDescription: z.string().min(10).max(500),
  giftImageUrl: z.string().url(),
  giftImagePrompt: z.string().min(1),
  goalAmount: z.coerce.number().int().positive(),
});

type GiftSearchParams = {
  error?: string;
};

const getErrorMessage = (error?: string) =>
  (
    {
      invalid: 'Please complete all required fields.',
      artwork: 'Generate artwork before continuing.',
    }[error ?? ''] ?? null
  );

const resolveDefaultGiftName = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftName ?? '';

const resolveDefaultGiftDescription = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.giftDescription ?? '';

const resolveDefaultGoal = (draft?: Awaited<ReturnType<typeof getDreamBoardDraft>>) =>
  draft?.goalCents ? Math.round(draft.goalCents / 100) : '';

async function saveManualGiftAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft?.childPhotoUrl) {
    redirect('/create/child');
  }
  const giftName = formData.get('giftName');
  const giftDescription = formData.get('giftDescription');
  const giftImageUrl = formData.get('giftImageUrl');
  const giftImagePrompt = formData.get('giftImagePrompt');
  const goalAmount = formData.get('goalAmount');
  if (!giftImageUrl || !giftImagePrompt) {
    redirect('/create/gift?error=artwork');
  }
  const result = manualGiftSchema.safeParse({
    giftName,
    giftDescription,
    giftImageUrl,
    giftImagePrompt,
    goalAmount,
  });

  if (!result.success) {
    redirect('/create/gift?error=invalid');
  }

  const goalCents = Math.round(result.data.goalAmount * 100);
  await updateDreamBoardDraft(session.hostId, {
    giftName: result.data.giftName.trim(),
    giftDescription: result.data.giftDescription.trim(),
    giftImageUrl: result.data.giftImageUrl,
    giftImagePrompt: result.data.giftImagePrompt,
    goalCents,
  });

  redirect('/create/details');
}

export default async function CreateGiftPage({
  searchParams,
}: {
  searchParams?: GiftSearchParams;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'gift', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/child');
  }

  const errorMessage = getErrorMessage(searchParams?.error);
  const defaultGiftName = resolveDefaultGiftName(draft);
  const defaultGiftDescription = resolveDefaultGiftDescription(draft);
  const defaultGoal = resolveDefaultGoal(draft);

  return (
    <CreateFlowShell stepLabel={view.stepLabel} title={view.title} subtitle={view.subtitle}>
      <Card>
        <CardHeader>
          <CardTitle>Dream gift</CardTitle>
          <CardDescription>Describe the dream gift and the goal amount.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={saveManualGiftAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="giftName" className="text-sm font-medium text-text">
                Gift name
              </label>
              <Input
                id="giftName"
                name="giftName"
                placeholder="E.g., red mountain bike"
                defaultValue={defaultGiftName}
                required
              />
            </div>

            <GiftArtworkGenerator
              defaultDescription={defaultGiftDescription}
              defaultImageUrl={draft?.giftImageUrl ?? ''}
              defaultPrompt={draft?.giftImagePrompt ?? ''}
            />

            <div className="space-y-2">
              <label htmlFor="goalAmount" className="text-sm font-medium text-text">
                Goal amount (R)
              </label>
              <Input
                id="goalAmount"
                name="goalAmount"
                type="number"
                min={1}
                step={1}
                defaultValue={defaultGoal}
                required
              />
            </div>

            <Button type="submit">Continue to payout details</Button>
          </form>
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
