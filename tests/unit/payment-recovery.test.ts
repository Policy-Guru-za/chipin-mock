/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  clearPaymentAttemptData,
  getPaymentAttemptData,
  savePaymentAttemptData,
  type PaymentAttemptData,
} from '@/lib/payments/recovery';

const slug = 'maya-board';

const attempt: PaymentAttemptData = {
  amountCents: 5000,
  paymentProvider: 'payfast',
  displayName: 'Ava',
  message: 'Happy birthday',
  isAnonymous: false,
  attemptedMethod: 'payfast',
  reason: 'declined',
};

afterEach(() => {
  sessionStorage.clear();
});

describe('payment recovery storage', () => {
  it('savePaymentAttemptData stores payload in sessionStorage', () => {
    savePaymentAttemptData(slug, attempt);
    expect(sessionStorage.getItem(`gifta_payment_failed_${slug}`)).toContain('"amountCents":5000');
  });

  it('getPaymentAttemptData retrieves valid payload', () => {
    savePaymentAttemptData(slug, attempt);
    const stored = getPaymentAttemptData(slug);
    expect(stored?.displayName).toBe('Ava');
    expect(stored?.reason).toBe('declined');
    expect(stored?.paymentProvider).toBe('payfast');
  });

  it('getPaymentAttemptData expires payload older than 30 minutes', () => {
    sessionStorage.setItem(
      `gifta_payment_failed_${slug}`,
      JSON.stringify({
        ...attempt,
        timestamp: Date.now() - 31 * 60 * 1000,
      })
    );

    const stored = getPaymentAttemptData(slug);
    expect(stored).toBeNull();
    expect(sessionStorage.getItem(`gifta_payment_failed_${slug}`)).toBeNull();
  });

  it('getPaymentAttemptData returns null when no data exists', () => {
    expect(getPaymentAttemptData(slug)).toBeNull();
  });

  it('clearPaymentAttemptData removes payload', () => {
    savePaymentAttemptData(slug, attempt);
    clearPaymentAttemptData(slug);
    expect(sessionStorage.getItem(`gifta_payment_failed_${slug}`)).toBeNull();
  });

  it('all functions handle SSR safely', () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    });

    expect(() => savePaymentAttemptData(slug, attempt)).not.toThrow();
    expect(getPaymentAttemptData(slug)).toBeNull();
    expect(() => clearPaymentAttemptData(slug)).not.toThrow();

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    });
  });
});
