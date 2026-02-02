import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = {
  MOCK_PAYMENTS: process.env.MOCK_PAYMENTS,
  MOCK_PAYMENT_WEBHOOKS: process.env.MOCK_PAYMENT_WEBHOOKS,
  MOCK_KARRI: process.env.MOCK_KARRI,
  MOCK_SENTRY: process.env.MOCK_SENTRY,
};

const restoreEnv = () => {
  if (ORIGINAL_ENV.MOCK_PAYMENTS === undefined) {
    delete process.env.MOCK_PAYMENTS;
  } else {
    process.env.MOCK_PAYMENTS = ORIGINAL_ENV.MOCK_PAYMENTS;
  }

  if (ORIGINAL_ENV.MOCK_PAYMENT_WEBHOOKS === undefined) {
    delete process.env.MOCK_PAYMENT_WEBHOOKS;
  } else {
    process.env.MOCK_PAYMENT_WEBHOOKS = ORIGINAL_ENV.MOCK_PAYMENT_WEBHOOKS;
  }

  if (ORIGINAL_ENV.MOCK_KARRI === undefined) {
    delete process.env.MOCK_KARRI;
  } else {
    process.env.MOCK_KARRI = ORIGINAL_ENV.MOCK_KARRI;
  }

  if (ORIGINAL_ENV.MOCK_SENTRY === undefined) {
    delete process.env.MOCK_SENTRY;
  } else {
    process.env.MOCK_SENTRY = ORIGINAL_ENV.MOCK_SENTRY;
  }
};

afterEach(() => {
  restoreEnv();
  vi.resetModules();
});

describe('feature flags', () => {
  it('returns true when mock payment flags are enabled', async () => {
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_PAYMENT_WEBHOOKS = 'true';

    const { isMockPayments, isMockPaymentWebhooks } = await import(
      '../../src/lib/config/feature-flags'
    );

    expect(isMockPayments()).toBe(true);
    expect(isMockPaymentWebhooks()).toBe(true);
  });

  it('reports any mock enabled when any flag is true', async () => {
    process.env.MOCK_KARRI = 'true';

    const { isAnyMockEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isAnyMockEnabled()).toBe(true);
  });

  it('reports any mock enabled when payment webhooks are mocked', async () => {
    process.env.MOCK_PAYMENT_WEBHOOKS = 'true';

    const { isAnyMockEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isAnyMockEnabled()).toBe(true);
  });

  it('payment simulator mirrors mock payments flag', async () => {
    process.env.MOCK_PAYMENTS = 'true';

    const { isPaymentSimulatorEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isPaymentSimulatorEnabled()).toBe(true);
  });

  it('deprecated isDemoMode always returns false', async () => {
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_SENTRY = 'true';

    const { isDemoMode } = await import('../../src/lib/config/feature-flags');

    expect(isDemoMode()).toBe(false);
  });
});
