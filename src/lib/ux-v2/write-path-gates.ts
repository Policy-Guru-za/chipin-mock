const isEnabled = (value: string | undefined): boolean => value === 'true';

export const isKarriWritePathEnabled = (): boolean => true;

export const isBankWritePathEnabled = (): boolean => true;

export const isPayoutDataEncryptionRequired = (): boolean =>
  isBankWritePathEnabled() || isKarriWritePathEnabled();

// Legacy no-op: active Dreamboard flows no longer support charity configuration writes.
export const isCharityWritePathEnabled = (): boolean => false;

export const isKarriAutomationEnabled = (): boolean =>
  isEnabled(process.env.KARRI_AUTOMATION_ENABLED);

export const isKarriConfigurationRequired = (): boolean =>
  isKarriAutomationEnabled();

export const resolveWritePathBlockReason = (params: {
  karriRequested: boolean;
  bankRequested: boolean;
  charityRequested: boolean;
}) => {
  if (params.charityRequested && !isCharityWritePathEnabled()) {
    return 'Charity configuration is not yet enabled';
  }

  return null;
};
