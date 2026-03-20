import { describe, expect, it } from 'vitest';

import type { HostCreateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const baseDraft: HostCreateDreamBoardDraft = {
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftDescription: 'A mint green scooter with streamers.',
  giftImageUrl: 'https://example.com/scooter.jpg',
  goalCents: 52000,
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  campaignEndDate: '2026-06-12',
  payoutMethod: 'karri_card',
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardNumberEncrypted: 'encrypted',
  karriCardHolderName: 'Maya Parent',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildCreateFlowViewModel', () => {
  it('builds 5-step labels', () => {
    expect(buildCreateFlowViewModel({ step: 'child', draft: baseDraft }).stepLabel).toBe(
      'Step 1 of 5 — The Child'
    );
    expect(buildCreateFlowViewModel({ step: 'gift', draft: baseDraft }).stepLabel).toBe(
      'Step 2 of 5 — The Gift'
    );
    expect(buildCreateFlowViewModel({ step: 'dates', draft: baseDraft }).stepLabel).toBe(
      'Step 3 of 5 — The Dates'
    );
    expect(buildCreateFlowViewModel({ step: 'payout', draft: baseDraft }).stepLabel).toBe(
      'Step 4 of 5 — Payout Details'
    );
    expect(buildCreateFlowViewModel({ step: 'review', draft: baseDraft }).stepLabel).toBe(
      'Step 5 of 5 — Review'
    );
  });

  it('redirects missing prerequisites through child, gift, dates, and payout', () => {
    expect(buildCreateFlowViewModel({ step: 'gift', draft: null }).redirectTo).toBe('/create/child');
    expect(buildCreateFlowViewModel({ step: 'dates', draft: null }).redirectTo).toBe('/create/gift');
    expect(buildCreateFlowViewModel({ step: 'payout', draft: null }).redirectTo).toBe('/create/dates');
    expect(buildCreateFlowViewModel({ step: 'review', draft: null }).redirectTo).toBe('/create/payout');
  });

  it('treats dates as complete only when birthday, party, and campaign dates exist', () => {
    expect(
      buildCreateFlowViewModel({
        step: 'payout',
        draft: { ...baseDraft, birthdayDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(
      buildCreateFlowViewModel({
        step: 'payout',
        draft: { ...baseDraft, partyDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(
      buildCreateFlowViewModel({
        step: 'payout',
        draft: { ...baseDraft, campaignEndDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(buildCreateFlowViewModel({ step: 'payout', draft: baseDraft }).redirectTo).toBeUndefined();
  });

  it('treats payout as complete for Karri only with required fields', () => {
    expect(buildCreateFlowViewModel({ step: 'review', draft: baseDraft }).redirectTo).toBeUndefined();

    expect(
      buildCreateFlowViewModel({
        step: 'review',
        draft: { ...baseDraft, payoutEmail: undefined },
      }).redirectTo
    ).toBe('/create/payout');

    expect(
      buildCreateFlowViewModel({
        step: 'review',
        draft: { ...baseDraft, hostWhatsAppNumber: undefined },
      }).redirectTo
    ).toBe('/create/payout');

    expect(
      buildCreateFlowViewModel({
        step: 'review',
        draft: { ...baseDraft, karriCardNumberEncrypted: undefined },
      }).redirectTo
    ).toBe('/create/payout');
  });

  it('treats payout as complete for bank only with all required fields', () => {
    const bankDraft: HostCreateDreamBoardDraft = {
      ...baseDraft,
      payoutMethod: 'bank',
      karriCardNumberEncrypted: undefined,
      karriCardHolderName: undefined,
      bankName: 'Standard Bank',
      bankAccountNumberEncrypted: 'encrypted-bank',
      bankAccountLast4: '1234',
      bankBranchCode: '051001',
      bankAccountHolder: 'Maya Parent',
    };

    expect(buildCreateFlowViewModel({ step: 'review', draft: bankDraft }).redirectTo).toBeUndefined();

    expect(
      buildCreateFlowViewModel({
        step: 'review',
        draft: { ...bankDraft, bankAccountLast4: undefined },
      }).redirectTo
    ).toBe('/create/payout');
  });

  it('uses payout-specific copy for the new step', () => {
    const view = buildCreateFlowViewModel({ step: 'payout', draft: baseDraft });

    expect(view.title).toBe('Where should the funds go?');
    expect(view.subtitle).toContain("Maya's Dreamboard closes");
  });
});
