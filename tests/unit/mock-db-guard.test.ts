import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const restoreEnv = () => {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
};

const loadModule = async () => {
  vi.resetModules();
  return import('../../src/lib/config/feature-flags');
};

afterEach(() => {
  restoreEnv();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('assertNotProductionDb', () => {
  it('skips checks when mocks are disabled', async () => {
    process.env.MOCK_PAYMENTS = 'false';
    process.env.MOCK_KARRI = 'false';

    const { assertNotProductionDb } = await loadModule();

    expect(() => assertNotProductionDb()).not.toThrow();
  });

  it('throws when mock mode is enabled without DATABASE_URL', async () => {
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_KARRI = 'false';
    process.env.DATABASE_URL = '';

    const { assertNotProductionDb } = await loadModule();

    expect(() => assertNotProductionDb()).toThrow(/DATABASE_URL/);
  });

  it('throws when mock mode targets a production database', async () => {
    process.env.MOCK_PAYMENTS = 'false';
    process.env.MOCK_KARRI = 'true';
    process.env.DATABASE_URL = 'postgres://user:pass@prod.db.example.com/chipin';

    const { assertNotProductionDb } = await loadModule();

    expect(() => assertNotProductionDb()).toThrow(/production database/i);
  });

  it('allows mock mode with a non-production database', async () => {
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_KARRI = 'false';
    process.env.DATABASE_URL = 'postgres://user:pass@staging.db.example.com/chipin';

    const { assertNotProductionDb } = await loadModule();

    expect(() => assertNotProductionDb()).not.toThrow();
  });
});
