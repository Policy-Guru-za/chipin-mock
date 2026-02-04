import * as Sentry from '@sentry/nextjs';

import { isMockSentry } from '@/lib/config/feature-flags';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!isMockSentry()) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  });
}
