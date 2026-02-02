import { parseDateOnly } from '@/lib/utils/date';

export const SA_MOBILE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;

export const isPartyDateWithinRange = (dateString: string) => {
  const date = parseDateOnly(dateString);
  if (!date) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 6);

  return date > today && date <= maxDate;
};
