import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

type DraftRecord = Record<string, Record<string, unknown>>;

const hostId = 'host-1';
const ORIGINAL_ENCRYPTION_KEY = process.env.CARD_DATA_ENCRYPTION_KEY;

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const seedChildAndGift = () => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftDescription: 'A mint green scooter with streamers.',
  giftImageUrl: 'https://example.com/scooter.jpg',
  goalCents: 60000,
  updatedAt: new Date().toISOString(),
});

const expectRedirect = async (promise: Promise<unknown>, expected: string) => {
  await expect(promise).rejects.toThrow(`REDIRECT:${expected}`);
};

const normalizeStoredDraft = (draft: Record<string, unknown>) => {
  const payoutMethod = draft.payoutMethod === 'karri_card' ? 'karri_card' : 'bank';

  return {
    ...draft,
    payoutMethod,
    karriCardNumberEncrypted:
      payoutMethod === 'karri_card' ? draft.karriCardNumberEncrypted : undefined,
    karriCardHolderName: payoutMethod === 'karri_card' ? draft.karriCardHolderName : undefined,
    bankName: payoutMethod === 'bank' ? draft.bankName : undefined,
    bankAccountNumberEncrypted:
      payoutMethod === 'bank' ? draft.bankAccountNumberEncrypted : undefined,
    bankAccountLast4: payoutMethod === 'bank' ? draft.bankAccountLast4 : undefined,
    bankBranchCode: payoutMethod === 'bank' ? draft.bankBranchCode : undefined,
    bankAccountHolder: payoutMethod === 'bank' ? draft.bankAccountHolder : undefined,
    charityEnabled: false,
    charityId: undefined,
    charitySplitType: undefined,
    charityPercentageBps: undefined,
    charityThresholdCents: undefined,
  };
};

const toHostCreateDraft = (draft: Record<string, unknown> | null | undefined) => {
  if (!draft) return null;

  const {
    childName,
    childAge,
    birthdayDate,
    partyDate,
    partyDateTime,
    campaignEndDate,
    childPhotoUrl,
    photoFilename,
    giftName,
    giftDescription,
    giftIconId,
    giftImageUrl,
    giftImagePrompt,
    goalCents,
    payoutMethod,
    payoutEmail,
    karriCardNumberEncrypted,
    karriCardHolderName,
    bankName,
    bankAccountNumberEncrypted,
    bankAccountLast4,
    bankBranchCode,
    bankAccountHolder,
    hostWhatsAppNumber,
    message,
    updatedAt,
  } = draft;

  return {
    childName,
    childAge,
    birthdayDate,
    partyDate,
    partyDateTime,
    campaignEndDate,
    childPhotoUrl,
    photoFilename,
    giftName,
    giftDescription,
    giftIconId,
    giftImageUrl,
    giftImagePrompt,
    goalCents,
    payoutMethod: payoutMethod === 'karri_card' ? 'karri_card' : 'bank',
    payoutEmail,
    karriCardNumberEncrypted,
    karriCardHolderName,
    bankName,
    bankAccountNumberEncrypted,
    bankAccountLast4,
    bankBranchCode,
    bankAccountHolder,
    hostWhatsAppNumber,
    message,
    updatedAt,
  };
};

