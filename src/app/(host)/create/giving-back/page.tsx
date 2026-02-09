import { redirect } from 'next/navigation';

import { saveGivingBackAction } from '@/app/(host)/create/giving-back/actions';
import { GivingBackForm } from '@/app/(host)/create/giving-back/GivingBackForm';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { listActiveCharities } from '@/lib/charities';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const givingBackErrorMessages: Record<string, string> = {
  invalid: 'Please complete the giving-back details.',
  charity_required: 'Please select a charity.',
  split_required: 'Please choose how to split the goal.',
  percentage_range: 'Set a percentage between 5% and 50%.',
  threshold_range: 'Set a fixed amount between R50 and R500.',
};

const getGivingBackErrorMessage = (error?: string) =>
  error ? (givingBackErrorMessages[error] ?? null) : null;

type GivingBackSearchParams = {
  error?: string;
};

export default async function CreateGivingBackPage({
  searchParams,
}: {
  searchParams?: Promise<GivingBackSearchParams>;
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

  const resolvedSearchParams = await searchParams;
  const errorMessage = getGivingBackErrorMessage(resolvedSearchParams?.error);

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
