import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/contributions/reminders/route');
};

const buildSelectChain = (board: {
  id: string;
  status: 'active' | 'funded' | 'closed' | 'cancelled';
  campaignEndDate: string | null;
  partyDate: string | null;
} | null) => {
  const limit = vi.fn(async () => (board ? [board] : []));
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));

  return {
    select,
    where,
    limit,
  };
};

afterEach(() => {
  vi.unmock('@/lib/auth/rate-limit');
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/utils/request');
  vi.resetModules();
});

describe('POST /api/internal/contributions/reminders', () => {
  it('schedules a reminder for an active dream board', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000010',
      status: 'active' as const,
      campaignEndDate: '2099-01-30',
      partyDate: '2099-01-31',
    };
    const selectChain = buildSelectChain(board);
    const onConflictDoNothing = vi.fn(async () => undefined);
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    vi.doMock('@/lib/db', () => ({ db: { select: selectChain.select, insert } }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'Reminder@Example.com',
          remindInDays: 3,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        dreamBoardId: board.id,
        email: 'reminder@example.com',
      })
    );
    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);
  });

  it('caps reminder date at campaign end date', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const campaignEndDate = tomorrow.toISOString().split('T')[0];
    const board = {
      id: '00000000-0000-4000-8000-000000000011',
      status: 'active' as const,
      campaignEndDate,
      partyDate: campaignEndDate,
    };
    const selectChain = buildSelectChain(board);
    const onConflictDoNothing = vi.fn(async () => undefined);
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    vi.doMock('@/lib/db', () => ({ db: { select: selectChain.select, insert } }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'reminder@example.com',
          remindInDays: 14,
        }),
      })
    );

    expect(response.status).toBe(201);

    const inserted = values.mock.calls[0]?.[0];
    expect(inserted).toBeDefined();
    expect(inserted.remindAt).toBeInstanceOf(Date);

    const [year, month, day] = campaignEndDate.split('-').map(Number);
    const closeOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    expect(inserted.remindAt.getTime()).toBe(closeOfDay.getTime());
  });

  it('rejects reminder scheduling for closed dream boards', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000012',
      status: 'closed' as const,
      campaignEndDate: '2099-01-30',
      partyDate: '2099-01-31',
    };
    const selectChain = buildSelectChain(board);
    const insert = vi.fn();

    vi.doMock('@/lib/db', () => ({ db: { select: selectChain.select, insert } }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'reminder@example.com',
          remindInDays: 3,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('board_closed');
    expect(insert).not.toHaveBeenCalled();
  });
});
