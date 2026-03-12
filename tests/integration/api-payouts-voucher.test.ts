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

describe('voucher payout API serialization', () => {
  it('serializes voucher fulfilment contact data for pending payouts', async () => {
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
          hostWhatsAppNumber: '+27821234567',
          fulfilmentMode: 'manual_placeholder',
          childName: 'Maya',
          giftName: 'Train set',
          giftImageUrl: '/icons/gifts/train.png',
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
      payout_method: 'takealot_voucher',
      host_whatsapp_number: '+27821234567',
      fulfilment_mode: 'manual_placeholder',
      child_name: 'Maya',
    });
  });

  it('returns voucher fulfilment contact data on payout detail reads', async () => {
    mockAuth();

    const getPayoutForApi = vi.fn(async () => ({
      id: '00000000-0000-4000-8000-000000000111',
      dreamBoardId: 'board-voucher-1',
      type: 'takealot_voucher',
      grossCents: 18000,
      feeCents: 0,
      netCents: 18000,
      recipientData: {
        email: 'host@example.com',
        payoutMethod: 'takealot_voucher',
        hostWhatsAppNumber: '+27821234567',
        fulfilmentMode: 'manual_placeholder',
        childName: 'Maya',
        giftName: 'Train set',
        giftImageUrl: '/icons/gifts/train.png',
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
      payout_method: 'takealot_voucher',
      host_whatsapp_number: '+27821234567',
      fulfilment_mode: 'manual_placeholder',
      child_name: 'Maya',
    });
  });
});
