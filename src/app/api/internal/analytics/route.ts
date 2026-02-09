import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { log } from '@/lib/observability/logger';
import { getClientIp } from '@/lib/utils/request';

const webVitalsSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  id: z.string(),
  page: z.string().optional(),
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

  // Allow in development
  if (process.env.NODE_ENV === 'development') return true;

  const hasAllowedOrigin = (value: string | null) => {
    if (!value || !appOrigin) return false;
    try {
      return new URL(value).origin === appOrigin;
    } catch {
      return false;
    }
  };

  // Check origin or referer matches app origin
  if (hasAllowedOrigin(origin) || hasAllowedOrigin(referer)) return true;

  return false;
}

export async function POST(request: NextRequest) {
  // Validate origin
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limiting
  const ip = getClientIp(request) ?? 'unknown';
  const rateLimit = await enforceRateLimit(`analytics:${ip}`, {
    limit: RATE_LIMIT_MAX,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = webVitalsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const metric = result.data;

    // Log for now - in production, send to your analytics service
    log('info', 'web_vitals.reported', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: metric.page,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
