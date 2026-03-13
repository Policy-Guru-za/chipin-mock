import { afterEach, describe, expect, it, vi } from 'vitest';

const kvMocks = vi.hoisted(() => ({
  kvAdapter: { get: vi.fn() },
}));

vi.mock('@/lib/demo/kv-adapter', () => kvMocks);

import { checkKarriAutomation, checkKv } from '@/lib/health/checks';

describe('health checks', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    kvMocks.kvAdapter.get.mockReset();
  });

  it('returns disabled when karri write path and automation are off', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'false';
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(true);
    expect(result.detail).toBe('disabled');
  });

  it('flags missing karri configuration when write path is enabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    process.env.MOCK_KARRI = 'false';
    process.env.KARRI_BASE_URL = '';
    process.env.KARRI_API_KEY = '';
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(false);
  });

  it('flags missing karri encryption key when write path is enabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    process.env.MOCK_KARRI = 'false';
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    delete process.env.CARD_DATA_ENCRYPTION_KEY;
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(false);
  });

  it('reports mock when karri write path is enabled in mock mode', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    process.env.MOCK_KARRI = 'true';
    process.env.KARRI_BASE_URL = '';
    process.env.KARRI_API_KEY = '';
    delete process.env.CARD_DATA_ENCRYPTION_KEY;
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(true);
    expect(result.detail).toBe('mock');
  });

  it('confirms karri readiness when write path is enabled and configured', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    process.env.MOCK_KARRI = 'false';
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(true);
  });

  it('flags missing KV credentials', async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const kvGetSpy = kvMocks.kvAdapter.get;
    const result = await checkKv();

    expect(result.ok).toBe(false);
    expect(result.detail).toContain('KV_REST_API_URL');
    expect(kvGetSpy).not.toHaveBeenCalled();
  });

  it('checks KV when configured', async () => {
    process.env.KV_REST_API_URL = 'https://kv.test';
    process.env.KV_REST_API_TOKEN = 'token';

    const kvGetSpy = kvMocks.kvAdapter.get.mockResolvedValueOnce(null);
    const result = await checkKv();

    expect(result.ok).toBe(true);
    expect(kvGetSpy).toHaveBeenCalledWith('health:ping');
  });
});
