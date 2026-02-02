import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const demoMocks = vi.hoisted(() => ({
  isDemoMode: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
  log: vi.fn(),
}));

vi.mock('@/lib/demo', () => demoMocks);
vi.mock('@/lib/observability/logger', () => loggerMocks);

import { sendDreamBoardLink } from '@/lib/integrations/whatsapp';

const originalEnv = {
  WHATSAPP_BUSINESS_API_URL: process.env.WHATSAPP_BUSINESS_API_URL,
  WHATSAPP_BUSINESS_API_TOKEN: process.env.WHATSAPP_BUSINESS_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
};

beforeEach(() => {
  demoMocks.isDemoMode.mockReturnValue(false);
  process.env.WHATSAPP_BUSINESS_API_URL = 'https://graph.facebook.test/v1';
  process.env.WHATSAPP_BUSINESS_API_TOKEN = 'token';
  process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
});

afterEach(() => {
  process.env.WHATSAPP_BUSINESS_API_URL = originalEnv.WHATSAPP_BUSINESS_API_URL;
  process.env.WHATSAPP_BUSINESS_API_TOKEN = originalEnv.WHATSAPP_BUSINESS_API_TOKEN;
  process.env.WHATSAPP_PHONE_NUMBER_ID = originalEnv.WHATSAPP_PHONE_NUMBER_ID;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('whatsapp integration', () => {
  it('sends a dream board link template', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await sendDreamBoardLink('082 123 4567', 'https://chipin.co.za/maya', 'Maya');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.test/v1/123/messages');

    const payload = JSON.parse(options.body as string);
    expect(payload.to).toBe('+27821234567');
    expect(payload.template.name).toBe('dream_board_created');
    expect(payload.template.components[0].parameters.map((param: { text: string }) => param.text))
      .toEqual(['Maya', 'https://chipin.co.za/maya']);
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
