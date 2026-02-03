import { afterEach, describe, expect, it, vi } from 'vitest';

const loadMeHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/auth/me/route');
};

afterEach(() => {
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.resetModules();
});

describe('GET /api/internal/auth/me', () => {
  it('returns unauthorized when no session exists', async () => {
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getInternalHostAuth: vi.fn(async () => null),
    }));

    const { GET } = await loadMeHandler();
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('returns the host payload when authenticated', async () => {
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getInternalHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));

    const { GET } = await loadMeHandler();
    const response = await GET();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({ id: 'host-1', email: 'host@example.com' });
  });
});
