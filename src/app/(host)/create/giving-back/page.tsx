import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { saveGivingBackAction } from '@/app/(host)/create/giving-back/actions';
import { GivingBackForm } from '@/app/(host)/create/giving-back/GivingBackForm';
import {
  WizardAlertBanner,
  WizardCTA,
  WizardFormCard,
  WizardPanelTitle,
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { listActiveCharities } from '@/lib/charities';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const givingBackErrorMessages: Record<string, string> = {
  invalid: 'Please complete the giving-back details.',
  charity_required: 'Please select a charity.',
  split_required: 'Please choose how to split contributions.',
  percentage_range: 'Set a percentage between 5% and 50%.',
  threshold_range: 'Set a fixed amount between R50 and R500.',
};

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
  if (!draft) {
    redirect('/create/dates');
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
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, givingBackErrorMessages);

  return (
    <>
      <WizardStepper currentStep={4} totalSteps={6} stepLabel="Giving back" />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        {!hasActiveCharities ? (
          <form action={saveGivingBackAction} className="mx-auto max-w-[940px] px-5 min-[801px]:px-12">
            <WizardFormCard>
              <WizardPanelTitle variant="form">Giving back</WizardPanelTitle>
              <p className="mb-4 text-[13px] font-light leading-relaxed text-ink-soft">
                Choose whether to share a portion of contributions with charity.
              </p>
              <WizardAlertBanner variant="warning">
                No active charities are configured. You can continue without giving back for now.
              </WizardAlertBanner>
              <WizardCTA
                backHref="/create/dates"
                submitLabel="Continue to payout setup"
                pending={false}
                error={errorMessage}
              />
            </WizardFormCard>
          </form>
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
            childName={draft.childName}
            error={errorMessage}
          />
        )}
      </Suspense>
    </>
  );
}
