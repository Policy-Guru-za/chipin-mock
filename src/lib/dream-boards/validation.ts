import { parseDateOnly } from '@/lib/utils/date';

export const SA_MOBILE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
const BANK_ACCOUNT_NUMBER_REGEX = /^\d{6,20}$/;

export const isBankAccountNumberValid = (accountNumber: string) =>
  BANK_ACCOUNT_NUMBER_REGEX.test(accountNumber);

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

export const isBirthdayDateValid = (dateString: string) => {
  const date = parseDateOnly(dateString);
  if (!date) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date > today;
};

export const isCampaignEndDateValid = (params: {
  campaignEndDate: string;
  partyDate: string;
}) => {
  const campaignEndDate = parseDateOnly(params.campaignEndDate);
  const partyDate = parseDateOnly(params.partyDate);
  if (!campaignEndDate || !partyDate) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return campaignEndDate > today && campaignEndDate <= partyDate;
};
