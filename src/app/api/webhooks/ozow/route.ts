import { NextRequest, NextResponse } from 'next/server';

import { isMockPaymentWebhooks } from '@/lib/config/feature-flags';
import { completeContributionWithResolvedCharity } from '@/lib/charities/allocation';
import {
  extractOzowReference,
  mapOzowStatus,
  parseOzowAmountCents,
  verifyOzowWebhook,
} from '@/lib/payments/ozow';
import { enforceRateLimit } from '@/lib/auth/rate-limit';
import {
  getContributionByPaymentRef,
  markDreamBoardFundedIfNeeded,
  updateContributionStatus,
} from '@/lib/db/queries';
import { invalidateDreamBoardCacheById } from '@/lib/dream-boards/cache';
import { log } from '@/lib/observability/logger';
import { extractTimestampValue, validateWebhookTimestamp } from '@/lib/payments/webhook-utils';
import { getClientIp } from '@/lib/utils/request';
import { emitWebhookEventForPartner } from '@/lib/webhooks';
import {
  buildContributionWebhookPayload,
  buildDreamBoardWebhookPayload,
} from '@/lib/webhooks/payloads';

const parseOzowPayload = (rawBody: string) => {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const requestId = request.headers.get('x-request-id') ?? undefined;
  const ip = getClientIp(request);

  const rateLimit = await enforceRateLimit(`webhook:ozow:${ip ?? 'unknown'}`, {
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    log('warn', 'payments.ozow_rate_limited', { ip }, requestId);
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429 }
    );
  }

  const payload = isMockPaymentWebhooks()
    ? parseOzowPayload(rawBody)
    : verifyOzowWebhook(rawBody, request.headers);
  if (!payload) {
    const error = isMockPaymentWebhooks() ? 'invalid_payload' : 'invalid_signature';
    const message = isMockPaymentWebhooks()
      ? 'payments.ozow_invalid_payload'
      : 'payments.ozow_invalid_signature';
    log('warn', message, undefined, requestId);
    return NextResponse.json({ error }, { status: 400 });
  }

  const timestampHeader = request.headers.get('svix-timestamp');
  const timestampValue = timestampHeader
    ? extractTimestampValue({ ts: timestampHeader }, ['ts'])
    : null;
  if (timestampValue) {
    const timestampResult = validateWebhookTimestamp(timestampValue);
    if (!timestampResult.ok) {
      log('warn', 'payments.ozow_invalid_timestamp', { reason: timestampResult.reason }, requestId);
      return NextResponse.json({ error: 'invalid_timestamp' }, { status: 400 });
    }
  } else {
    log('warn', 'payments.ozow_timestamp_missing', undefined, requestId);
  }

  const paymentRef = extractOzowReference(payload);
  if (!paymentRef) {
    return NextResponse.json({ error: 'missing_reference' }, { status: 400 });
  }

  const contribution = await getContributionByPaymentRef('ozow', paymentRef);
  if (!contribution) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (contribution.paymentStatus === 'completed') {
    return NextResponse.json({ received: true });
  }

  const amountCents = parseOzowAmountCents(payload);
  const expectedTotal = contribution.amountCents + contribution.feeCents;
  if (amountCents === null) {
    log('warn', 'payments.ozow_amount_missing', { paymentRef }, requestId);
    return NextResponse.json({ error: 'amount_missing' }, { status: 400 });
  } else if (amountCents !== expectedTotal) {
    log(
      'warn',
      'payments.ozow_amount_mismatch',
      { expected: expectedTotal, received: amountCents, paymentRef },
      requestId
    );
    return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });
  }

  const status = mapOzowStatus(payload);
  if (contribution.paymentStatus === status) {
    return NextResponse.json({ received: true });
  }
  let charityCents: number | null = null;
  if (status === 'completed') {
    charityCents = await completeContributionWithResolvedCharity(contribution.id);
  } else {
    await updateContributionStatus(contribution.id, status);
  }
  await invalidateDreamBoardCacheById(contribution.dreamBoardId);

  if (status === 'completed') {
    const wasFunded = await markDreamBoardFundedIfNeeded(contribution.dreamBoardId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const contributionPayload = await buildContributionWebhookPayload({
      contribution: { ...contribution, paymentStatus: status, charityCents },
      baseUrl,
    });

    const eventIds = await emitWebhookEventForPartner(
      contribution.partnerId,
      'contribution.received',
      contributionPayload.data,
      contributionPayload.meta
    );

    if (!eventIds?.length) {
      log('warn', 'webhooks.emit_failed', {
        partnerId: contribution.partnerId,
        eventType: 'contribution.received',
        contributionId: contribution.id,
      });
    }

    if (wasFunded) {
      const dreamBoardPayload = await buildDreamBoardWebhookPayload(
        contribution.dreamBoardId,
        baseUrl
      );

      const eventIds = await emitWebhookEventForPartner(
        contribution.partnerId,
        'pot.funded',
        dreamBoardPayload.data,
        dreamBoardPayload.meta
      );

      if (!eventIds?.length) {
        log('warn', 'webhooks.emit_failed', {
          partnerId: contribution.partnerId,
          eventType: 'pot.funded',
          dreamBoardId: contribution.dreamBoardId,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
