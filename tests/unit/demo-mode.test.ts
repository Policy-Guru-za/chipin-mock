import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = {
  MOCK_KARRI: process.env.MOCK_KARRI,
  MOCK_SENTRY: process.env.MOCK_SENTRY,
};

const restoreEnv = () => {
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
  it('returns true when mock karri and sentry flags are enabled', async () => {
    process.env.MOCK_KARRI = 'true';
    process.env.MOCK_SENTRY = 'true';

    const { isMockKarri, isMockSentry } = await import('../../src/lib/config/feature-flags');

    expect(isMockKarri()).toBe(true);
    expect(isMockSentry()).toBe(true);
  });

  it('reports any mock enabled when any flag is true', async () => {
    process.env.MOCK_KARRI = 'true';

    const { isAnyMockEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isAnyMockEnabled()).toBe(true);
  });

  it('reports any mock enabled when sentry is mocked', async () => {
    process.env.MOCK_SENTRY = 'true';

    const { isAnyMockEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isAnyMockEnabled()).toBe(true);
  });

  it('reports no mocks enabled when specific flags are off', async () => {
    process.env.MOCK_KARRI = 'false';
    process.env.MOCK_SENTRY = 'false';

    const { isAnyMockEnabled } = await import('../../src/lib/config/feature-flags');

    expect(isAnyMockEnabled()).toBe(false);
  });

  it('deprecated isDemoMode always returns false', async () => {
    process.env.MOCK_SENTRY = 'true';

    const { isDemoMode } = await import('../../src/lib/config/feature-flags');

    expect(isDemoMode()).toBe(false);
  });
});
