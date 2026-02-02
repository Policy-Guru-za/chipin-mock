import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const restoreEnv = () => {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
};

const setBaseEnv = () => {
  process.env.RESEND_API_KEY = 'resend-key';
  process.env.BLOB_READ_WRITE_TOKEN = 'blob-token';
  process.env.KV_REST_API_URL = 'https://kv.test';
  process.env.KV_REST_API_TOKEN = 'kv-token';
};

const clearPaymentEnv = () => {
  process.env.PAYFAST_MERCHANT_ID = '';
  process.env.PAYFAST_MERCHANT_KEY = '';
  process.env.OZOW_CLIENT_ID = '';
  process.env.OZOW_CLIENT_SECRET = '';
  process.env.OZOW_SITE_CODE = '';
  process.env.OZOW_BASE_URL = '';
  process.env.OZOW_WEBHOOK_SECRET = '';
  process.env.SNAPSCAN_SNAPCODE = '';
  process.env.SNAPSCAN_WEBHOOK_AUTH_KEY = '';
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

describe('startup config validation', () => {
  it('skips payment provider checks when mock payments are enabled', async () => {
    setBaseEnv();
    clearPaymentEnv();
    process.env.NODE_ENV = 'production';
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_KARRI = 'true';

    const { assertStartupConfig } = await loadModule();

    expect(() => assertStartupConfig()).not.toThrow();
  });

  it('throws when no payment providers are configured and mock payments are disabled', async () => {
    setBaseEnv();
    clearPaymentEnv();
    process.env.NODE_ENV = 'production';
    process.env.MOCK_PAYMENTS = 'false';
    process.env.MOCK_KARRI = 'true';

    const { assertStartupConfig } = await loadModule();

    expect(() => assertStartupConfig()).toThrow(/No payment providers configured/);
  });

  it('throws when payfast is partially configured', async () => {
    setBaseEnv();
    clearPaymentEnv();
    process.env.NODE_ENV = 'production';
    process.env.MOCK_PAYMENTS = 'false';
    process.env.MOCK_KARRI = 'true';
    process.env.PAYFAST_MERCHANT_ID = '10000100';
    process.env.PAYFAST_MERCHANT_KEY = '';

    const { assertStartupConfig } = await loadModule();

    expect(() => assertStartupConfig()).toThrow(/PAYFAST_MERCHANT_KEY/);
  });

  it('throws when karri is required but missing', async () => {
    setBaseEnv();
    clearPaymentEnv();
    process.env.NODE_ENV = 'production';
    process.env.MOCK_PAYMENTS = 'true';
    process.env.MOCK_KARRI = 'false';
    process.env.KARRI_BASE_URL = '';
    process.env.KARRI_API_KEY = '';

    const { assertStartupConfig } = await loadModule();

    expect(() => assertStartupConfig()).toThrow(/Karri configuration incomplete/);
  });

  it('warns instead of throwing in development', async () => {
    setBaseEnv();
    clearPaymentEnv();
    process.env.NODE_ENV = 'development';
    process.env.MOCK_PAYMENTS = 'false';
    process.env.MOCK_KARRI = 'true';
    process.env.RESEND_API_KEY = '';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { assertStartupConfig } = await loadModule();

    expect(() => assertStartupConfig()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});
