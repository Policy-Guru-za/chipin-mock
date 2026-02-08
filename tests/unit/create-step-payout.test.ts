import { afterEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/payout/page');
};

const ORIGINAL_ENCRYPTION_KEY = process.env.CARD_DATA_ENCRYPTION_KEY;
const ORIGINAL_KARRI_AUTOMATION = process.env.KARRI_AUTOMATION_ENABLED;

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  goalCents: 50000,
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  campaignEndDate: '2026-06-12',
  charityEnabled: false,
  payoutMethod: 'karri_card',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  process.env.CARD_DATA_ENCRYPTION_KEY = ORIGINAL_ENCRYPTION_KEY;
  process.env.KARRI_AUTOMATION_ENABLED = ORIGINAL_KARRI_AUTOMATION;

  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/utils/encryption');
  vi.unmock('@/lib/integrations/karri');
  vi.unmock('@sentry/nextjs');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('savePayoutAction', () => {
  it('encrypts karri card, clears bank fields, and redirects to review', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);
    const encryptSensitiveValue = vi.fn(() => 'encrypted-card');

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('karriCardNumber', '1234 5678 9012 3456');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/review');
    expect(encryptSensitiveValue).toHaveBeenCalledWith('1234567890123456');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      payoutMethod: 'karri_card',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      karriCardNumberEncrypted: 'encrypted-card',
      karriCardHolderName: 'Maya Parent',
      bankName: undefined,
      bankAccountNumberEncrypted: undefined,
      bankAccountLast4: undefined,
      bankBranchCode: undefined,
      bankAccountHolder: undefined,
    });
  });

  it('encrypts bank account, extracts last4, clears karri fields, and redirects', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);
    const encryptSensitiveValue = vi.fn(() => 'encrypted-bank');

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft,
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'bank');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('bankName', 'Standard Bank');
    formData.set('bankAccountNumber', '123456789012');
    formData.set('bankBranchCode', '051001');
    formData.set('bankAccountHolder', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/review');
    expect(encryptSensitiveValue).toHaveBeenCalledWith('123456789012');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      payoutMethod: 'bank',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      bankName: 'Standard Bank',
      bankAccountNumberEncrypted: 'encrypted-bank',
      bankAccountLast4: '9012',
      bankBranchCode: '051001',
      bankAccountHolder: 'Maya Parent',
      karriCardNumberEncrypted: undefined,
      karriCardHolderName: undefined,
    });
  });

  it('returns karri_invalid when verification fails', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    process.env.KARRI_AUTOMATION_ENABLED = 'true';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-card') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: false })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('karriCardNumber', '1234567890123456');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=karri_invalid');
  });

  it('returns karri_unavailable when verification throws', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    process.env.KARRI_AUTOMATION_ENABLED = 'true';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-card') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => { throw new Error('timeout'); }) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('karriCardNumber', '1234567890123456');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=karri_unavailable');
  });

  it('returns bank_account when bank account is invalid', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-bank') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'bank');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('bankName', 'Standard Bank');
    formData.set('bankAccountNumber', '12');
    formData.set('bankBranchCode', '051001');
    formData.set('bankAccountHolder', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=bank_account');
  });

  it('returns invalid when required fields are missing', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-card') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=invalid');
  });

  it('returns whatsapp when number format is invalid', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-card') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '12345');
    formData.set('karriCardNumber', '1234567890123456');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=whatsapp');
  });

  it('returns secure when encryption key is missing', async () => {
    delete process.env.CARD_DATA_ENCRYPTION_KEY;

    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })) }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/utils/encryption', () => ({ encryptSensitiveValue: vi.fn(() => 'encrypted-card') }));
    vi.doMock('@/lib/integrations/karri', () => ({ verifyKarriCard: vi.fn(async () => ({ valid: true })) }));
    vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutMethod', 'karri_card');
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');
    formData.set('karriCardNumber', '1234567890123456');
    formData.set('karriCardHolderName', 'Maya Parent');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/payout?error=secure');
  });
});
