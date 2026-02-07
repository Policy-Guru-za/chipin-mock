import { afterEach, describe, expect, it, vi } from 'vitest';

const DAY_MS = 24 * 60 * 60 * 1000;
const ORIGINAL_BANK_WRITE_PATH = process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
const ORIGINAL_CHARITY_WRITE_PATH = process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/v1/dream-boards/[id]/route');
};

const mockAuth = () => {
  vi.doMock('@/lib/api/handler', () => ({
    enforceApiAuth: vi.fn(async () => ({
      ok: true,
      context: {
        requestId: 'req-123',
        apiKey: { id: 'api-key-1', partnerId: 'partner-1', rateLimit: 1000 },
        rateLimitHeaders: new Headers(),
      },
    })),
  }));
};

const mockDreamBoardUpdateQueries = (params: {
  getDreamBoardByPublicId: ReturnType<typeof vi.fn>;
  markApiKeyUsed?: ReturnType<typeof vi.fn>;
  getActiveCharityById?: ReturnType<typeof vi.fn>;
}) => {
  const markApiKeyUsed = params.markApiKeyUsed ?? vi.fn(async () => undefined);
  const getActiveCharityById =
    params.getActiveCharityById ??
    vi.fn(async () => ({ id: '00000000-0000-4000-8000-000000000001' }));

  vi.doMock('@/lib/db/queries', () => ({
    getDreamBoardByPublicId: params.getDreamBoardByPublicId,
    getActiveCharityById,
    markApiKeyUsed,
  }));

  return { markApiKeyUsed, getActiveCharityById };
};

const buildBoard = (overrides: Record<string, unknown> = {}) => {
  const now = Date.now();
  return {
    id: 'board-1',
    slug: 'maya-birthday',
    childName: 'Maya',
    childPhotoUrl: 'https://images.example/photo.jpg',
    partyDate: new Date(now + 10 * DAY_MS).toISOString().split('T')[0],
    giftName: 'Train set',
    giftImageUrl: 'https://images.example/product.jpg',
    giftImagePrompt: 'A bright train set',
    goalCents: 35000,
    payoutMethod: 'karri_card',
    message: 'Make it happen',
    status: 'active',
    createdAt: new Date(now - DAY_MS),
    updatedAt: new Date(now - DAY_MS / 2),
    raisedCents: 5000,
    contributionCount: 2,
    ...overrides,
  };
};

const mockDb = () => {
  const update = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(async () => undefined),
    })),
  }));

  vi.doMock('@/lib/db', () => ({ db: { update } }));
  return update;
};

afterEach(() => {
  process.env.UX_V2_ENABLE_BANK_WRITE_PATH = ORIGINAL_BANK_WRITE_PATH;
  process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = ORIGINAL_CHARITY_WRITE_PATH;

  vi.unmock('@/lib/api/handler');
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/db/queries');
  vi.unmock('@/lib/utils/encryption');
  vi.resetModules();
});

