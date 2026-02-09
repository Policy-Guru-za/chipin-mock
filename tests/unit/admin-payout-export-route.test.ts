import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const encodeCursor = (createdAtIso: string, id: string) =>
  Buffer.from(`${createdAtIso}|${id}`).toString('base64url');

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.unmock('@/lib/admin');
  vi.unmock('@/lib/auth/clerk-wrappers');
});

describe('admin payout export route', () => {
  it('streams paginated payout rows as csv', async () => {
    const requireAdminAuth = vi.fn(async () => ({ hostId: 'host-1', email: 'admin@gifta.co.za' }));

    const listAdminPayouts = vi
      .fn()
      .mockResolvedValueOnce({
        items: [{ id: 'p-1' }],
        totalCount: 2,
        nextCursor: encodeCursor('2026-02-01T00:00:00.000Z', 'p-1'),
        limit: 200,
      })
      .mockResolvedValueOnce({
        items: [{ id: 'p-2' }],
        totalCount: 2,
        nextCursor: null,
        limit: 200,
      });

    const parseAdminPayoutFilters = vi.fn(() => ({ cursor: null }));
    const toAdminPayoutCsvRows = vi.fn((items: Array<{ id: string }>) =>
      items.map((item) => ({
        id: item.id,
        dream_board_id: item.id === 'p-1' ? 'db-1' : 'db-2',
        dream_board_slug: item.id === 'p-1' ? 'maya' : 'luca',
        child_name: item.id === 'p-1' ? 'Maya' : 'Luca',
        type: 'karri_card',
        status: 'pending',
        gross_cents: item.id === 'p-1' ? 10000 : 12000,
        fee_cents: item.id === 'p-1' ? 300 : 360,
        charity_cents: 0,
        net_cents: item.id === 'p-1' ? 9700 : 11640,
        payout_email: 'host@gifta.co.za',
        host_email: 'host@gifta.co.za',
        charity_id: '',
        charity_name: '',
        created_at_iso: '2026-02-01T00:00:00.000Z',
        completed_at_iso: '',
      })),
    );

    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireAdminAuth }));
    vi.doMock('@/lib/admin', () => ({
      listAdminPayouts,
      parseAdminPayoutFilters,
      toAdminPayoutCsvRows,
    }));

    const routeModule = await import('@/app/(admin)/admin/payouts/export/route');
    const response = await routeModule.GET(
      new NextRequest('https://gifta.local/admin/payouts/export?status=pending'),
    );

    expect(requireAdminAuth).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="gifta-admin-payouts.csv"',
    );

    const body = await response.text();

    expect(body).toContain(
      'id,dream_board_id,dream_board_slug,child_name,type,status,gross_cents,fee_cents,charity_cents,net_cents,payout_email,host_email,charity_id,charity_name,created_at_iso,completed_at_iso',
    );
    expect(body).toContain('p-1,db-1,maya,Maya,karri_card,pending,10000,300,0,9700');
    expect(body).toContain('p-2,db-2,luca,Luca,karri_card,pending,12000,360,0,11640');

    expect(parseAdminPayoutFilters).toHaveBeenCalledTimes(1);
    expect(listAdminPayouts).toHaveBeenCalledTimes(2);
    expect(listAdminPayouts).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ limit: 200, cursor: null }),
    );
    expect(listAdminPayouts).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: 200,
        cursor: expect.objectContaining({ id: 'p-1' }),
      }),
    );
  });
});
