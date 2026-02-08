import { describe, expect, it } from 'vitest';

import type { DreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const baseDraft: DreamBoardDraft = {
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
  charityEnabled: false,
  payoutMethod: 'karri_card',
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardNumberEncrypted: 'encrypted',
  karriCardHolderName: 'Maya Parent',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildCreateFlowViewModel', () => {
  it('builds 6-step labels', () => {
    expect(buildCreateFlowViewModel({ step: 'child', draft: baseDraft }).stepLabel).toBe(
      'Step 1 of 6 — The Child'
    );
    expect(buildCreateFlowViewModel({ step: 'gift', draft: baseDraft }).stepLabel).toBe(
      'Step 2 of 6 — The Gift'
    );
    expect(buildCreateFlowViewModel({ step: 'dates', draft: baseDraft }).stepLabel).toBe(
      'Step 3 of 6 — The Dates'
    );
    expect(buildCreateFlowViewModel({ step: 'giving-back', draft: baseDraft }).stepLabel).toBe(
      'Step 4 of 6 — Giving Back'
    );
    expect(buildCreateFlowViewModel({ step: 'payout', draft: baseDraft }).stepLabel).toBe(
      'Step 5 of 6 — Payout Setup'
    );
    expect(buildCreateFlowViewModel({ step: 'review', draft: baseDraft }).stepLabel).toBe(
      'Step 6 of 6 — Review'
    );
  });

  it('redirects to child when gift prerequisites are missing', () => {
    const view = buildCreateFlowViewModel({ step: 'gift', draft: null });

    expect(view.redirectTo).toBe('/create/child');
    expect(view.title).toBe("What's the dream gift?");
  });

  it('enforces prerequisite chain for dates, giving-back, payout, and review', () => {
    expect(buildCreateFlowViewModel({ step: 'dates', draft: null }).redirectTo).toBe('/create/gift');
    expect(buildCreateFlowViewModel({ step: 'giving-back', draft: null }).redirectTo).toBe(
      '/create/dates'
    );
    expect(buildCreateFlowViewModel({ step: 'payout', draft: null }).redirectTo).toBe(
      '/create/giving-back'
    );
    expect(buildCreateFlowViewModel({ step: 'review', draft: null }).redirectTo).toBe(
      '/create/payout'
    );
  });

  it('treats dates as complete only when birthday, party and campaign dates are present', () => {
    expect(
      buildCreateFlowViewModel({
        step: 'giving-back',
        draft: { ...baseDraft, birthdayDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(
      buildCreateFlowViewModel({
        step: 'giving-back',
        draft: { ...baseDraft, partyDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(
      buildCreateFlowViewModel({
        step: 'giving-back',
        draft: { ...baseDraft, campaignEndDate: undefined },
      }).redirectTo
    ).toBe('/create/dates');

    expect(buildCreateFlowViewModel({ step: 'giving-back', draft: baseDraft }).redirectTo).toBeUndefined();
  });

  it('treats giving-back as complete when charity is disabled', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: { ...baseDraft, charityEnabled: false },
    });

    expect(view.redirectTo).toBeUndefined();
  });

  it('treats giving-back as incomplete when charity has not been visited', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: { ...baseDraft, charityEnabled: undefined },
    });

    expect(view.redirectTo).toBe('/create/giving-back');
  });

  it('treats giving-back as complete when enabled with percentage config', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: {
        ...baseDraft,
        charityEnabled: true,
        charityId: '00000000-0000-4000-8000-000000000001',
        charitySplitType: 'percentage',
        charityPercentageBps: 2500,
      },
    });

    expect(view.redirectTo).toBeUndefined();
  });

  it('treats giving-back as complete when enabled with threshold config', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: {
        ...baseDraft,
        charityEnabled: true,
        charityId: '00000000-0000-4000-8000-000000000001',
        charitySplitType: 'threshold',
        charityThresholdCents: 15000,
      },
    });

    expect(view.redirectTo).toBeUndefined();
  });

  it('treats giving-back as incomplete when enabled but split values are missing', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: {
        ...baseDraft,
        charityEnabled: true,
        charityId: '00000000-0000-4000-8000-000000000001',
        charitySplitType: 'percentage',
        charityPercentageBps: undefined,
      },
    });

    expect(view.redirectTo).toBe('/create/giving-back');
  });

  it('treats payout as complete for karri method only with required fields', () => {
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
        draft: { ...baseDraft, karriCardNumberEncrypted: undefined },
      }).redirectTo
    ).toBe('/create/payout');
  });

  it('treats payout as complete for bank method only with all required fields', () => {
    const bankDraft: DreamBoardDraft = {
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

  it('prevents step skips to payout when giving-back is incomplete', () => {
    const view = buildCreateFlowViewModel({
      step: 'payout',
      draft: {
        ...baseDraft,
        charityEnabled: true,
        charityId: undefined,
        charitySplitType: undefined,
      },
    });

    expect(view.redirectTo).toBe('/create/giving-back');
  });
});
