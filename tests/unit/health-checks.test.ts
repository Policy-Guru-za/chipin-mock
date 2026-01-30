import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  checkKv,
  checkGivenGainAutomation,
  checkKarriAutomation,
  checkTakealotGiftCards,
} from '@/lib/health/checks';
import { kvAdapter } from '@/lib/demo/kv-adapter';

describe('health checks', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
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

  it('flags missing Takealot gift card configuration', async () => {
    process.env.TAKEALOT_GIFTCARD_AUTOMATION_ENABLED = 'true';
    process.env.TAKEALOT_GIFTCARD_API_URL = '';
    process.env.TAKEALOT_GIFTCARD_API_KEY = '';
    const result = await checkTakealotGiftCards();
    expect(result.ok).toBe(false);
  });

  it('returns disabled when Takealot automation is off', async () => {
    process.env.TAKEALOT_GIFTCARD_AUTOMATION_ENABLED = 'false';
    const result = await checkTakealotGiftCards();
    expect(result.ok).toBe(true);
    expect(result.detail).toBe('disabled');
  });

  it('flags missing GivenGain configuration', async () => {
    process.env.GIVENGAIN_AUTOMATION_ENABLED = 'true';
    process.env.GIVENGAIN_API_URL = '';
    process.env.GIVENGAIN_API_KEY = '';
    const result = await checkGivenGainAutomation();
    expect(result.ok).toBe(false);
  });

  it('returns disabled when GivenGain automation is off', async () => {
    process.env.GIVENGAIN_AUTOMATION_ENABLED = 'false';
    const result = await checkGivenGainAutomation();
    expect(result.ok).toBe(true);
    expect(result.detail).toBe('disabled');
  });

  it('returns demo when checking KV in demo mode', async () => {
    process.env.DEMO_MODE = 'true';
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const kvGetSpy = vi.spyOn(kvAdapter, 'get');
    const result = await checkKv();

    expect(result.ok).toBe(true);
    expect(result.detail).toBe('demo');
    expect(kvGetSpy).not.toHaveBeenCalled();
    kvGetSpy.mockRestore();
  });

  it('checks KV when configured outside demo mode', async () => {
    delete process.env.DEMO_MODE;
    process.env.KV_REST_API_URL = 'https://kv.test';
    process.env.KV_REST_API_TOKEN = 'token';

    const kvGetSpy = vi.spyOn(kvAdapter, 'get').mockResolvedValueOnce(null);
    const result = await checkKv();

    expect(result.ok).toBe(true);
    expect(kvGetSpy).toHaveBeenCalledWith('health:ping');
    kvGetSpy.mockRestore();
  });
});
