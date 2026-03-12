import { describe, expect, it } from 'vitest';

import { calculateFee, calculateTotalWithFee } from '../../src/lib/payments/fees';

describe('payment fee helpers', () => {
  it('keeps new contribution fees at zero', () => {
    const contributionCents = 20000;
    const feeCents = calculateFee(contributionCents);
    expect(feeCents).toBe(0);
    expect(calculateTotalWithFee(contributionCents)).toBe(contributionCents + feeCents);
  });
});