const loadActions = async (store: DraftRecord) => {
  vi.resetModules();

  vi.doMock('next/navigation', () => ({
    redirect: (url: string) => {
      throw new Error(`REDIRECT:${url}`);
    },
  }));

  vi.doMock('@/lib/auth/clerk-wrappers', () => ({
    requireHostAuth: vi.fn(async () => ({ hostId })),
  }));

  vi.doMock('@/lib/utils/encryption', () => ({
    encryptSensitiveValue: vi.fn((value: string) => `enc:${value}`),
  }));

  vi.doMock('@/lib/integrations/karri', () => ({
    verifyKarriCard: vi.fn(async () => ({ valid: true })),
  }));

  vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));
  vi.doMock('@/lib/config/feature-flags', () => ({ isMockSentry: vi.fn(() => false) }));
  vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

  const writeDraft = vi.fn(async (id: string, draft: Record<string, unknown>) => {
    const existing = store[id] ?? {};
    store[id] = normalizeStoredDraft({
      ...existing,
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    return store[id];
  });

  vi.doMock('@/lib/dream-boards/draft', () => ({
    getHostCreateDreamBoardDraft: vi.fn(async (id: string) => toHostCreateDraft(store[id] ?? null)),
    updateHostCreateDreamBoardDraft: writeDraft,
    updateDreamBoardDraft: writeDraft,
  }));

  const datesModule = await import('@/app/(host)/create/dates/actions');
  const givingBackModule = await import('@/app/(host)/create/giving-back/actions');
  const payoutModule = await import('@/app/(host)/create/payout/actions');

  return {
    saveDatesAction: datesModule.saveDatesAction,
    saveGivingBackAction: givingBackModule.saveGivingBackAction,
    savePayoutAction: payoutModule.savePayoutAction,
  };
};

afterEach(() => {
  process.env.CARD_DATA_ENCRYPTION_KEY = ORIGINAL_ENCRYPTION_KEY;
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/utils/encryption');
  vi.unmock('@/lib/integrations/karri');
  vi.unmock('@/lib/observability/logger');
  vi.unmock('@/lib/config/feature-flags');
  vi.unmock('@sentry/nextjs');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('create flow step transitions', () => {
  it('full happy path: bank payout with no charity', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction, savePayoutAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(20));
    datesForm.set('noPartyPlanned', 'on');
    await expectRedirect(saveDatesAction(datesForm), '/create/payout');

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'bank');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('bankName', 'FNB');
    payoutForm.set('bankAccountNumber', '1234567890');
    payoutForm.set('bankBranchCode', '250655');
    payoutForm.set('bankAccountHolder', 'Maya Parent');
    await expectRedirect(savePayoutAction(payoutForm), '/create/review');

    expect(store[hostId].payoutMethod).toBe('bank');
    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].bankAccountNumberEncrypted).toBe('enc:1234567890');
    expect(store[hostId].bankAccountLast4).toBe('7890');
    expect(store[hostId].karriCardNumberEncrypted).toBeUndefined();

    const view = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(view.redirectTo).toBeUndefined();
  });

  it('prevents skipping payout setup and redirects back to dates', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
      },
    };

    const { savePayoutAction } = await loadActions(store);
    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'bank');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('bankName', 'FNB');
    payoutForm.set('bankAccountNumber', '1234567890');
    payoutForm.set('bankBranchCode', '250655');
    payoutForm.set('bankAccountHolder', 'Maya Parent');

    await expectRedirect(savePayoutAction(payoutForm), '/create/dates');

    const reviewView = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(reviewView.redirectTo).toBe('/create/payout');
  });

  it('preserves draft data across later updates', async () => {
    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(21));
    datesForm.set('partyDate', addDays(23));
    datesForm.set('campaignEndDate', addDays(23));

    await expectRedirect(saveDatesAction(datesForm), '/create/payout');

    expect(store[hostId].childName).toBe('Maya');
    expect(store[hostId].giftName).toBe('Scooter');
    expect(store[hostId].partyDate).toBe(addDays(23));
    expect(store[hostId].campaignEndDate).toBe(addDays(23));
  });

  it('clears charity fields when legacy giving-back submits into the new flow', async () => {
    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
        birthdayDate: addDays(20),
        partyDate: addDays(20),
        campaignEndDate: addDays(20),
        charityEnabled: true,
        charityId: '00000000-0000-4000-8000-000000000001',
        charitySplitType: 'percentage',
        charityPercentageBps: 3000,
      },
    };

    const { saveGivingBackAction } = await loadActions(store);

    const formData = new FormData();
    formData.set('charityEnabled', 'on');
    formData.set('charityId', '00000000-0000-4000-8000-000000000001');

    await expectRedirect(saveGivingBackAction(formData), '/create/payout');

    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].charityId).toBeUndefined();
    expect(store[hostId].charitySplitType).toBeUndefined();
    expect(store[hostId].charityPercentageBps).toBeUndefined();
    expect(store[hostId].charityThresholdCents).toBeUndefined();
  });

  it('preserves the host message while payout details update later fields', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';
    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
        birthdayDate: addDays(20),
        partyDate: addDays(22),
        campaignEndDate: addDays(22),
        message: 'Thanks for helping make this happen.',
      },
    };
    const { savePayoutAction } = await loadActions(store);

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'bank');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('bankName', 'FNB');
    payoutForm.set('bankAccountNumber', '1234567890');
    payoutForm.set('bankBranchCode', '250655');
    payoutForm.set('bankAccountHolder', 'Maya Parent');

    await expectRedirect(savePayoutAction(payoutForm), '/create/review');

    expect(store[hostId].message).toBe('Thanks for helping make this happen.');
    expect(store[hostId].payoutMethod).toBe('bank');
  });
});
