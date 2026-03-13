const isEnabled = (value: string | undefined): boolean => value === 'true';

export const isKarriWritePathEnabled = (): boolean =>
  isEnabled(process.env.UX_V2_ENABLE_KARRI_WRITE_PATH);

export const isBankWritePathEnabled = (): boolean =>
  isEnabled(process.env.UX_V2_ENABLE_BANK_WRITE_PATH);

// Legacy no-op: active Dreamboard flows no longer support charity configuration writes.
export const isCharityWritePathEnabled = (): boolean => false;

export const isKarriAutomationEnabled = (): boolean =>
  isEnabled(process.env.KARRI_AUTOMATION_ENABLED);

export const isKarriConfigurationRequired = (): boolean =>
  isKarriWritePathEnabled() || isKarriAutomationEnabled();

export const resolveWritePathBlockReason = (params: {
  karriRequested: boolean;
  bankRequested: boolean;
  charityRequested: boolean;
}) => {
  if (params.karriRequested && !isKarriWritePathEnabled()) {
    return 'Karri payout method is not enabled';
  }

  if (params.bankRequested && !isBankWritePathEnabled()) {
    return 'Bank payout method is not yet enabled';
  }

  if (params.charityRequested && !isCharityWritePathEnabled()) {
    return 'Charity configuration is not yet enabled';
  }

  return null;
};
