import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/debug/auth-events/route');
};

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('POST /api/internal/debug/auth-events', () => {
  it('returns 404 when debug endpoints are disabled', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DEBUG_ENDPOINTS_ENABLED;

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/debug/auth-events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tokenHashPrefix: 'a'.repeat(12) }),
      }) as any
    );

    expect(response.status).toBe(404);
  });

  it('returns 401 when debug key is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DEBUG_ENDPOINTS_ENABLED = 'true';
    process.env.DEBUG_API_KEY = 'supersecret';

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/debug/auth-events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tokenHashPrefix: 'a'.repeat(12) }),
      }) as any
    );

    expect(response.status).toBe(401);
  });

  it('returns events from Axiom when authorized', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DEBUG_ENDPOINTS_ENABLED = 'true';
    process.env.DEBUG_API_KEY = 'supersecret';
    process.env.AXIOM_API_TOKEN = 'xaat-test-token';
    process.env.AXIOM_ORG_ID = 'chipin-ov5c';
    process.env.AXIOM_DATASET = 'vercel';

    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        status: { isPartial: false },
        tables: [
          {
            fields: [{ name: '_time' }, { name: 'message' }],
            columns: [
              ['2026-02-03T10:00:00Z'],
              [
                JSON.stringify({
                  level: 'info',
                  message: 'auth.clerk_user_mismatch',
                  timestamp: '2026-02-03T10:00:00Z',
                  data: { hostId: 'host-1' },
                }),
              ],
            ],
          },
        ],
      }),
      text: async () => '',
    }));
    vi.stubGlobal('fetch', fetchSpy);

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/debug/auth-events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-debug-key': 'supersecret',
          'x-forwarded-for': '1.2.3.4',
        },
        body: JSON.stringify({ tokenHashPrefix: 'b'.repeat(12), minutesBack: 30, limit: 10 }),
      }) as any
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.tokenHashPrefix).toBe('b'.repeat(12));
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0].message).toContain('auth.clerk_user_mismatch');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const fetchArgs = fetchSpy.mock.calls[0];
    expect(fetchArgs[0]).toContain('https://api.axiom.co/v1/datasets/_apl?format=tabular');
    expect(fetchArgs[1].headers['x-axiom-org-id']).toBe('chipin-ov5c');
  });

  it('allows querying without tokenHashPrefix', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DEBUG_ENDPOINTS_ENABLED = 'true';
    process.env.DEBUG_API_KEY = 'supersecret';
    process.env.AXIOM_API_TOKEN = 'xaat-test-token';
    process.env.AXIOM_ORG_ID = 'chipin-ov5c';
    process.env.AXIOM_DATASET = 'vercel';

    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: { isPartial: false }, tables: [] }),
      text: async () => '',
    }));
    vi.stubGlobal('fetch', fetchSpy);

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/debug/auth-events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-debug-key': 'supersecret',
          'x-forwarded-for': '1.2.3.4',
        },
        body: JSON.stringify({ minutesBack: 30, limit: 10 }),
      }) as any
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.tokenHashPrefix).toBeNull();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const fetchArgs = fetchSpy.mock.calls[0];
    const body = JSON.parse(fetchArgs[1].body);
    expect(body.apl).toContain('auth.clerk_');
    expect(body.apl).not.toContain('and message contains');
  });
});
