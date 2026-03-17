import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';

const SLASH_DATE_ONLY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const toIsoDateOnlyCandidate = (value: string) => {
  const slashMatch = value.match(SLASH_DATE_ONLY_REGEX);
  if (!slashMatch) {
    return value;
  }

  const [, day, month, year] = slashMatch;
  return `${year}-${month}-${day}`;
};

export const normalizeCreateFlowDateOnlyInput = (value?: string | Date | null): string | null => {
  if (!value) return null;

  if (value instanceof Date) {
    const parsed = parseDateOnly(value);
    return parsed ? formatDateOnly(parsed) : null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = parseDateOnly(toIsoDateOnlyCandidate(trimmed));
  return parsed ? formatDateOnly(parsed) : null;
};
