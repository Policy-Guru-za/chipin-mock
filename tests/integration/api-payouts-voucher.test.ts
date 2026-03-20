import { afterEach, describe, expect, it, vi } from 'vitest';

const loadPendingHandler = async () => {
  vi.resetModules();
  return import('@/app/api/v1/payouts/pending/route');
};

const loadGetHandler = async () => {
  vi.resetModules();
  return import('@/app/api/v1/payouts/[id]/route');
};

const mockAuth = () => {
  vi.doMock('@/lib/api/handler', () => ({
    enforceApiAuth: vi.fn(async () => ({
      ok: true,
      context: {
        requestId: 'req-voucher',
        apiKey: {
          id: 'api-key-voucher',
          partnerId: 'partner-1',
          rateLimit: 1000,
          partnerName: 'Partner',
        },
        rateLimitHeaders: new Headers(),
      },
    })),
  }));
};

afterEach(() => {
  vi.unmock('@/lib/api/handler');
  vi.unmock('@/lib/db/api-queries');
  vi.unmock('@/lib/db/queries');
  vi.resetModules();
});

describe('payout API serialization', () => {
  it('serializes bank recipient data for pending payouts', async () => {
    mockAuth();

    const listPendingPayoutsForApi = vi.fn(async () => [
      {
        id: 'payout-bank-1',
        dreamBoardId: 'board-bank-1',
        type: 'bank',
        grossCents: 18000,
        feeCents: 0,
        netCents: 18000,
        recipientData: {
          email: 'host@example.com',
          payoutMethod: 'bank',
          childName: 'Maya',
          giftName: 'Train set',
          giftImageUrl: '/icons/gifts/train.png',
          bankName: 'Standard Bank',
          bankAccountLast4: '9012',
          bankBranchCode: '051001',
          bankAccountHolder: 'Maya Parent',
        },
        status: 'pending',
        externalRef: null,
        errorMessage: null,
        createdAt: new Date('2026-01-10T10:00:00.000Z'),
        completedAt: null,
      },
    ]);
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ listPendingPayoutsForApi }));
    vi.doMock('@/lib/db/queries', () => ({ markApiKeyUsed }));

    const { GET } = await loadPendingHandler();
    const response = await GET(new Request('http://localhost/api/v1/payouts/pending'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data[0].recipient_data).toMatchObject({
      email: 'host@example.com',
      payout_method: 'bank',
      bank_name: 'Standard Bank',
      bank_account_last4: '9012',
      bank_branch_code: '051001',
      bank_account_holder: 'Maya Parent',
      child_name: 'Maya',
    });
  });

  it('filters legacy voucher rows out of pending payouts', async () => {
    mockAuth();

    const listPendingPayoutsForApi = vi.fn(async () => [
      {
        id: 'payout-voucher-1',
        dreamBoardId: 'board-voucher-1',
        type: 'takealot_voucher',
        grossCents: 18000,
        feeCents: 0,
        netCents: 18000,
        recipientData: {
          email: 'host@example.com',
          payoutMethod: 'takealot_voucher',
          childName: 'Maya',
        },
        status: 'pending',
        externalRef: null,
        errorMessage: null,
        createdAt: new Date('2026-01-10T10:00:00.000Z'),
        completedAt: null,
      },
      {
        id: 'payout-bank-1',
        dreamBoardId: 'board-bank-1',
        type: 'bank',
        grossCents: 18000,
        feeCents: 0,
        netCents: 18000,
        recipientData: {
          email: 'host@example.com',
          payoutMethod: 'bank',
          childName: 'Maya',
        },
        status: 'pending',
        externalRef: null,
        errorMessage: null,
        createdAt: new Date('2026-01-10T10:00:00.000Z'),
        completedAt: null,
      },
    ]);
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ listPendingPayoutsForApi }));
    vi.doMock('@/lib/db/queries', () => ({ markApiKeyUsed }));

    const { GET } = await loadPendingHandler();
    const response = await GET(new Request('http://localhost/api/v1/payouts/pending'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].id).toBe('payout-bank-1');
  });

  it('returns bank recipient data on payout detail reads', async () => {
    mockAuth();

    const getPayoutForApi = vi.fn(async () => ({
      id: '00000000-0000-4000-8000-000000000111',
      dreamBoardId: 'board-bank-1',
      type: 'bank',
      grossCents: 18000,
      feeCents: 0,
      netCents: 18000,
      recipientData: {
        email: 'host@example.com',
        payoutMethod: 'bank',
        childName: 'Maya',
        giftName: 'Train set',
        giftImageUrl: '/icons/gifts/train.png',
        bankName: 'Standard Bank',
        bankAccountLast4: '9012',
        bankBranchCode: '051001',
        bankAccountHolder: 'Maya Parent',
      },
      status: 'pending',
      externalRef: null,
      errorMessage: null,
      createdAt: new Date('2026-01-10T10:00:00.000Z'),
      completedAt: null,
    }));
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ getPayoutForApi }));
    vi.doMock('@/lib/db/queries', () => ({ markApiKeyUsed }));

    const { GET } = await loadGetHandler();
    const response = await GET(
      new Request('http://localhost/api/v1/payouts/00000000-0000-4000-8000-000000000111'),
      { params: { id: '00000000-0000-4000-8000-000000000111' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.recipient_data).toMatchObject({
      email: 'host@example.com',
      payout_method: 'bank',
      bank_name: 'Standard Bank',
      bank_account_last4: '9012',
      bank_branch_code: '051001',
      bank_account_holder: 'Maya Parent',
      child_name: 'Maya',
    });
  });

  it('returns not found for legacy voucher payout detail rows', async () => {
    mockAuth();

    const getPayoutForApi = vi.fn(async () => ({
      id: '00000000-0000-4000-8000-000000000222',
      dreamBoardId: 'board-voucher-1',
      type: 'takealot_voucher',
      grossCents: 18000,
      feeCents: 0,
      netCents: 18000,
      recipientData: {
        email: 'host@example.com',
        payoutMethod: 'takealot_voucher',
        childName: 'Maya',
      },
      status: 'pending',
      externalRef: null,
      errorMessage: null,
      createdAt: new Date('2026-01-10T10:00:00.000Z'),
      completedAt: null,
    }));
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ getPayoutForApi }));
    vi.doMock('@/lib/db/queries', () => ({ markApiKeyUsed }));

    const { GET } = await loadGetHandler();
    const response = await GET(
      new Request('http://localhost/api/v1/payouts/00000000-0000-4000-8000-000000000222'),
      { params: { id: '00000000-0000-4000-8000-000000000222' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe('not_found');
  });
});
