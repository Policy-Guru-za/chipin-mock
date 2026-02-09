import { redirect } from 'next/navigation';
import { z } from 'zod';

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
