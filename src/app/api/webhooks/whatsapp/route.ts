import { NextRequest, NextResponse } from 'next/server';

import { log } from '@/lib/observability/logger';
import {
  isValidWhatsAppWebhookSignature,
  processWhatsAppWebhookPayload,
} from '@/lib/integrations/whatsapp-webhook';

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const expectedToken = process.env.WA_WEBHOOK_VERIFY_TOKEN;

  if (!expectedToken) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 503 });
  }

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? undefined;
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!process.env.META_APP_SECRET) {
    log('error', 'whatsapp.webhook_missing_app_secret', undefined, requestId);
    return NextResponse.json({ error: 'misconfigured' }, { status: 503 });
  }

  if (!isValidWhatsAppWebhookSignature(rawBody, signature)) {
    log('warn', 'whatsapp.webhook_invalid_signature', undefined, requestId);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    const result = await processWhatsAppWebhookPayload(
      payload as Parameters<typeof processWhatsAppWebhookPayload>[0],
      requestId
    );
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    log(
      'error',
      'whatsapp.webhook_processing_failed',
      { error: error instanceof Error ? error.message : String(error) },
      requestId
    );
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
