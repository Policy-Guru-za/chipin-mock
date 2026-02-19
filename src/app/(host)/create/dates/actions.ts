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

const PARTY_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_PARTY_TIME = '12:00';
const JOHANNESBURG_OFFSET = '+02:00';

const toPartyDateTimeIso = (dateValue: string, timeValue?: string) => {
  if (!parseDateOnly(dateValue)) {
    return null;
  }

  const resolvedTime = timeValue?.trim() ? timeValue : DEFAULT_PARTY_TIME;
  if (!PARTY_TIME_REGEX.test(resolvedTime)) {
    return null;
  }

  const parsed = new Date(`${dateValue}T${resolvedTime}:00${JOHANNESBURG_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const isPartyDateTimeWithinRange = (isoDateTime: string) => {
  const parsed = new Date(isoDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = new Date();
  const sixMonthsFromNow = new Date(now);
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return parsed > now && parsed <= sixMonthsFromNow;
};

const datesSchema = z
  .object({
    birthdayDate: z.string().min(1, 'Birthday date is required'),
    noPartyPlanned: z.boolean().optional().default(false),
    partyDate: z.string().optional(),
    campaignEndDate: z.string().optional(),
    partyDateTimeDate: z.string().optional(),
    partyDateTimeTime: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.noPartyPlanned) {
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

    if (value.partyDateTimeTime && !value.partyDateTimeDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partyDateTimeDate'],
        message: 'Party date is required when party time is set',
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
    noPartyPlanned: formData.get('noPartyPlanned') === 'on',
    partyDate: typeof formData.get('partyDate') === 'string' ? formData.get('partyDate') : undefined,
    campaignEndDate:
      typeof formData.get('campaignEndDate') === 'string'
        ? formData.get('campaignEndDate')
        : undefined,
    partyDateTimeDate:
      typeof formData.get('partyDateTimeDate') === 'string'
        ? formData.get('partyDateTimeDate')
        : undefined,
    partyDateTimeTime:
      typeof formData.get('partyDateTimeTime') === 'string'
        ? formData.get('partyDateTimeTime')
        : undefined,
  };

  const parsed = datesSchema.safeParse(payload);
  if (!parsed.success) {
    redirect('/create/dates?error=invalid');
  }

  const birthdayDate = parsed.data.birthdayDate;
  const partyDate = parsed.data.noPartyPlanned ? birthdayDate : parsed.data.partyDate ?? '';
  const campaignEndDate = parsed.data.noPartyPlanned ? birthdayDate : parsed.data.campaignEndDate ?? '';

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

  let partyDateTime: string | null = null;
  if (!parsed.data.noPartyPlanned && parsed.data.partyDateTimeDate) {
    const parsedPartyDateTime = toPartyDateTimeIso(
      parsed.data.partyDateTimeDate,
      parsed.data.partyDateTimeTime
    );
    if (!parsedPartyDateTime) {
      redirect('/create/dates?error=party_datetime_invalid');
    }

    if (!isPartyDateTimeWithinRange(parsedPartyDateTime)) {
      redirect('/create/dates?error=party_datetime_range');
    }

    partyDateTime = parsedPartyDateTime;
  }

  await updateDreamBoardDraft(session.hostId, {
    birthdayDate,
    partyDate,
    campaignEndDate,
    partyDateTime,
  });

  redirect('/create/giving-back');
}
