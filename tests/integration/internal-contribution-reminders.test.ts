import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/contributions/reminders/route');
};

const buildBoardSelectChain = (board: {
  id: string;
  status: 'active' | 'funded' | 'closed' | 'cancelled';
  campaignEndDate: string | null;
  partyDate: string | null;
} | null) => {
  const limit = vi.fn(async () => (board ? [board] : []));
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { select };
};

const buildReminderTransaction = (params?: {
  existingRemindAt?: Date | null;
  insertedRemindAt?: Date | null;
}) => {
  const txExecute = vi.fn(async () => undefined);

  const txSelectLimit = vi.fn(async () =>
    params?.existingRemindAt
      ? [{ id: 'existing-reminder', remindAt: params.existingRemindAt }]
      : []
  );
  const txSelectOrderBy = vi.fn(() => ({ limit: txSelectLimit }));
  const txSelectWhere = vi.fn(() => ({ orderBy: txSelectOrderBy }));
  const txSelectFrom = vi.fn(() => ({ where: txSelectWhere }));
  const txSelect = vi.fn(() => ({ from: txSelectFrom }));

  const txUpdateWhere = vi.fn(async () => undefined);
  const txUpdateSet = vi.fn(() => ({ where: txUpdateWhere }));
  const txUpdate = vi.fn(() => ({ set: txUpdateSet }));

  const txInsertReturning = vi.fn(async () =>
    params?.insertedRemindAt
      ? [{ id: 'new-reminder', remindAt: params.insertedRemindAt }]
      : []
  );
  const txInsertValues = vi.fn(() => ({ returning: txInsertReturning }));
  const txInsert = vi.fn(() => ({ values: txInsertValues }));

  const tx = {
    execute: txExecute,
    select: txSelect,
    update: txUpdate,
    insert: txInsert,
  };

  const transaction = vi.fn(async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx));

  return {
    transaction,
    txExecute,
    txSelect,
    txInsertValues,
    txInsertReturning,
    txUpdateSet,
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
    const boardSelect = buildBoardSelectChain(board);
    const transaction = buildReminderTransaction({
      insertedRemindAt: new Date('2099-01-11T10:00:00.000Z'),
    });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
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
    expect(transaction.txExecute).toHaveBeenCalledTimes(1);
    expect(transaction.txInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        dreamBoardId: board.id,
        email: 'reminder@example.com',
      })
    );
    expect(transaction.txInsertReturning).toHaveBeenCalledTimes(1);
  });

  it('returns an idempotent success response when an existing pending reminder exists', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000015',
      status: 'active' as const,
      campaignEndDate: '2099-01-30',
      partyDate: '2099-01-31',
    };
    const boardSelect = buildBoardSelectChain(board);
    const existingRemindAt = new Date('2099-01-11T10:00:00.000Z');
    const transaction = buildReminderTransaction({ existingRemindAt });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
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

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.idempotent).toBe(true);
    expect(transaction.txInsertValues).not.toHaveBeenCalled();
  });

  it('accepts and stores WhatsApp opt-in data when provided', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000017',
      status: 'active' as const,
      campaignEndDate: '2099-01-30',
      partyDate: '2099-01-31',
    };
    const boardSelect = buildBoardSelectChain(board);
    const transaction = buildReminderTransaction({
      insertedRemindAt: new Date('2099-01-11T10:00:00.000Z'),
    });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'reminder@example.com',
          remindInDays: 3,
          whatsappPhoneE164: '+27821234567',
          whatsappOptIn: true,
          whatsappWaId: '27821234567',
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(transaction.txInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        whatsappPhoneE164: '+27821234567',
        whatsappWaId: '27821234567',
      })
    );
  });

  it('rejects invalid WhatsApp phone numbers', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000018',
      status: 'active' as const,
      campaignEndDate: '2099-01-30',
      partyDate: '2099-01-31',
    };
    const boardSelect = buildBoardSelectChain(board);
    const transaction = buildReminderTransaction({
      insertedRemindAt: new Date('2099-01-11T10:00:00.000Z'),
    });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'reminder@example.com',
          remindInDays: 3,
          whatsappPhoneE164: '+12025550123',
          whatsappOptIn: true,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('invalid_request');
    expect(transaction.txInsertValues).not.toHaveBeenCalled();
  });

  it('rejects reminder windows that resolve to now/past time', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const board = {
      id: '00000000-0000-4000-8000-000000000016',
      status: 'active' as const,
      campaignEndDate: yesterday,
      partyDate: yesterday,
    };
    const boardSelect = buildBoardSelectChain(board);
    const transaction = buildReminderTransaction({
      insertedRemindAt: new Date('2099-01-11T10:00:00.000Z'),
    });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
    vi.doMock('@/lib/utils/request', () => ({ getClientIp: vi.fn(() => '127.0.0.1') }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dreamBoardId: board.id,
          email: 'reminder@example.com',
          remindInDays: 1,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('invalid_reminder_window');
    expect(transaction.txInsertValues).not.toHaveBeenCalled();
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
    const boardSelect = buildBoardSelectChain(board);
    const transaction = buildReminderTransaction({
      insertedRemindAt: new Date('2099-01-11T10:00:00.000Z'),
    });

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        transaction: transaction.transaction,
      },
    }));
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
    expect(transaction.transaction).not.toHaveBeenCalled();
  });
});
