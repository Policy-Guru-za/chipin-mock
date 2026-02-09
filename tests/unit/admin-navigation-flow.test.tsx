import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('admin legacy payouts redirects', () => {
  it('redirects /payouts to canonical /admin/payouts', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));

    const pageModule = await import('@/app/(admin)/payouts/page');

    await expect(
      pageModule.default({
        searchParams: Promise.resolve({ status: 'pending', created_from: '2026-02-01' }),
      }),
    ).rejects.toThrow('REDIRECT:/admin/payouts?status=pending&created_from=2026-02-01');
  });

  it('redirects /payouts/[id] to canonical detail route', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));

    const pageModule = await import('@/app/(admin)/payouts/[id]/page');

    await expect(
      pageModule.default({
        params: Promise.resolve({ id: 'payout-1' }),
        searchParams: Promise.resolve({ error: 'failed' }),
      }),
    ).rejects.toThrow('REDIRECT:/admin/payouts/payout-1?error=failed');
  });

  it('redirects legacy export route and requires admin auth', async () => {
    const requireAdminAuth = vi.fn(async () => ({ hostId: 'host-1', email: 'admin@gifta.co.za' }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireAdminAuth }));

    const routeModule = await import('@/app/(admin)/payouts/export/route');
    const response = await routeModule.GET(
      new NextRequest('https://gifta.local/payouts/export?status=pending'),
    );

    expect(requireAdminAuth).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://gifta.local/admin/payouts/export?status=pending',
    );
  });
});
