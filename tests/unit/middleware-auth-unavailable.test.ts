import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import middleware from '../../middleware';

const runMiddleware = async (path: string) =>
  middleware(new NextRequest(`http://localhost${path}`), {} as never);

describe('middleware auth unavailable', () => {
  const originalPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const originalSecretKey = process.env.CLERK_SECRET_KEY;
  const originalDevPreview = process.env.DEV_PREVIEW;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
    process.env.CLERK_SECRET_KEY = '';
    delete process.env.DEV_PREVIEW;
  });

  afterEach(() => {
    if (originalPublishableKey === undefined) {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalPublishableKey;
    }

    if (originalSecretKey === undefined) {
      delete process.env.CLERK_SECRET_KEY;
    } else {
      process.env.CLERK_SECRET_KEY = originalSecretKey;
    }

    if (originalDevPreview === undefined) {
      delete process.env.DEV_PREVIEW;
    } else {
      process.env.DEV_PREVIEW = originalDevPreview;
    }
  });

  it('returns 503 for public pages when keys are missing', async () => {
    const response = await runMiddleware('/');
    expect(response.status).toBe(503);
  });

  it('returns 503 for protected pages when keys are missing', async () => {
    const response = await runMiddleware('/dashboard');
    expect(response.status).toBe(503);
  });

  it('bypasses health endpoints when keys are missing', async () => {
    const response = await runMiddleware('/health/live');
    expect(response.status).toBe(200);
  });

  it('bypasses job-secret endpoints when keys are missing', async () => {
    const paths = [
      '/api/internal/webhooks/process',
      '/api/internal/retention/run',
      '/api/internal/karri/batch',
      '/api/internal/payments/reconcile',
      '/api/internal/api-keys',
      '/api/internal/api-keys/123',
      '/api/internal/api-keys/123/rotate',
    ];

    for (const path of paths) {
      const response = await runMiddleware(path);
      expect(response.status).toBe(200);
    }
  });

  it('bypasses webhook endpoints when keys are missing', async () => {
    const response = await runMiddleware('/api/webhooks/payfast');
    expect(response.status).toBe(200);
  });

  it('bypasses og image endpoint when keys are missing', async () => {
    const response = await runMiddleware('/api/og/maya-birthday');
    expect(response.status).toBe(200);
  });

  it('does not bypass dev preview route by default', async () => {
    const response = await runMiddleware('/dev/icon-picker');
    expect(response.status).toBe(503);
  });

  it('bypasses dev preview route when explicitly enabled', async () => {
    process.env.DEV_PREVIEW = 'true';
    const response = await runMiddleware('/dev/icon-picker');
    expect(response.status).toBe(200);
  });
});
