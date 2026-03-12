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
  vi.clearAllMocks();
  vi.resetModules();
});

describe('create flow step transitions', () => {
  it('full happy path: voucher placeholder with no charity', async () => {
    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction, savePayoutAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(20));
    datesForm.set('noPartyPlanned', 'on');
    await expectRedirect(saveDatesAction(datesForm), '/create/voucher');

    const voucherForm = new FormData();
    voucherForm.set('payoutEmail', 'parent@example.com');
    voucherForm.set('hostWhatsAppNumber', '+27821234567');
    await expectRedirect(savePayoutAction(voucherForm), '/create/review');

    expect(store[hostId].payoutMethod).toBe('takealot_voucher');
    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].bankAccountNumberEncrypted).toBeUndefined();
    expect(store[hostId].karriCardNumberEncrypted).toBeUndefined();

    const view = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(view.redirectTo).toBeUndefined();
  });

  it('prevents skipping voucher setup and redirects back to dates', async () => {
    const store: DraftRecord = {
      [hostId]: {
        ...seedChildAndGift(),
      },
    };

    const { savePayoutAction } = await loadActions(store);
    const voucherForm = new FormData();
    voucherForm.set('payoutEmail', 'parent@example.com');
    voucherForm.set('hostWhatsAppNumber', '+27821234567');

    await expectRedirect(savePayoutAction(voucherForm), '/create/dates');

    const reviewView = buildCreateFlowViewModel({ step: 'review', draft: store[hostId] as any });
    expect(reviewView.redirectTo).toBe('/create/voucher');
  });

  it('preserves draft data across later updates', async () => {
    const store: DraftRecord = { [hostId]: seedChildAndGift() };
    const { saveDatesAction } = await loadActions(store);

    const datesForm = new FormData();
    datesForm.set('birthdayDate', addDays(21));
    datesForm.set('partyDate', addDays(23));
    datesForm.set('campaignEndDate', addDays(23));

    await expectRedirect(saveDatesAction(datesForm), '/create/voucher');

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

    await expectRedirect(saveGivingBackAction(formData), '/create/voucher');

    expect(store[hostId].charityEnabled).toBe(false);
    expect(store[hostId].charityId).toBeUndefined();
    expect(store[hostId].charitySplitType).toBeUndefined();
    expect(store[hostId].charityPercentageBps).toBeUndefined();
    expect(store[hostId].charityThresholdCents).toBeUndefined();
  });

  it('preserves the host message while voucher details update later fields', async () => {
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

    const voucherForm = new FormData();
    voucherForm.set('payoutEmail', 'parent@example.com');
    voucherForm.set('hostWhatsAppNumber', '+27821234567');

    await expectRedirect(savePayoutAction(voucherForm), '/create/review');

    expect(store[hostId].message).toBe('Thanks for helping make this happen.');
    expect(store[hostId].payoutMethod).toBe('takealot_voucher');
  });
});
