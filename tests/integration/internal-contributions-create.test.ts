import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/contributions/create/route');
};

const buildBoardSelectChain = (board: {
  id: string;
  partnerId: string;
  slug: string;
  childName: string;
  status: 'active' | 'funded' | 'closed' | 'cancelled';
} | null) => {
  const limit = vi.fn(async () => (board ? [board] : []));
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { select };
};

afterEach(() => {
  vi.unmock('@/lib/auth/rate-limit');
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/payments');
  vi.unmock('@/lib/payments/reference');
  vi.unmock('@/lib/utils/request');
  vi.resetModules();
});

describe('POST /api/internal/contributions/create', () => {
  it('creates a payment intent for a valid guest contribution request', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));
    vi.doMock('@/lib/utils/request', () => ({
      getClientIp: vi.fn(() => '127.0.0.1'),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000010',
      partnerId: 'partner-1',
      slug: 'maya-board',
      childName: 'Maya',
      status: 'active' as const,
    };
    const boardSelect = buildBoardSelectChain(board);

    const insertValues = vi.fn(async () => undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    const updateWhere = vi.fn(async () => undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        insert,
        update,
      },
    }));

    const createPaymentIntent = vi.fn(async () => ({
      provider: 'payfast',
      paymentRef: 'PF-123',
      redirectUrl: 'https://pay.example/redirect',
    }));
    vi.doMock('@/lib/payments', () => ({
      isPaymentProviderAvailable: vi.fn(() => true),
      createPaymentIntent,
    }));
    vi.doMock('@/lib/payments/reference', () => ({
      generatePaymentRef: vi.fn(() => 'PF-123'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dreamBoardId: board.id,
          contributionCents: 5000,
          contributorName: 'Friend',
          message: 'Happy birthday!',
          paymentProvider: 'payfast',
        }),
      }) as never
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.redirectUrl).toContain('https://pay.example/redirect');
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        dreamBoardId: board.id,
        amountCents: 5000,
        paymentProvider: 'payfast',
        paymentRef: 'PF-123',
      })
    );
    expect(createPaymentIntent).toHaveBeenCalledWith(
      'payfast',
      expect.objectContaining({
        amountCents: 5300,
        reference: 'PF-123',
      })
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects contributions for closed dream boards', async () => {
    vi.doMock('@/lib/auth/rate-limit', () => ({
      enforceRateLimit: vi.fn(async () => ({ allowed: true })),
    }));
    vi.doMock('@/lib/utils/request', () => ({
      getClientIp: vi.fn(() => '127.0.0.1'),
    }));

    const board = {
      id: '00000000-0000-4000-8000-000000000011',
      partnerId: 'partner-1',
      slug: 'maya-board',
      childName: 'Maya',
      status: 'closed' as const,
    };
    const boardSelect = buildBoardSelectChain(board);
    const insertValues = vi.fn(async () => undefined);
    const insert = vi.fn(() => ({ values: insertValues }));

    vi.doMock('@/lib/db', () => ({
      db: {
        select: boardSelect.select,
        insert,
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) })),
      },
    }));

    const createPaymentIntent = vi.fn(async () => ({
      provider: 'payfast',
      paymentRef: 'PF-123',
      redirectUrl: 'https://pay.example/redirect',
    }));
    vi.doMock('@/lib/payments', () => ({
      isPaymentProviderAvailable: vi.fn(() => true),
      createPaymentIntent,
    }));
    vi.doMock('@/lib/payments/reference', () => ({
      generatePaymentRef: vi.fn(() => 'PF-123'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/contributions/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dreamBoardId: board.id,
          contributionCents: 5000,
          paymentProvider: 'payfast',
        }),
      }) as never
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('board_closed');
    expect(insert).not.toHaveBeenCalled();
    expect(createPaymentIntent).not.toHaveBeenCalled();
  });
});
