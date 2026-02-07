import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/v1/dream-boards/route');
};

const ORIGINAL_BANK_WRITE_PATH = process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
const ORIGINAL_CHARITY_WRITE_PATH = process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

const mockAuth = () => {
  vi.doMock('@/lib/api/handler', () => ({
    enforceApiAuth: vi.fn(async () => ({
      ok: true,
      context: {
        requestId: 'req-1',
        apiKey: { id: 'api-key-1', partnerId: 'partner-1', rateLimit: 1000 },
        rateLimitHeaders: new Headers(),
      },
    })),
  }));
};

const mockDreamBoardWriteQueries = (params?: {
  markApiKeyUsed?: ReturnType<typeof vi.fn>;
  getActiveCharityById?: ReturnType<typeof vi.fn>;
}) => {
  const markApiKeyUsed = params?.markApiKeyUsed ?? vi.fn(async () => undefined);
  const getActiveCharityById =
    params?.getActiveCharityById ??
    vi.fn(async () => ({ id: '00000000-0000-4000-8000-000000000001' }));

  vi.doMock('@/lib/db/queries', () => ({
    ensureHostForEmail: vi.fn(async () => ({ id: 'host-1' })),
    getActiveCharityById,
    markApiKeyUsed,
  }));

  return { markApiKeyUsed, getActiveCharityById };
};

const baseBoard = {
  id: 'board-1',
  slug: 'maya-birthday',
  childName: 'Maya',
  childPhotoUrl: 'https://images.example/photo.jpg',
  partyDate: new Date('2026-02-15T00:00:00.000Z'),
  giftName: 'Train set',
  giftImageUrl: 'https://images.example/product.jpg',
  giftImagePrompt: 'A bright train set',
  goalCents: 35000,
  payoutMethod: 'karri_card',
  message: 'Make it happen',
  status: 'active',
  createdAt: new Date('2026-01-10T10:00:00.000Z'),
  updatedAt: new Date('2026-01-11T11:00:00.000Z'),
  raisedCents: 5000,
  contributionCount: 2,
};

afterEach(() => {
  process.env.UX_V2_ENABLE_BANK_WRITE_PATH = ORIGINAL_BANK_WRITE_PATH;
  process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = ORIGINAL_CHARITY_WRITE_PATH;

  vi.unmock('@/lib/api/handler');
  vi.unmock('@/lib/db/api-queries');
  vi.unmock('@/lib/db/queries');
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/utils/slug');
  vi.unmock('@/lib/utils/encryption');
  vi.resetModules();
});

