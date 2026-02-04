import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const initSpy = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  init: initSpy,
}));

const ORIGINAL_ENV = { ...process.env };

describe('Sentry config gating', () => {
  beforeEach(() => {
    initSpy.mockClear();
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('skips Sentry init when MOCK_SENTRY=true', async () => {
    process.env.MOCK_SENTRY = 'true';
    process.env.SENTRY_DSN = 'https://dsn.example/1';

    await import('../../sentry.server.config');
    await import('../../sentry.client.config');
    await import('../../sentry.edge.config');

    expect(initSpy).not.toHaveBeenCalled();
  });

  it('initializes Sentry when MOCK_SENTRY is not set', async () => {
    delete process.env.MOCK_SENTRY;
    process.env.SENTRY_DSN = 'https://dsn.example/1';

    await import('../../sentry.server.config');

    expect(initSpy).toHaveBeenCalled();
  });
});
