import crypto from 'crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { isValidWhatsAppWebhookSignature } from '@/lib/integrations/whatsapp-webhook';

const originalSecret = process.env.META_APP_SECRET;

afterEach(() => {
  process.env.META_APP_SECRET = originalSecret;
});

describe('isValidWhatsAppWebhookSignature', () => {
  it('validates a correct signature', () => {
    process.env.META_APP_SECRET = 'super-secret';
    const rawBody = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const signature = `sha256=${crypto
      .createHmac('sha256', 'super-secret')
      .update(rawBody)
      .digest('hex')}`;

    expect(isValidWhatsAppWebhookSignature(rawBody, signature)).toBe(true);
  });

  it('rejects an incorrect signature', () => {
    process.env.META_APP_SECRET = 'super-secret';
    const rawBody = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    expect(isValidWhatsAppWebhookSignature(rawBody, 'sha256=bad')).toBe(false);
  });
});
