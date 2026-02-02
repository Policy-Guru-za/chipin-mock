import { describe, expect, it } from 'vitest';

import { calculatePayoutTotals } from '@/lib/payouts/calculation';

describe('calculatePayoutTotals', () => {
  it('allocates all raised cents to the gift payout', () => {
    const result = calculatePayoutTotals({
      raisedCents: 12000,
      platformFeeCents: 600,
    });

    expect(result.giftCents).toBe(12000);
    expect(result.platformFeeCents).toBe(600);
  });

  it('handles zero and negative raised totals', () => {
    const result = calculatePayoutTotals({
      raisedCents: -4500,
      platformFeeCents: 200,
    });

    expect(result.giftCents).toBe(0);
    expect(result.raisedCents).toBe(0);
  });
});