describe('GET /api/v1/dream-boards', () => {
  it('returns paginated dream boards', async () => {
    mockAuth();

    const listDreamBoardsForApi = vi.fn(async () => [
      baseBoard,
      { ...baseBoard, id: 'board-2', slug: 'luka-birthday' },
    ]);
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ listDreamBoardsForApi }));
    vi.doMock('@/lib/db/queries', () => ({
      ensureHostForEmail: vi.fn(async () => ({ id: 'host-1' })),
      markApiKeyUsed,
    }));

    const { GET } = await loadHandler();
    const response = await GET(new Request('http://localhost/api/v1/dream-boards?limit=1'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toHaveLength(1);
    expect(payload.pagination.has_more).toBe(true);
    expect(payload.pagination.next_cursor).toBeTruthy();
    expect(listDreamBoardsForApi).toHaveBeenCalledWith(
      expect.objectContaining({ partnerId: 'partner-1' })
    );
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
  });

  it('rejects invalid cursors', async () => {
    mockAuth();

    const listDreamBoardsForApi = vi.fn(async () => []);
    const markApiKeyUsed = vi.fn(async () => undefined);

    vi.doMock('@/lib/db/api-queries', () => ({ listDreamBoardsForApi }));
    vi.doMock('@/lib/db/queries', () => ({ markApiKeyUsed }));

    const { GET } = await loadHandler();
    const response = await GET(
      new Request('http://localhost/api/v1/dream-boards?after=not-a-cursor')
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(listDreamBoardsForApi).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/dream-boards', () => {
  it('creates a dream board', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-abc123' }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const returning = vi.fn(async () => [
      { id: 'board-1', slug: 'maya-birthday-abc123', createdAt: new Date(), updatedAt: new Date() },
    ]);
    const onConflictDoNothing = vi.fn(() => ({ returning }));
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    vi.doMock('@/lib/db', () => ({ db: { insert } }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          gift_image_prompt: 'A bright train set',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.slug).toBe('maya-birthday-abc123');
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
    expect(insert).toHaveBeenCalled();
  });

  it('returns unsupported operation for bank payout payloads before B2', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-bank' }));
    const encryptSensitiveValue = vi.fn((value: string) => `encrypted-${value}`);
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue }));

    const insert = vi.fn();

    vi.doMock('@/lib/db', () => ({ db: { insert } }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          gift_image_prompt: 'A bright train set',
          goal_cents: 35000,
          payout_method: 'bank',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          bank_name: 'Standard Bank',
          bank_account_number: '1234 5678 9012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe('unsupported_operation');
    expect(payload.error.message).toContain('Bank payout method is not yet enabled');
    expect(encryptSensitiveValue).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects charity percentage split without percentage bps', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects charity threshold split without threshold cents', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'threshold',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects percentage split payloads that also include threshold cents', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
          charity_threshold_cents: 10000,
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects threshold split payloads that also include percentage bps', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'threshold',
          charity_threshold_cents: 10000,
          charity_percentage_bps: 1000,
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('returns unsupported operation for complete charity payloads before B2', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe('unsupported_operation');
    expect(payload.error.message).toContain('Charity configuration is not yet enabled');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('accepts bank payout payloads when bank write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-bank' }));
    const encryptSensitiveValue = vi.fn((value: string) => `encrypted-${value}`);
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue }));

    const returning = vi.fn(async () => [
      { id: 'board-1', slug: 'maya-birthday-bank', createdAt: new Date(), updatedAt: new Date() },
    ]);
    const onConflictDoNothing = vi.fn(() => ({ returning }));
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    vi.doMock('@/lib/db', () => ({ db: { insert } }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_method: 'bank',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          bank_name: 'Standard Bank',
          bank_account_number: '1234 5678 9012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.payout_method).toBe('bank');
    expect(encryptSensitiveValue).toHaveBeenCalledWith('123456789012');
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        payoutMethod: 'bank',
        bankName: 'Standard Bank',
        bankAccountNumberEncrypted: 'encrypted-123456789012',
        bankAccountLast4: '9012',
        bankBranchCode: '051001',
        bankAccountHolder: 'Maya Parent',
        karriCardNumber: null,
      })
    );
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
  });

  it('accepts charity payloads when charity write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-charity' }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const returning = vi.fn(async () => [
      {
        id: 'board-1',
        slug: 'maya-birthday-charity',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const onConflictDoNothing = vi.fn(() => ({ returning }));
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    vi.doMock('@/lib/db', () => ({ db: { insert } }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.charity_enabled).toBe(true);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        charityEnabled: true,
        charityId: '00000000-0000-4000-8000-000000000001',
        charitySplitType: 'percentage',
        charityPercentageBps: 1000,
        charityThresholdCents: null,
      })
    );
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
  });

  it('rejects incomplete charity payloads even when charity write path is enabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects inactive charity ids before gate evaluation', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    const getActiveCharityById = vi.fn(async () => null);
    mockDreamBoardWriteQueries({ markApiKeyUsed, getActiveCharityById });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000099',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(payload.error.message).toContain('active charity');
    expect(getActiveCharityById).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000099');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects bank payloads that include karri fields', async () => {
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_method: 'bank',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          bank_name: 'Standard Bank',
          bank_account_number: '123456789012',
          bank_branch_code: '051001',
          bank_account_holder: 'Maya Parent',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects karri payloads that include bank fields', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_method: 'karri_card',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
          bank_name: 'Standard Bank',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects normalized-empty karri card numbers', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const insert = vi.fn();
    vi.doMock('@/lib/db', () => ({ db: { insert } }));
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue: vi.fn(() => 'encrypted-card'),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/v1/dream-boards', {
        method: 'POST',
        body: JSON.stringify({
          child_name: 'Maya',
          child_photo_url: 'https://images.example/photo.jpg',
          party_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          gift_name: 'Train set',
          gift_image_url: 'https://images.example/product.jpg',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '  - -  ',
          karri_card_holder_name: 'Maya Parent',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });
});
