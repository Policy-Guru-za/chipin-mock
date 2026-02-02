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

  it('returns disabled when Karri automation is off', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(true);
    expect(result.detail).toBe('disabled');
  });

  it('flags missing Karri configuration when enabled', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
    process.env.KARRI_BASE_URL = '';
    process.env.KARRI_API_KEY = '';
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(false);
  });

  it('flags missing Karri encryption key when enabled', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    delete process.env.CARD_DATA_ENCRYPTION_KEY;
    const result = await checkKarriAutomation();
    expect(result.ok).toBe(false);
  });

  it('confirms Karri automation when configured', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
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
