import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = {
  DEMO_MODE: process.env.DEMO_MODE,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
};

const restoreEnv = () => {
  if (originalEnv.DEMO_MODE === undefined) {
    delete process.env.DEMO_MODE;
  } else {
    process.env.DEMO_MODE = originalEnv.DEMO_MODE;
  }

  if (originalEnv.NEXT_PUBLIC_DEMO_MODE === undefined) {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
  } else {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv.NEXT_PUBLIC_DEMO_MODE;
  }
};

afterEach(() => {
  restoreEnv();
  vi.unmock('@/lib/db/seed-demo');
  vi.resetModules();
});

describe('/api/demo/reset', () => {
  it('returns 404 when not in demo', async () => {
    delete process.env.DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;

    vi.resetModules();
    const seedDemoDatabase = vi.fn(async () => undefined);
    vi.doMock('@/lib/db/seed-demo', () => ({
      seedDemoDatabase,
      DEMO_SEEDED_BOARD_SLUG: 'emma-birthday-demo',
    }));

    const { POST } = await import('@/app/api/demo/reset/route');
    const response = await POST(
      new Request('http://localhost/api/demo/reset', { method: 'POST' })
    );

    expect(response.status).toBe(404);
    expect(seedDemoDatabase).not.toHaveBeenCalled();
  });

  it('clears demo KV and reseeds in demo mode', async () => {
    process.env.DEMO_MODE = 'true';

    vi.resetModules();
    const { demoKv } = await import('@/lib/demo/kv-mock');
    await demoKv.set('demo:reset:test', 'value');

    const seedDemoDatabase = vi.fn(async () => undefined);
    vi.doMock('@/lib/db/seed-demo', () => ({
      seedDemoDatabase,
      DEMO_SEEDED_BOARD_SLUG: 'emma-birthday-demo',
    }));

    const { POST } = await import('@/app/api/demo/reset/route');
    const response = await POST(
      new Request('http://localhost/api/demo/reset', { method: 'POST' })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(await demoKv.get('demo:reset:test')).toBeNull();
    expect(seedDemoDatabase).toHaveBeenCalledTimes(1);
  });

  it('returns 405 for GET in demo mode', async () => {
    process.env.DEMO_MODE = 'true';

    vi.resetModules();
    const seedDemoDatabase = vi.fn(async () => undefined);
    vi.doMock('@/lib/db/seed-demo', () => ({
      seedDemoDatabase,
      DEMO_SEEDED_BOARD_SLUG: 'emma-birthday-demo',
    }));

    const { GET } = await import('@/app/api/demo/reset/route');
    const response = await GET(new Request('http://localhost/api/demo/reset'));

    expect(response.status).toBe(405);
    const payload = await response.json();
    expect(payload.error).toBe('method_not_allowed');
  });

  it('returns 404 for GET when not in demo', async () => {
    delete process.env.DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;

    vi.resetModules();
    const seedDemoDatabase = vi.fn(async () => undefined);
    vi.doMock('@/lib/db/seed-demo', () => ({
      seedDemoDatabase,
      DEMO_SEEDED_BOARD_SLUG: 'emma-birthday-demo',
    }));

    const { GET } = await import('@/app/api/demo/reset/route');
    const response = await GET(new Request('http://localhost/api/demo/reset'));

    expect(response.status).toBe(404);
  });
});
