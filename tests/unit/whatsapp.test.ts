import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loggerMocks = vi.hoisted(() => ({
  log: vi.fn(),
}));

vi.mock('@/lib/observability/logger', () => loggerMocks);

import { sendDreamBoardLink } from '@/lib/integrations/whatsapp';

const originalEnv = {
  WA_API_BASE_URL: process.env.WA_API_BASE_URL,
  WA_API_VERSION: process.env.WA_API_VERSION,
  WA_ACCESS_TOKEN: process.env.WA_ACCESS_TOKEN,
  WA_PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID,
  WA_TEMPLATE_LANGUAGE: process.env.WA_TEMPLATE_LANGUAGE,
  WHATSAPP_BUSINESS_API_URL: process.env.WHATSAPP_BUSINESS_API_URL,
  WHATSAPP_BUSINESS_API_TOKEN: process.env.WHATSAPP_BUSINESS_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
};

beforeEach(() => {
  process.env.WA_API_BASE_URL = 'https://graph.facebook.test';
  process.env.WA_API_VERSION = 'v99.0';
  process.env.WA_ACCESS_TOKEN = 'token';
  process.env.WA_PHONE_NUMBER_ID = '123';
  process.env.WA_TEMPLATE_LANGUAGE = 'en_US';
  delete process.env.WHATSAPP_BUSINESS_API_URL;
  delete process.env.WHATSAPP_BUSINESS_API_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
});

afterEach(() => {
  process.env.WA_API_BASE_URL = originalEnv.WA_API_BASE_URL;
  process.env.WA_API_VERSION = originalEnv.WA_API_VERSION;
  process.env.WA_ACCESS_TOKEN = originalEnv.WA_ACCESS_TOKEN;
  process.env.WA_PHONE_NUMBER_ID = originalEnv.WA_PHONE_NUMBER_ID;
  process.env.WA_TEMPLATE_LANGUAGE = originalEnv.WA_TEMPLATE_LANGUAGE;
  process.env.WHATSAPP_BUSINESS_API_URL = originalEnv.WHATSAPP_BUSINESS_API_URL;
  process.env.WHATSAPP_BUSINESS_API_TOKEN = originalEnv.WHATSAPP_BUSINESS_API_TOKEN;
  process.env.WHATSAPP_PHONE_NUMBER_ID = originalEnv.WHATSAPP_PHONE_NUMBER_ID;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('whatsapp integration', () => {
  it('sends a dream board link template using modern WA_* env vars', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({ messages: [{ id: 'wamid-1' }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await sendDreamBoardLink('082 123 4567', 'https://chipin.co.za/maya', 'Maya');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.test/v99.0/123/messages');

    const payload = JSON.parse(options.body as string);
    expect(payload.to).toBe('+27821234567');
    expect(payload.template.name).toBe('dream_board_created');
    expect(payload.template.language.code).toBe('en_US');
    expect(payload.template.components[0].parameters.map((param: { text: string }) => param.text))
      .toEqual(['Maya', 'https://chipin.co.za/maya']);
  });

  it('falls back to legacy WHATSAPP_BUSINESS_* env vars', async () => {
    delete process.env.WA_API_BASE_URL;
    delete process.env.WA_API_VERSION;
    delete process.env.WA_ACCESS_TOKEN;
    delete process.env.WA_PHONE_NUMBER_ID;
    process.env.WHATSAPP_BUSINESS_API_URL = 'https://legacy.facebook.test/v1';
    process.env.WHATSAPP_BUSINESS_API_TOKEN = 'legacy-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '987';

    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({ messages: [{ id: 'wamid-2' }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await sendDreamBoardLink('0821234567', 'https://chipin.co.za/maya', 'Maya');

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://legacy.facebook.test/v1/987/messages');
  });

  it('skips sending for invalid numbers', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await sendDreamBoardLink('12345', 'https://chipin.co.za/maya', 'Maya');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(loggerMocks.log).toHaveBeenCalledWith('warn', 'whatsapp.invalid_number', {
      phoneNumber: '12345',
    });
  });
});
