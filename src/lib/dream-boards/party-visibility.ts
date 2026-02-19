import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';

import { formatPartyDateTime } from './party-date-time';

type PartyVisibilityInput = {
  birthdayDate?: string | Date | null;
  partyDate?: string | Date | null;
  partyDateTime?: string | Date | null;
};

const formatPartyDateOnly = (value?: string | Date | null) => {
  const parsed = parseDateOnly(value ?? undefined);
  if (!parsed) return null;

  return parsed.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const hasBirthdayParty = (input: PartyVisibilityInput): boolean => {
  const partyDateTimeLabel = formatPartyDateTime(input.partyDateTime);
  if (partyDateTimeLabel) {
    return true;
  }

  const birthdayDate = parseDateOnly(input.birthdayDate ?? undefined);
  const partyDate = parseDateOnly(input.partyDate ?? undefined);

  if (!birthdayDate || !partyDate) {
    return false;
  }

  return formatDateOnly(partyDate) !== formatDateOnly(birthdayDate);
};

export const formatBirthdayPartyLine = (input: PartyVisibilityInput): string | null => {
  const partyDateTimeLabel = formatPartyDateTime(input.partyDateTime);
  if (partyDateTimeLabel) {
    return partyDateTimeLabel;
  }

  if (!hasBirthdayParty(input)) {
    return null;
  }

  return formatPartyDateOnly(input.partyDate);
};
