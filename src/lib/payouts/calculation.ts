export type PayoutCalculation = {
  raisedCents: number;
  giftCents: number;
  charityCents: number;
  platformFeeCents: number;
  payoutFeeCents: number;
};

export const calculatePayoutTotals = (params: {
  raisedCents: number;
  platformFeeCents: number;
  charityCents?: number;
  payoutFeeCents?: number;
}): PayoutCalculation => {
  const payoutFeeCents = params.payoutFeeCents ?? 0;
  const raisedCents = Math.max(0, params.raisedCents);
  const charityCents = Math.max(0, params.charityCents ?? 0);
  const boundedCharityCents = Math.min(charityCents, raisedCents);
  const giftCents = Math.max(0, raisedCents - boundedCharityCents);

  return {
    raisedCents,
    giftCents,
    charityCents: boundedCharityCents,
    platformFeeCents: Math.max(0, params.platformFeeCents),
    payoutFeeCents,
  };
};
