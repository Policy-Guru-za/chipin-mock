export type PayoutCalculation = {
  raisedCents: number;
  giftCents: number;
  platformFeeCents: number;
  payoutFeeCents: number;
};

export const calculatePayoutTotals = (params: {
  raisedCents: number;
  platformFeeCents: number;
  payoutFeeCents?: number;
}): PayoutCalculation => {
  const payoutFeeCents = params.payoutFeeCents ?? 0;
  const raisedCents = Math.max(0, params.raisedCents);
  const giftCents = raisedCents;

  return {
    raisedCents,
    giftCents,
    platformFeeCents: Math.max(0, params.platformFeeCents),
    payoutFeeCents,
  };
};
