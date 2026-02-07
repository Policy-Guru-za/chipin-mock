const isEnabled = (value: string | undefined): boolean => value === 'true';

export const isBankWritePathEnabled = (): boolean =>
  isEnabled(process.env.UX_V2_ENABLE_BANK_WRITE_PATH);

export const isCharityWritePathEnabled = (): boolean =>
  isEnabled(process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH);

export const resolveWritePathBlockReason = (params: {
  bankRequested: boolean;
  charityRequested: boolean;
}) => {
  if (params.bankRequested && !isBankWritePathEnabled()) {
    return 'Bank payout method is not yet enabled';
  }

  if (params.charityRequested && !isCharityWritePathEnabled()) {
    return 'Charity configuration is not yet enabled';
  }

  return null;
};
