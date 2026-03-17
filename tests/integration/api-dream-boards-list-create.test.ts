import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/v1/dream-boards/route');
};

const ORIGINAL_KARRI_WRITE_PATH = process.env.UX_V2_ENABLE_KARRI_WRITE_PATH;
const ORIGINAL_BANK_WRITE_PATH = process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
const ORIGINAL_CHARITY_WRITE_PATH = process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

const formatDateOnlyLocal = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const tomorrowDateOnly = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDateOnlyLocal(date);
};

const toSlashDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

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
  giftImageUrl: '/icons/gifts/train.png',
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
  process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = ORIGINAL_KARRI_WRITE_PATH;
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
  it('returns paginated Dreamboards', async () => {
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
  it('creates a voucher-default Dreamboard when payout_method is omitted', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-abc123' }));
    const encryptSensitiveValue = vi.fn(() => 'encrypted-card');
    vi.doMock('@/lib/utils/encryption', () => ({
      encryptSensitiveValue,
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          gift_image_prompt: 'A bright train set',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.slug).toBe('maya-birthday-abc123');
    expect(payload.data.gift_data.gift_icon_id).toBe('train');
    expect(payload.data.gift_data.gift_image_url).toBe('http://localhost:3000/icons/gifts/train.png');
    expect(payload.data.payout_method).toBe('takealot_voucher');
    expect(payload.data).not.toHaveProperty('charity_enabled');
    expect(encryptSensitiveValue).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        payoutMethod: 'takealot_voucher',
        karriCardNumber: null,
        karriCardHolderName: null,
        bankName: null,
        charityEnabled: false,
        charityId: null,
        charitySplitType: null,
        charityPercentageBps: null,
        charityThresholdCents: null,
      })
    );
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
    expect(insert).toHaveBeenCalled();
  });

  it('returns unsupported operation for karri payout payloads when the karri write path is disabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'false';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    const encryptSensitiveValue = vi.fn(() => 'encrypted-card');
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_method: 'karri_card',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe('unsupported_operation');
    expect(payload.error.message).toContain('Karri payout method is not enabled');
    expect(encryptSensitiveValue).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
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

  it('rejects charity fields because the public create contract no longer supports them', async () => {
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    const { getActiveCharityById } = mockDreamBoardWriteQueries({ markApiKeyUsed });

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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
          charity_split_type: 'percentage',
          charity_percentage_bps: 1000,
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(getActiveCharityById).not.toHaveBeenCalled();
    expect(markApiKeyUsed).not.toHaveBeenCalled();
  });

  it('rejects slash-formatted date strings at the public API boundary', async () => {
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
          birthday_date: toSlashDate(tomorrowDateOnly()),
          party_date: toSlashDate(tomorrowDateOnly()),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
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

  it('accepts karri payloads when the karri write path toggle is enabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    mockDreamBoardWriteQueries({ markApiKeyUsed });

    vi.doMock('@/lib/utils/slug', () => ({ generateSlug: () => 'maya-birthday-karri' }));
    const encryptSensitiveValue = vi.fn(() => 'encrypted-card');
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue }));

    const returning = vi.fn(async () => [
      {
        id: 'board-1',
        slug: 'maya-birthday-karri',
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_method: 'karri_card',
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          karri_card_number: '1234567890123456',
          karri_card_holder_name: 'Maya Parent',
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.payout_method).toBe('karri_card');
    expect(encryptSensitiveValue).toHaveBeenCalledWith('1234567890123456');
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        payoutMethod: 'karri_card',
        karriCardNumber: 'encrypted-card',
        karriCardHolderName: 'Maya Parent',
      })
    );
    expect(markApiKeyUsed).toHaveBeenCalledWith('api-key-1');
  });

  it('still rejects charity fields even when the legacy charity write flag is enabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    mockAuth();

    const markApiKeyUsed = vi.fn(async () => undefined);
    const { getActiveCharityById } = mockDreamBoardWriteQueries({ markApiKeyUsed });

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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
          charity_enabled: true,
          charity_id: '00000000-0000-4000-8000-000000000001',
        }),
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('validation_error');
    expect(insert).not.toHaveBeenCalled();
    expect(getActiveCharityById).not.toHaveBeenCalled();
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
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
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
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
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'train',
          goal_cents: 35000,
          payout_method: 'karri_card',
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

  it('rejects unsupported gift icons', async () => {
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
          party_date: tomorrowDateOnly(),
          gift_name: 'Train set',
          gift_icon_id: 'unknown-icon',
          goal_cents: 35000,
          payout_email: 'parent@example.com',
          host_whatsapp_number: '+27821234567',
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
