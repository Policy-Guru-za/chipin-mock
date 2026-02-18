import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { saveDatesAction } from '@/app/(host)/create/dates/actions';
import { DatesForm } from '@/app/(host)/create/dates/DatesForm';
import {
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const datesErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required date fields.',
  birthday_date: 'Birthday date must be in the future.',
  party_date: 'Party date must be within the next 6 months.',
  campaign_end: 'Campaign end date must be on/before party date and in the future.',
  birthday_order: 'Party date must be on or after birthday date.',
  party_datetime_invalid: 'Enter a valid birthday party date and time.',
  party_datetime_range: 'Birthday party date and time must be in the future and within 6 months.',
};

const getDateAfterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getDefaultBirthdayDate = (birthdayDate?: string) => birthdayDate ?? getDateAfterDays(1);
const SA_OFFSET_MS = 2 * 60 * 60 * 1000;

const getPartyDateTimeDefaults = (partyDateTime?: string | null) => {
  if (!partyDateTime) {
    return { date: '', time: '' };
  }

  const parsed = new Date(partyDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const johannesburgTime = new Date(parsed.getTime() + SA_OFFSET_MS).toISOString();
  return {
    date: johannesburgTime.slice(0, 10),
    time: johannesburgTime.slice(11, 16),
  };
};

type DatesSearchParams = {
  error?: string;
};

export default async function CreateDatesPage({
  searchParams,
}: {
  searchParams?: Promise<DatesSearchParams>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'dates', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/gift');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, datesErrorMessages);
  const defaultBirthdayDate = getDefaultBirthdayDate(draft.birthdayDate);
  const defaultPartyDate = draft.partyDate ?? defaultBirthdayDate;
  const defaultCampaignEndDate = draft.campaignEndDate ?? defaultPartyDate;
  const partyDateTimeDefaults = getPartyDateTimeDefaults(draft.partyDateTime);
  const defaultPartyDateEnabled = Boolean(
    draft.birthdayDate &&
      draft.partyDate &&
      draft.campaignEndDate &&
      (draft.partyDate !== draft.birthdayDate || draft.campaignEndDate !== draft.birthdayDate)
  );

  return (
    <>
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <DatesForm
          action={saveDatesAction}
          defaultBirthdayDate={defaultBirthdayDate}
          defaultPartyDate={defaultPartyDate}
          defaultCampaignEndDate={defaultCampaignEndDate}
          defaultPartyDateTimeDate={partyDateTimeDefaults.date}
          defaultPartyDateTimeTime={partyDateTimeDefaults.time}
          defaultPartyDateEnabled={defaultPartyDateEnabled}
          childName={draft.childName ?? ''}
          childAge={draft.childAge ?? 0}
          error={errorMessage}
        />
      </Suspense>
    </>
  );
}
