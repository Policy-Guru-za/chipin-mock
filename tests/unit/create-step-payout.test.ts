import { afterEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/payout/actions');
};

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  campaignEndDate: '2026-06-12',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('savePayoutAction', () => {
  it('acts as the legacy alias for voucher setup and redirects to review', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () =>
        makeDraft({
          charityEnabled: true,
          charityId: '00000000-0000-4000-8000-000000000001',
          charitySplitType: 'percentage',
          charityPercentageBps: 2500,
          payoutMethod: 'bank',
          bankName: 'FNB',
          bankAccountNumberEncrypted: 'enc:123456',
          bankAccountLast4: '3456',
          bankBranchCode: '250655',
          bankAccountHolder: 'Maya Parent',
        })
      ),
      updateDreamBoardDraft,
    }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/review');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      payoutMethod: 'takealot_voucher',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      karriCardNumberEncrypted: undefined,
      karriCardHolderName: undefined,
      bankName: undefined,
      bankAccountNumberEncrypted: undefined,
      bankAccountLast4: undefined,
      bankBranchCode: undefined,
      bankAccountHolder: undefined,
      charityEnabled: false,
      charityId: undefined,
      charitySplitType: undefined,
      charityPercentageBps: undefined,
      charityThresholdCents: undefined,
    });
  });

  it('returns invalid when the payout email is missing', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('hostWhatsAppNumber', '+27821234567');

    await expect(savePayoutAction(formData)).rejects.toThrow(
      'REDIRECT:/create/voucher?error=invalid'
    );
  });

  it('returns whatsapp when the number format is invalid', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => makeDraft()),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '12345');

    await expect(savePayoutAction(formData)).rejects.toThrow(
      'REDIRECT:/create/voucher?error=whatsapp'
    );
  });

  it('redirects to dates when voucher prerequisites are missing', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () =>
        makeDraft({
          birthdayDate: undefined,
          partyDate: undefined,
          campaignEndDate: undefined,
        })
      ),
      updateDreamBoardDraft: vi.fn(async () => undefined),
    }));

    const { savePayoutAction } = await loadModule();
    const formData = new FormData();
    formData.set('payoutEmail', 'parent@example.com');
    formData.set('hostWhatsAppNumber', '+27821234567');

    await expect(savePayoutAction(formData)).rejects.toThrow('REDIRECT:/create/dates');
  });
});
