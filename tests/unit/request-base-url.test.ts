import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveRuntimeBaseUrl } from '@/lib/utils/request';

const makeHeaders = (entries: Record<string, string>) => new Headers(entries);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveRuntimeBaseUrl', () => {
  it('uses trusted deployment host over configured app url', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gifta.co.za');
    vi.stubEnv('VERCEL_URL', 'chipin-mock.vercel.app');

    const baseUrl = resolveRuntimeBaseUrl({
      headers: makeHeaders({
        host: 'chipin-mock.vercel.app',
        'x-forwarded-proto': 'https',
      }),
    });

    expect(baseUrl).toBe('https://chipin-mock.vercel.app');
  });

  it('falls back to configured app url when host is untrusted', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gifta.co.za');

    const baseUrl = resolveRuntimeBaseUrl({
      headers: makeHeaders({
        host: 'attacker.example',
        'x-forwarded-proto': 'https',
      }),
    });

    expect(baseUrl).toBe('https://gifta.co.za');
  });

  it('allows localhost hosts for local development', () => {
    const baseUrl = resolveRuntimeBaseUrl({
      headers: makeHeaders({
        host: 'localhost:3001',
      }),
    });

    expect(baseUrl).toBe('http://localhost:3001');
  });
});
