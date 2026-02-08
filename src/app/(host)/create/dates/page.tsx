import { redirect } from 'next/navigation';
import { z } from 'zod';

import { DatesForm } from '@/app/(host)/create/dates/DatesForm';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  isBirthdayDateValid,
  isCampaignEndDateValid,
  isPartyDateWithinRange,
} from '@/lib/dream-boards/validation';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { parseDateOnly } from '@/lib/utils/date';

const datesSchema = z
  .object({
    birthdayDate: z.string().min(1, 'Birthday date is required'),
    partyDateEnabled: z.boolean().optional().default(false),
    partyDate: z.string().optional(),
    campaignEndDate: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.partyDateEnabled) {
      return;
    }

    if (!value.partyDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partyDate'],
        message: 'Party date is required',
      });
    }

    if (!value.campaignEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campaignEndDate'],
        message: 'Campaign end date is required',
      });
    }
  });

const datesErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required date fields.',
  birthday_date: 'Birthday date must be in the future.',
  party_date: 'Party date must be within the next 6 months.',
  campaign_end: 'Campaign end date must be on/before party date and in the future.',
  birthday_order: 'Party date must be on or after birthday date.',
};

const getDatesErrorMessage = (error?: string) => (error ? (datesErrorMessages[error] ?? null) : null);

const getDateAfterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getDefaultBirthdayDate = (birthdayDate?: string) => birthdayDate ?? getDateAfterDays(1);

export async function saveDatesAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'dates', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }

  const payload = {
    birthdayDate: formData.get('birthdayDate'),
    partyDateEnabled: formData.get('partyDateEnabled') === 'on',
    partyDate: typeof formData.get('partyDate') === 'string' ? formData.get('partyDate') : undefined,
    campaignEndDate:
      typeof formData.get('campaignEndDate') === 'string'
        ? formData.get('campaignEndDate')
        : undefined,
  };

  const parsed = datesSchema.safeParse(payload);
  if (!parsed.success) {
    redirect('/create/dates?error=invalid');
  }

  const birthdayDate = parsed.data.birthdayDate;
  const partyDate = parsed.data.partyDateEnabled ? parsed.data.partyDate ?? '' : birthdayDate;
  const campaignEndDate = parsed.data.partyDateEnabled
    ? parsed.data.campaignEndDate ?? ''
    : birthdayDate;

  if (!isBirthdayDateValid(birthdayDate)) {
    redirect('/create/dates?error=birthday_date');
  }
  if (!isPartyDateWithinRange(partyDate)) {
    redirect('/create/dates?error=party_date');
  }
  if (!isCampaignEndDateValid({ campaignEndDate, partyDate })) {
    redirect('/create/dates?error=campaign_end');
  }

  const birthdayDateObject = parseDateOnly(birthdayDate);
  const partyDateObject = parseDateOnly(partyDate);
  if (!birthdayDateObject || !partyDateObject || partyDateObject < birthdayDateObject) {
    redirect('/create/dates?error=birthday_order');
  }

  await updateDreamBoardDraft(session.hostId, {
    birthdayDate,
    partyDate,
    campaignEndDate,
  });

  redirect('/create/giving-back');
}

type DatesSearchParams = {
  error?: string;
};

export default async function CreateDatesPage({
  searchParams,
}: {
  searchParams?: DatesSearchParams;
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

  const errorMessage = getDatesErrorMessage(searchParams?.error);
  const defaultBirthdayDate = getDefaultBirthdayDate(draft.birthdayDate);
  const defaultPartyDate = draft.partyDate ?? defaultBirthdayDate;
  const defaultCampaignEndDate = draft.campaignEndDate ?? defaultPartyDate;
  const defaultPartyDateEnabled = Boolean(
    draft.birthdayDate &&
      draft.partyDate &&
      draft.campaignEndDate &&
      (draft.partyDate !== draft.birthdayDate || draft.campaignEndDate !== draft.birthdayDate)
  );

  return (
    <CreateFlowShell
      currentStep={3}
      totalSteps={6}
      stepLabel={view.stepLabel}
      title={view.title}
      subtitle="Set the celebration dates."
    >
      <Card>
        <CardHeader>
          <CardTitle>The dates</CardTitle>
          <CardDescription>Set the birthday, party, and campaign timeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
          <DatesForm
            action={saveDatesAction}
            defaultBirthdayDate={defaultBirthdayDate}
            defaultPartyDate={defaultPartyDate}
            defaultCampaignEndDate={defaultCampaignEndDate}
            defaultPartyDateEnabled={defaultPartyDateEnabled}
          />
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
