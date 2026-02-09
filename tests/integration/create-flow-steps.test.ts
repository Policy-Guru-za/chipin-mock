import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

type DraftRecord = Record<string, Record<string, unknown>>;

const hostId = 'host-1';

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

const loadActions = async (store: DraftRecord, options?: { verifyKarriThrows?: boolean }) => {
  vi.resetModules();

  vi.doMock('next/navigation', () => ({
    redirect: (url: string) => {
      throw new Error(`REDIRECT:${url}`);
    },
  }));

  vi.doMock('@/lib/auth/clerk-wrappers', () => ({
    requireHostAuth: vi.fn(async () => ({ hostId })),
  }));

  vi.doMock('@/lib/dream-boards/draft', () => ({
    getDreamBoardDraft: vi.fn(async (id: string) => store[id] ?? null),
    updateDreamBoardDraft: vi.fn(async (id: string, draft: Record<string, unknown>) => {
      const existing = store[id] ?? {};
      store[id] = {
        ...existing,
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      return store[id];
    }),
  }));

  vi.doMock('@/lib/utils/encryption', () => ({
    encryptSensitiveValue: vi.fn((value: string) => `enc:${value}`),
  }));

  vi.doMock('@/lib/integrations/karri', () => ({
    verifyKarriCard: vi.fn(async () => {
      if (options?.verifyKarriThrows) {
        throw new Error('karri unavailable');
      }
      return { valid: true };
    }),
  }));

  vi.doMock('@/lib/config/feature-flags', () => ({
    isMockSentry: () => true,
  }));

  vi.doMock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

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
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/utils/encryption');
  vi.unmock('@/lib/integrations/karri');
  vi.unmock('@/lib/config/feature-flags');
  vi.unmock('@sentry/nextjs');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('create flow step transitions', () => {
  it('full happy path: karri payout with no charity', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction, saveGivingBackAction, savePayoutAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(20));
    await expectRedirect(saveDatesAction(datesForm), '/create/giving-back');

    expect(store[hostId].birthdayDate).toBe(addDays(20));
    expect(store[hostId].partyDate).toBe(addDays(20));
    expect(store[hostId].campaignEndDate).toBe(addDays(20));

    const givingBackForm = new FormData();
    await expectRedirect(saveGivingBackAction(givingBackForm), '/create/payout');

    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].charityId).toBeUndefined();

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'karri_card');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('karriCardNumber', '1234567890123456');
    payoutForm.set('karriCardHolderName', 'Maya Parent');

    await expectRedirect(savePayoutAction(payoutForm), '/create/review');

    expect(store[hostId].karriCardNumberEncrypted).toBe('enc:1234567890123456');
    expect(store[hostId].bankAccountNumberEncrypted).toBeUndefined();

    const view = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(view.redirectTo).toBeUndefined();
  });

  it('full happy path: bank payout with charity percentage split', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction, saveGivingBackAction, savePayoutAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(25));
    await expectRedirect(saveDatesAction(datesForm), '/create/giving-back');

    const givingBackForm = new FormData();
    givingBackForm.set('charityEnabled', 'on');
    givingBackForm.set('charityId', '00000000-0000-4000-8000-000000000001');
    givingBackForm.set('charitySplitType', 'percentage');
    givingBackForm.set('charityPercentage', '25');
    await expectRedirect(saveGivingBackAction(givingBackForm), '/create/payout');

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'bank');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('bankName', 'Standard Bank');
    payoutForm.set('bankAccountNumber', '123456789012');
    payoutForm.set('bankBranchCode', '051001');
    payoutForm.set('bankAccountHolder', 'Maya Parent');
    await expectRedirect(savePayoutAction(payoutForm), '/create/review');

    expect(store[hostId].charityPercentageBps).toBe(2500);
    expect(store[hostId].charityThresholdCents).toBeUndefined();
    expect(store[hostId].bankAccountNumberEncrypted).toBe('enc:123456789012');
  });

  it('full happy path: bank payout with charity threshold split', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction, saveGivingBackAction, savePayoutAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(25));
    await expectRedirect(saveDatesAction(datesForm), '/create/giving-back');

    const givingBackForm = new FormData();
    givingBackForm.set('charityEnabled', 'on');
    givingBackForm.set('charityId', '00000000-0000-4000-8000-000000000001');
    givingBackForm.set('charitySplitType', 'threshold');
    givingBackForm.set('charityThresholdAmount', '120');
    await expectRedirect(saveGivingBackAction(givingBackForm), '/create/payout');

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'bank');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('bankName', 'Standard Bank');
    payoutForm.set('bankAccountNumber', '123456789012');
    payoutForm.set('bankBranchCode', '051001');
    payoutForm.set('bankAccountHolder', 'Maya Parent');
    await expectRedirect(savePayoutAction(payoutForm), '/create/review');

    expect(store[hostId].charityThresholdCents).toBe(12000);
    expect(store[hostId].charityPercentageBps).toBeUndefined();
  });

  it('prevents skipping steps and redirects to unmet prerequisite', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
        birthdayDate: addDays(20),
        partyDate: addDays(20),
        campaignEndDate: addDays(20),
      },
    };

    const { savePayoutAction } = await loadActions(store);

    const payoutForm = new FormData();
    payoutForm.set('payoutMethod', 'karri_card');
    payoutForm.set('payoutEmail', 'parent@example.com');
    payoutForm.set('hostWhatsAppNumber', '+27821234567');
    payoutForm.set('karriCardNumber', '1234567890123456');
    payoutForm.set('karriCardHolderName', 'Maya Parent');

    await expectRedirect(savePayoutAction(payoutForm), '/create/giving-back');

    const reviewView = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(reviewView.redirectTo).toBe('/create/payout');
  });

  it('preserves draft data across reload and later updates', async () => {
    process.env.CARD_DATA_ENCRYPTION_KEY = 'secret';

    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(21));
    datesForm.set('partyDateEnabled', 'on');
    datesForm.set('partyDate', addDays(23));
    datesForm.set('campaignEndDate', addDays(23));

    await expectRedirect(saveDatesAction(datesForm), '/create/giving-back');

    expect(store[hostId].childName).toBe('Maya');
    expect(store[hostId].giftName).toBe('Scooter');
    expect(store[hostId].partyDate).toBe(addDays(23));

    store[hostId] = {
      ...store[hostId],
      giftName: 'Scooter Deluxe',
    };

    expect(store[hostId].partyDate).toBe(addDays(23));
    expect(store[hostId].campaignEndDate).toBe(addDays(23));
  });

  it('clears charity fields when toggling giving-back off after it was enabled', async () => {
    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
        birthdayDate: addDays(20),
        partyDate: addDays(20),
        campaignEndDate: addDays(20),
      },
    };

    const { saveGivingBackAction } = await loadActions(store);

    const onForm = new FormData();
    onForm.set('charityEnabled', 'on');
    onForm.set('charityId', '00000000-0000-4000-8000-000000000001');
    onForm.set('charitySplitType', 'percentage');
    onForm.set('charityPercentage', '30');
    await expectRedirect(saveGivingBackAction(onForm), '/create/payout');

    expect(store[hostId].charityEnabled).toBe(true);
    expect(store[hostId].charityPercentageBps).toBe(3000);

    const offForm = new FormData();
    await expectRedirect(saveGivingBackAction(offForm), '/create/payout');

    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].charityId).toBeUndefined();
    expect(store[hostId].charitySplitType).toBeUndefined();
    expect(store[hostId].charityPercentageBps).toBeUndefined();
    expect(store[hostId].charityThresholdCents).toBeUndefined();
  });
});
