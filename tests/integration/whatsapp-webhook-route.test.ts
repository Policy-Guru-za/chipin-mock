import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/webhooks/whatsapp/route');
};

const originalEnv = {
  WA_WEBHOOK_VERIFY_TOKEN: process.env.WA_WEBHOOK_VERIFY_TOKEN,
  META_APP_SECRET: process.env.META_APP_SECRET,
};

afterEach(() => {
  process.env.WA_WEBHOOK_VERIFY_TOKEN = originalEnv.WA_WEBHOOK_VERIFY_TOKEN;
  process.env.META_APP_SECRET = originalEnv.META_APP_SECRET;
  vi.unmock('@/lib/integrations/whatsapp-webhook');
  vi.unmock('@/lib/observability/logger');
  vi.resetModules();
});

describe('WhatsApp webhook route', () => {
  it('verifies webhook challenge with matching token', async () => {
    process.env.WA_WEBHOOK_VERIFY_TOKEN = 'verify-me';

    const { GET } = await loadHandler();
    const request = {
      nextUrl: new URL(
        'http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345'
      ),
    } as unknown as NextRequest;
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('12345');
  });

  it('rejects webhook challenge with invalid token', async () => {
    process.env.WA_WEBHOOK_VERIFY_TOKEN = 'verify-me';

    const { GET } = await loadHandler();
    const request = {
      nextUrl: new URL(
        'http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=bad-token&hub.challenge=12345'
      ),
    } as unknown as NextRequest;
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toBe('forbidden');
  });

  it('rejects POST requests with invalid signature', async () => {
    process.env.META_APP_SECRET = 'secret';

    const processWebhookPayload = vi.fn(async () => ({ processedMessages: 0, processedStatuses: 0 }));
    vi.doMock('@/lib/integrations/whatsapp-webhook', () => ({
      isValidWhatsAppWebhookSignature: vi.fn(() => false),
      processWhatsAppWebhookPayload: processWebhookPayload,
    }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'x-hub-signature-256': 'sha256=invalid',
        },
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
      }) as unknown as Parameters<typeof POST>[0]
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('invalid_signature');
    expect(processWebhookPayload).not.toHaveBeenCalled();
  });

  it('processes POST payload when signature is valid', async () => {
    process.env.META_APP_SECRET = 'secret';

    const processWebhookPayload = vi.fn(async () => ({ processedMessages: 2, processedStatuses: 1 }));
    vi.doMock('@/lib/integrations/whatsapp-webhook', () => ({
      isValidWhatsAppWebhookSignature: vi.fn(() => true),
      processWhatsAppWebhookPayload: processWebhookPayload,
    }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'x-hub-signature-256': 'sha256=valid',
          'x-request-id': 'req-1',
        },
        body: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
      }) as unknown as Parameters<typeof POST>[0]
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      received: true,
      processedMessages: 2,
      processedStatuses: 1,
    });
    expect(processWebhookPayload).toHaveBeenCalledTimes(1);
  });
});