describe('PATCH /api/v1/dream-boards/[id]', () => {
  it('rejects invalid status transitions', async () => {
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'paid_out' }),
      }),
      { params: { id: 'board-1' } }
    );

    expect(response.status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects party dates that are not extensions', async () => {
    mockAuth();
    const update = mockDb();
    const now = Date.now();
    const board = buildBoard({ partyDate: new Date(now + 10 * DAY_MS).toISOString().split('T')[0] });

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => board),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ party_date: new Date(now + 5 * DAY_MS).toISOString().split('T')[0] }),
      }),
      { params: { id: 'board-1' } }
    );

    expect(response.status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it('updates message fields successfully', async () => {
    mockAuth();
    const update = mockDb();
    const updatedBoard = buildBoard({ message: 'Updated message' });
    const getDreamBoardByPublicId = vi
      .fn()
      .mockResolvedValueOnce(buildBoard())
      .mockResolvedValueOnce(updatedBoard);

    mockDreamBoardUpdateQueries({ getDreamBoardByPublicId });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Updated message' }),
      }),
      { params: { id: 'board-1' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.message).toBe('Updated message');
    expect(update).toHaveBeenCalled();
  });

  it('returns unsupported operation for payout update payloads before B2', async () => {
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payout_method: 'bank',
          bank_name: 'Standard Bank',
          bank_account_number: '123456789012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
        }),
      }),
      { params: { id: 'board-1' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe('unsupported_operation');
    expect(payload.error.message).toContain('Bank payout method is not yet enabled');
    expect(update).not.toHaveBeenCalled();
  });

  it('returns validation errors for incomplete charity update payloads', async () => {
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
        }),
      }),
      { params: { id: 'board-1' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(update).not.toHaveBeenCalled();
  });

  it('returns unsupported operation when charity toggle is provided before B2', async () => {
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          charity_enabled: false,
        }),
      }),
      { params: { id: 'board-1' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe('unsupported_operation');
    expect(payload.error.message).toContain('Charity configuration is not yet enabled');
    expect(update).not.toHaveBeenCalled();
  });

  it('accepts bank payout updates when bank write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    mockAuth();
    const update = mockDb();

    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn((value: string) => `encrypted-${value}`),
    }));

    const getDreamBoardByPublicId = vi
      .fn()
      .mockResolvedValueOnce(buildBoard())
      .mockResolvedValueOnce(
        buildBoard({
          payoutMethod: 'bank',
          karriCardHolderName: null,
          bankName: 'Standard Bank',
          bankAccountLast4: '9012',
          bankBranchCode: '051001',
          bankAccountHolder: 'Maya Parent',
        })
      );
    mockDreamBoardUpdateQueries({ getDreamBoardByPublicId });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payout_method: 'bank',
          bank_name: 'Standard Bank',
          bank_account_number: '1234 5678 9012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
        }),
      }),
      { params: { id: 'board-1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.payout_method).toBe('bank');
    expect(update).toHaveBeenCalled();
  });

  it('accepts charity updates when charity write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    mockAuth();
    const update = mockDb();

    const getDreamBoardByPublicId = vi
      .fn()
      .mockResolvedValueOnce(buildBoard())
      .mockResolvedValueOnce(
        buildBoard({
          charityEnabled: true,
          charityId: '00000000-0000-4000-8000-000000000001',
          charitySplitType: 'percentage',
          charityPercentageBps: 1000,
          charityThresholdCents: null,
        })
      );
    mockDreamBoardUpdateQueries({ getDreamBoardByPublicId });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      }),
      { params: { id: 'board-1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.charity_enabled).toBe(true);
    expect(update).toHaveBeenCalled();
  });

  it('rejects inactive charity ids when charity write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    mockAuth();
    const update = mockDb();

    const getDreamBoardByPublicId = vi.fn(async () => buildBoard());
    const getActiveCharityById = vi.fn(async () => null);
    mockDreamBoardUpdateQueries({ getDreamBoardByPublicId, getActiveCharityById });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000099',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      }),
      { params: { id: 'board-1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(payload.error.message).toContain('active charity');
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects bank update payloads that include karri fields', async () => {
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payout_method: 'bank',
          bank_name: 'Standard Bank',
          bank_account_number: '123456789012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
        }),
      }),
      { params: { id: 'board-1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects karri update payloads that include bank fields', async () => {
    mockAuth();
    const update = mockDb();

    mockDreamBoardUpdateQueries({
      getDreamBoardByPublicId: vi.fn(async () => buildBoard()),
    });

    const { PATCH } = await loadHandler();
    const response = await PATCH(
      new Request('http://localhost/api/v1/dream-boards/board-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payout_method: 'karri_card',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          bank_name: 'Standard Bank',
        }),
      }),
      { params: { id: 'board-1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(update).not.toHaveBeenCalled();
  });
});
