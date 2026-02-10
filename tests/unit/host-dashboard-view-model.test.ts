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
      giftName: 'Scooter',
      giftImageUrl: 'https://example.com/scooter.jpg',
      partyDate: '2099-06-12',
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
  });

  it('builds ended and no-deadline labels deterministically', () => {
    const endedCard = buildDashboardCardViewModel({
      id: 'board-ended',
      slug: 'ended-board',
      childName: 'Ava',
      childPhotoUrl: '',
      giftName: 'Bike',
      giftImageUrl: '',
      partyDate: '2025-01-05',
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
      giftName: 'Blocks',
      giftImageUrl: '',
      partyDate: '',
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

  it('keeps funded boards editable/non-complete on detail model', () => {
    const detail = buildDashboardDetailViewModel(
      {
        id: 'board-2',
        hostId: 'host-1',
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
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
  });

  it('keeps compatibility wrapper share URL behavior', () => {
    const view = buildDashboardViewModel(
      {
        id: 'board-1',
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-12',
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
