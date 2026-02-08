import { describe, expect, it } from 'vitest';

import { calculatePayoutTotals } from '@/lib/payouts/calculation';

describe('calculatePayoutTotals', () => {
  it('applies platform fee before computing gift payout net', () => {
    const result = calculatePayoutTotals({
      raisedCents: 12000,
      platformFeeCents: 600,
    });

    expect(result.giftCents).toBe(11400);
    expect(result.charityCents).toBe(0);
    expect(result.platformFeeCents).toBe(600);
    expect(result.raisedCents - result.platformFeeCents - result.charityCents).toBe(result.giftCents);
  });

  it('splits gift and charity payouts when charity total exists', () => {
    const result = calculatePayoutTotals({
      raisedCents: 12000,
      platformFeeCents: 600,
      charityCents: 3200,
    });

    expect(result.giftCents).toBe(8200);
    expect(result.charityCents).toBe(3200);
    expect(result.raisedCents - result.platformFeeCents - result.charityCents).toBe(result.giftCents);
  });

  it('handles zero and negative raised totals', () => {
    const result = calculatePayoutTotals({
      raisedCents: -4500,
      platformFeeCents: 200,
      charityCents: 1000,
    });

    expect(result.giftCents).toBe(0);
    expect(result.charityCents).toBe(0);
    expect(result.raisedCents).toBe(0);
  });

  it('caps charity to the post-fee distributable amount', () => {
    const result = calculatePayoutTotals({
      raisedCents: 2000,
      platformFeeCents: 1500,
      charityCents: 700,
    });

    expect(result.giftCents).toBe(0);
    expect(result.charityCents).toBe(500);
    expect(result.raisedCents - result.platformFeeCents - result.charityCents).toBe(result.giftCents);
  });

  it('returns zero charity when platform fee consumes all raised cents', () => {
    const result = calculatePayoutTotals({
      raisedCents: 1000,
      platformFeeCents: 1000,
      charityCents: 200,
    });

    expect(result.giftCents).toBe(0);
    expect(result.charityCents).toBe(0);
    expect(result.raisedCents - result.platformFeeCents - result.charityCents).toBe(0);
  });
});
