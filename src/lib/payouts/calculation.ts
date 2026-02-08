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
  const boundedPlatformFeeCents = Math.min(Math.max(0, params.platformFeeCents), raisedCents);
  const distributableCents = Math.max(0, raisedCents - boundedPlatformFeeCents);
  const charityCents = Math.max(0, params.charityCents ?? 0);
  const boundedCharityCents = Math.min(charityCents, distributableCents);
  const giftCents = Math.max(0, distributableCents - boundedCharityCents);

  return {
    raisedCents,
    giftCents,
    charityCents: boundedCharityCents,
    platformFeeCents: boundedPlatformFeeCents,
    payoutFeeCents,
  };
};
