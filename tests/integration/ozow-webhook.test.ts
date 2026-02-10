import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/webhooks/ozow/route');
};

const mockRateLimit = (allowed: boolean) => {
  vi.doMock('@/lib/auth/rate-limit', () => ({
    enforceRateLimit: vi.fn(async () => ({
      allowed,
      retryAfterSeconds: allowed ? undefined : 120,
    })),
  }));
};

const mockCache = () => {
  vi.doMock('@/lib/dream-boards/cache', () => ({
    invalidateDreamBoardCacheById: vi.fn(async () => undefined),
  }));
};

describe('Ozow webhook integration', () => {
  afterEach(() => {
    vi.unmock('@/lib/auth/rate-limit');
    vi.unmock('@/lib/dream-boards/cache');
    vi.unmock('@/lib/db/queries');
    vi.unmock('@/lib/payments/ozow');
    vi.unmock('@/lib/charities/allocation');
    vi.unmock('@/lib/webhooks');
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('accepts a valid webhook payload', async () => {
    const contribution = {
      id: 'contrib-1',
      dreamBoardId: 'board-1',
      amountCents: 5000,
      feeCents: 250,
      paymentStatus: 'pending',
    };

    mockRateLimit(true);
    mockCache();

    const getContributionByPaymentRef = vi.fn(async () => contribution);
    const updateContributionStatus = vi.fn(async () => undefined);
    const markDreamBoardFundedIfNeeded = vi.fn(async () => false);
    const completeContributionWithResolvedCharity = vi.fn(async () => null);
    const emitWebhookEventForPartner = vi.fn(async () => ['evt-1']);

    vi.doMock('@/lib/db/queries', () => ({
      getContributionByPaymentRef,
      updateContributionStatus,
      markDreamBoardFundedIfNeeded,
    }));
    vi.doMock('@/lib/charities/allocation', () => ({
      completeContributionWithResolvedCharity,
    }));
    vi.doMock('@/lib/webhooks', () => ({
      emitWebhookEventForPartner,
    }));

    vi.doMock('@/lib/payments/ozow', async () => {
      const actual =
        await vi.importActual<typeof import('@/lib/payments/ozow')>('@/lib/payments/ozow');
      return {
        ...actual,
        verifyOzowWebhook: vi.fn(() => ({
          data: {
            merchantReference: 'OZOW-123',
            status: 'PAID',
            amount: { value: 52.5 },
          },
        })),
      };
    });

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/webhooks/ozow', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.received).toBe(true);

    expect(getContributionByPaymentRef).toHaveBeenCalledWith('ozow', 'OZOW-123');
    expect(completeContributionWithResolvedCharity).toHaveBeenCalledWith('contrib-1');
    expect(updateContributionStatus).not.toHaveBeenCalled();
    expect(markDreamBoardFundedIfNeeded).toHaveBeenCalledWith('board-1');
    expect(emitWebhookEventForPartner).toHaveBeenCalledWith(
      contribution.partnerId,
      'contribution.received',
      expect.any(Object),
      expect.anything()
    );
    expect(emitWebhookEventForPartner).not.toHaveBeenCalledWith(
      expect.any(String),
      'pot.funded',
      expect.anything(),
      expect.anything()
    );
  });

  it('rejects payloads without amounts', async () => {
    const contribution = {
      id: 'contrib-1',
      dreamBoardId: 'board-1',
      amountCents: 5000,
      feeCents: 250,
      paymentStatus: 'pending',
    };

    mockRateLimit(true);
    mockCache();

    const getContributionByPaymentRef = vi.fn(async () => contribution);
    const updateContributionStatus = vi.fn(async () => undefined);
    const markDreamBoardFundedIfNeeded = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/queries', () => ({
      getContributionByPaymentRef,
      updateContributionStatus,
      markDreamBoardFundedIfNeeded,
    }));
    vi.doMock('@/lib/charities/allocation', () => ({
      completeContributionWithResolvedCharity: vi.fn(async () => null),
    }));

    vi.doMock('@/lib/payments/ozow', async () => {
      const actual =
        await vi.importActual<typeof import('@/lib/payments/ozow')>('@/lib/payments/ozow');
      return {
        ...actual,
        verifyOzowWebhook: vi.fn(() => ({
          data: {
            merchantReference: 'OZOW-123',
            status: 'PAID',
          },
        })),
      };
    });

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/webhooks/ozow', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
    expect(updateContributionStatus).not.toHaveBeenCalled();
    expect(markDreamBoardFundedIfNeeded).not.toHaveBeenCalled();
  });

  it('rejects requests when rate limited', async () => {
    mockRateLimit(false);
    mockCache();

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/webhooks/ozow', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(429);
  });
});
