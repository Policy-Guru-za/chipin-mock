/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  clearPaymentAttemptData,
  getPaymentAttemptData,
  savePaymentAttemptData,
} from '@/lib/payments/recovery';

const slug = 'maya-board';

afterEach(() => {
  sessionStorage.clear();
});

describe('payment recovery write contract', () => {
  it('stores paymentProvider on save', () => {
    savePaymentAttemptData(slug, {
      amountCents: 25000,
      paymentProvider: 'payfast',
      attemptedMethod: 'payfast',
      displayName: 'Ava',
      message: 'Happy birthday',
      isAnonymous: false,
      reason: null,
    });

    const raw = sessionStorage.getItem(`gifta_payment_failed_${slug}`);
    expect(raw).toContain('"paymentProvider":"payfast"');
  });

  it('reads stored paymentProvider through getPaymentAttemptData', () => {
    savePaymentAttemptData(slug, {
      amountCents: 25000,
      paymentProvider: 'ozow',
      attemptedMethod: 'ozow',
      displayName: null,
      message: null,
      isAnonymous: true,
      reason: 'declined',
    });

    const attempt = getPaymentAttemptData(slug);
    expect(attempt?.paymentProvider).toBe('ozow');
    expect(attempt?.attemptedMethod).toBe('ozow');
  });

  it('keeps legacy attemptedMethod values readable when paymentProvider is absent', () => {
    sessionStorage.setItem(
      `gifta_payment_failed_${slug}`,
      JSON.stringify({
        amountCents: 30000,
        attemptedMethod: 'snapscan',
        displayName: null,
        message: null,
        isAnonymous: true,
        reason: null,
        timestamp: Date.now(),
      })
    );

    const attempt = getPaymentAttemptData(slug);
    expect(attempt?.paymentProvider).toBe('snapscan');
    expect(attempt?.attemptedMethod).toBe('snapscan');
  });

  it('expires stale records after 30 minutes', () => {
    sessionStorage.setItem(
      `gifta_payment_failed_${slug}`,
      JSON.stringify({
        amountCents: 30000,
        paymentProvider: 'payfast',
        attemptedMethod: 'payfast',
        displayName: null,
        message: null,
        isAnonymous: true,
        reason: null,
        timestamp: Date.now() - 31 * 60 * 1000,
      })
    );

    expect(getPaymentAttemptData(slug)).toBeNull();
  });

  it('clears stored attempts', () => {
    savePaymentAttemptData(slug, {
      amountCents: 25000,
      paymentProvider: 'payfast',
      attemptedMethod: 'payfast',
      displayName: 'Ava',
      message: null,
      isAnonymous: false,
      reason: null,
    });

    clearPaymentAttemptData(slug);
    expect(getPaymentAttemptData(slug)).toBeNull();
  });
});
