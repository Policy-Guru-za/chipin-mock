import { describe, expect, it } from 'vitest';

import { getFailureDisplay } from '@/lib/payments/failure-display';

describe('getFailureDisplay', () => {
  it('returns declined message', () => {
    const display = getFailureDisplay('declined');
    expect(display.heading).toBe("Payment Didn't Go Through");
    expect(display.explanations).toContain('Card was declined by your bank');
  });

  it('returns insufficient funds message', () => {
    const display = getFailureDisplay('insufficient_funds');
    expect(display.message).toContain("weren't enough funds");
    expect(display.explanations).toEqual(['Insufficient funds']);
  });

  it('returns network error message', () => {
    const display = getFailureDisplay('network_error');
    expect(display.heading).toBe('Connection Issue');
    expect(display.explanations).toEqual(['Connection interrupted']);
  });

  it('returns invalid card message', () => {
    const display = getFailureDisplay('invalid_card');
    expect(display.heading).toBe('Card Details Invalid');
    expect(display.explanations).toContain('CVV/security code is incorrect');
  });

  it('returns timeout message', () => {
    const display = getFailureDisplay('timeout');
    expect(display.heading).toBe('Payment Timeout');
    expect(display.explanations).toEqual(['Connection timed out']);
  });

  it('returns cancelled message', () => {
    const display = getFailureDisplay('user_cancelled');
    expect(display.heading).toBe('Payment Cancelled');
    expect(display.explanations).toEqual([]);
  });

  it('returns default message for unknown reasons', () => {
    const display = getFailureDisplay();
    expect(display.heading).toBe("Payment Didn't Go Through");
    expect(display.explanations).toHaveLength(4);
  });
});
