import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { log } from '@/lib/observability/logger';
import { getClientIp } from '@/lib/utils/request';

// Allowlist of property keys to prevent PII leakage
const ALLOWED_PROPERTY_KEYS = new Set([
  'dream_board_id',
  'amount_cents',
  'payment_provider',
  'failure_code',
  'payout_id',
  'payout_type',
  'payout_method',
  'charity_enabled',
  'dreamBoardId',
  'amountCents',
  'paymentMethod',
  'totalRaisedCents',
  'platform',
  'step',
  'stepName',
  'provider',
  'reference_last4',
]);

const customMetricSchema = z.object({
  name: z.enum([
    'host_create_started',
    'host_create_step_completed',
    'host_create_failed',
    'host_create_published',
    'guest_view_loaded',
    'contribution_redirect_started',
    'contribution_failed',
    'reminder_requested',
    'payout_created',
    'payout_processing_started',
    'payout_completed',
    'payout_failed',
    'charity_payout_created',
    'reminder_dispatched',
    'reminder_failed',
    'dream_board_created',
    'contribution_started',
    'contribution_completed',
    'goal_reached',
    'payment_method_selected',
    'wizard_step_completed',
    'share_link_clicked',
    'nav_drawer_opened',
    'payment_redirect_started',
    'snapscan_qr_shown',
    'snapscan_reference_copied',
  ]),
  timestamp: z.number(),
  properties: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_SECONDS = 60;

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const appOrigin = (() => {
    if (!appUrl) return null;
    try {
      return new URL(appUrl).origin;
    } catch {
      return null;
    }
  })();

  if (process.env.NODE_ENV === 'development') return true;

  const hasAllowedOrigin = (value: string | null) => {
    if (!value || !appOrigin) return false;
    try {
      return new URL(value).origin === appOrigin;
    } catch {
      return false;
    }
  };

  if (hasAllowedOrigin(origin) || hasAllowedOrigin(referer)) return true;

  return false;
}

function sanitizeProperties(
  properties?: Record<string, string | number | boolean>
): Record<string, string | number | boolean> | undefined {
  if (!properties) return undefined;

  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (ALLOWED_PROPERTY_KEYS.has(key)) {
      sanitized[key] = value;
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export async function POST(request: NextRequest) {
  // Validate origin
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limiting
  const ip = getClientIp(request) ?? 'unknown';
  const rateLimit = await enforceRateLimit(`metrics:${ip}`, {
    limit: RATE_LIMIT_MAX,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = customMetricSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const metric = result.data;

    // Log for now - in production, send to your analytics service
    log('info', 'custom_metric.reported', {
      metric: metric.name,
      timestamp: metric.timestamp,
      properties: sanitizeProperties(metric.properties),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
