import { describe, expect, it } from 'vitest';

import {
  buildDashboardCardViewModel,
  buildDashboardDetailViewModel,
  buildDashboardViewModel,
  buildFinancialBreakdown,
} from '@/lib/host/dashboard-view-model';

describe('host dashboard view model', () => {
  it('maps statuses on cards', () => {
    const card = buildDashboardCardViewModel({
      id: 'board-1',
      slug: 'maya-birthday-123',
      childName: 'Maya',
      childPhotoUrl: 'https://example.com/child.jpg',
      birthdayDate: '2099-06-12',
      giftName: 'Scooter',
      giftImageUrl: 'https://example.com/scooter.jpg',
      partyDate: '2099-06-12',
      partyDateTime: new Date('2099-06-14T09:30:00.000Z'),
      campaignEndDate: '2099-06-10',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'paid_out',
      goalCents: 5000,
      charityEnabled: false,
      raisedCents: 6000,
      contributionCount: 4,
    });

    expect(card.statusLabel).toBe('Complete');
    expect(card.statusVariant).toBe('paid_out');
    expect(card.timeLabel).toMatch(/days left/);
    expect(card.partyDateTime?.toISOString()).toBe('2099-06-14T09:30:00.000Z');
  });

  it('builds ended and no-deadline labels deterministically', () => {
    const endedCard = buildDashboardCardViewModel({
      id: 'board-ended',
      slug: 'ended-board',
      childName: 'Ava',
      childPhotoUrl: '',
      birthdayDate: '2025-01-05',
      giftName: 'Bike',
      giftImageUrl: '',
      partyDate: '2025-01-05',
      partyDateTime: null,
      campaignEndDate: '2025-01-04',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'closed',
      goalCents: 10000,
      charityEnabled: false,
      raisedCents: 8000,
      contributionCount: 2,
    });
    expect(endedCard.timeLabel).toMatch(/^Ended /);

    const noDeadlineCard = buildDashboardCardViewModel({
      id: 'board-no-deadline',
      slug: 'no-deadline-board',
      childName: 'Kai',
      childPhotoUrl: '',
      birthdayDate: null,
      giftName: 'Blocks',
      giftImageUrl: '',
      partyDate: '',
      partyDateTime: null,
      campaignEndDate: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'active',
      goalCents: 10000,
      charityEnabled: false,
      raisedCents: 2500,
      contributionCount: 1,
    });
    expect(noDeadlineCard.timeLabel).toBe('No deadline');
  });

  it('computes B6 financial breakdown as raised - fee - charity', () => {
    const breakdown = buildFinancialBreakdown(100000, 3000, 15000);
    expect(breakdown.netPayoutCents).toBe(82000);
  });

  it('derives hasBirthdayParty using birthday/party date and partyDateTime', () => {
    const noPartyCard = buildDashboardCardViewModel({
      id: 'board-no-party',
      slug: 'no-party',
      childName: 'Maya',
      childPhotoUrl: '',
      birthdayDate: '2099-06-12',
      giftName: 'Scooter',
      giftImageUrl: '',
      partyDate: '2099-06-12',
      partyDateTime: null,
      campaignEndDate: '2099-06-12',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'active',
      goalCents: 10000,
      charityEnabled: false,
      raisedCents: 0,
      contributionCount: 0,
    });
    expect(noPartyCard.hasBirthdayParty).toBe(false);

    const plannedPartyCard = buildDashboardCardViewModel({
      id: 'board-party',
      slug: 'party',
      childName: 'Maya',
      childPhotoUrl: '',
      birthdayDate: '2099-06-12',
      giftName: 'Scooter',
      giftImageUrl: '',
      partyDate: '2099-06-14',
      partyDateTime: null,
      campaignEndDate: '2099-06-14',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'active',
      goalCents: 10000,
      charityEnabled: false,
      raisedCents: 0,
      contributionCount: 0,
    });
    expect(plannedPartyCard.hasBirthdayParty).toBe(true);
  });

  it('keeps funded boards editable/non-complete on detail model', () => {
    const detail = buildDashboardDetailViewModel(
      {
        id: 'board-2',
        hostId: 'host-1',
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        birthdayDate: '2099-06-11',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-12',
        campaignEndDate: '2099-06-10',
        message: 'Welcome',
        status: 'funded',
        goalCents: 50000,
        payoutMethod: 'karri_card',
        karriCardHolderName: 'Maya Parent',
        bankAccountHolder: null,
        payoutEmail: 'parent@example.com',
        charityEnabled: true,
        charityName: 'Gift of the Givers',
        charitySplitType: 'percentage',
        charityPercentageBps: 1000,
        charityThresholdCents: null,
        totalRaisedCents: 55000,
        totalFeeCents: 1650,
        totalCharityCents: 5000,
        contributionCount: 11,
        messageCount: 6,
      },
      [],
      { baseUrl: 'https://gifta.co.za' }
    );

    expect(detail.statusLabel).toBe('Funded!');
    expect(detail.isFunded).toBe(true);
    expect(detail.isComplete).toBe(false);
    expect(detail.isEditable).toBe(true);
    expect(detail.netPayoutCents).toBe(48350);
    expect(detail.hasBirthdayParty).toBe(true);
    expect(detail.givingBackLabel).toBe('10% to Gift of the Givers');
  });

  it('suppresses giving-back label for threshold charity split', () => {
    const detail = buildDashboardDetailViewModel(
      {
        id: 'board-3',
        hostId: 'host-1',
        slug: 'maya-birthday-456',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        birthdayDate: '2099-06-11',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-12',
        campaignEndDate: '2099-06-10',
        message: null,
        status: 'active',
        goalCents: 50000,
        payoutMethod: 'karri_card',
        karriCardHolderName: 'Maya Parent',
        bankAccountHolder: null,
        payoutEmail: 'parent@example.com',
        charityEnabled: true,
        charityName: 'Gift of the Givers',
        charitySplitType: 'threshold',
        charityPercentageBps: null,
        charityThresholdCents: 500000,
        totalRaisedCents: 55000,
        totalFeeCents: 1650,
        totalCharityCents: 5000,
        contributionCount: 11,
        messageCount: 6,
      },
      [],
      { baseUrl: 'https://gifta.co.za' }
    );

    expect(detail.givingBackLabel).toBeNull();
  });

  it('marks detail as no-party when party date equals birthday and no party time exists', () => {
    const detail = buildDashboardDetailViewModel(
      {
        id: 'board-4',
        hostId: 'host-1',
        slug: 'maya-birthday-789',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        birthdayDate: '2099-06-11',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-11',
        partyDateTime: null,
        campaignEndDate: '2099-06-10',
        message: null,
        status: 'active',
        goalCents: 50000,
        payoutMethod: 'karri_card',
        karriCardHolderName: 'Maya Parent',
        bankAccountHolder: null,
        payoutEmail: 'parent@example.com',
        charityEnabled: false,
        charityName: null,
        charitySplitType: null,
        charityPercentageBps: null,
        charityThresholdCents: null,
        totalRaisedCents: 55000,
        totalFeeCents: 1650,
        totalCharityCents: 0,
        contributionCount: 11,
        messageCount: 6,
      },
      [],
      { baseUrl: 'https://gifta.co.za' }
    );

    expect(detail.hasBirthdayParty).toBe(false);
  });

  it('keeps compatibility wrapper share URL behavior', () => {
    const view = buildDashboardViewModel(
      {
        id: 'board-1',
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        birthdayDate: '2099-06-12',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-12',
        partyDateTime: null,
        campaignEndDate: '2099-06-10',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        status: 'active',
        goalCents: 5000,
        charityEnabled: false,
        raisedCents: 4000,
        contributionCount: 4,
      },
      { baseUrl: 'https://chipin.co.za' }
    );

    expect(view.boardTitle).toBe("Maya's Dreamboard");
    expect(view.shareUrl).toBe('https://chipin.co.za/maya-birthday-123');
  });
});
