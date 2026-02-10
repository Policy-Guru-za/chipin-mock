export const getPayoutQueueErrorMessage = (error: string | null) => {
  if (!error) return null;
  if (error === 'no-contributions') {
    return 'No contributions collected yet for that Dreamboard.';
  }
  return 'Action failed. Please retry or check the payout details.';
};
