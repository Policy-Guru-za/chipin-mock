import { describe, expect, it } from 'vitest';

import { buildGuestViewModel, buildThankYouViewModel } from '@/lib/dream-boards/view-model';

type BoardRecord = Parameters<typeof buildGuestViewModel>[0];

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (base: Date, days: number) => {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
};

const now = new Date('2026-02-01T12:00:00.000Z');

const makeBoard = (overrides: Partial<BoardRecord> = {}) =>
  ({
    id: 'board-1',
    slug: 'maya-birthday-123',
    hostId: 'host-1',
    childName: 'Maya',
    childPhotoUrl: 'https://example.com/child.jpg',
    childAge: 7,
    birthdayDate: addDays(now, 10),
    partyDate: addDays(now, 12),
    partyDateTime: null,
    campaignEndDate: addDays(now, 10),
    giftName: 'Scooter',
    giftDescription: 'Mint scooter',
    giftImageUrl: 'https://example.com/scooter.jpg',
    giftImagePrompt: 'A mint scooter',
    goalCents: 50000,
    payoutMethod: 'karri_card',
    payoutEmail: 'parent@example.com',
    charityEnabled: false,
    charityId: null,
    charitySplitType: null,
    charityPercentageBps: null,
    charityThresholdCents: null,
    charityName: null,
    charityDescription: null,
    charityLogoUrl: null,
    charityCategory: null,
    message: 'You can do it!',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    raisedCents: 12000,
    contributionCount: 4,
    ...overrides,
  }) as BoardRecord;

describe('GuestViewModel time remaining', () => {
  it('maps >14 days to relaxed', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, 20) }), { now });
    expect(view.timeRemainingUrgency).toBe('relaxed');
    expect(view.timeRemainingMessage).toContain('Plenty of time');
  });

  it('maps 7-14 days to moderate', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, 10) }), { now });
    expect(view.timeRemainingUrgency).toBe('moderate');
    expect(view.timeRemainingMessage).toContain('11 days left');
  });

  it('maps 2-6 days to urgent', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, 3) }), { now });
    expect(view.timeRemainingUrgency).toBe('urgent');
    expect(view.timeRemainingMessage).toContain('Just 4 days left');
  });

  it('maps 1 day to critical last-day copy', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, 1) }), { now });
    expect(view.timeRemainingUrgency).toBe('critical');
    expect(view.timeRemainingMessage).toContain('Last day');
  });

  it('maps same-day closing to critical final-hours copy', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, 0) }), { now });
    expect(view.timeRemainingUrgency).toBe('critical');
    expect(view.timeRemainingMessage).toContain('Final hours');
  });

  it('maps past campaign end to expired', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: addDays(now, -1) }), { now });
    expect(view.timeRemainingUrgency).toBe('expired');
    expect(view.timeRemainingMessage).toBe('This Dreamboard is closed to new contributions.');
  });
});

describe('GuestViewModel board states', () => {
  it('sets active/open flags', () => {
    const view = buildGuestViewModel(makeBoard({ status: 'active', raisedCents: 1000 }), { now });
    expect(view.isActive).toBe(true);
    expect(view.isClosed).toBe(false);
    expect(view.isFunded).toBe(false);
    expect(view.isExpired).toBe(false);
  });

  it('marks funded based on board status', () => {
    const view = buildGuestViewModel(
      makeBoard({ status: 'funded', raisedCents: 60000, goalCents: 50000 }),
      { now }
    );
    expect(view.isFunded).toBe(true);
  });

  it('marks closed when status is not active', () => {
    const view = buildGuestViewModel(makeBoard({ status: 'closed' }), { now });
    expect(view.isActive).toBe(false);
    expect(view.isClosed).toBe(true);
  });

  it('keeps funded boards open for additional contributions', () => {
    const view = buildGuestViewModel(makeBoard({ status: 'funded' }), { now });
    expect(view.isActive).toBe(false);
    expect(view.isClosed).toBe(false);
    expect(view.isFunded).toBe(true);
  });

  it('marks expired when party date has passed', () => {
    const view = buildGuestViewModel(makeBoard({ partyDate: addDays(now, -1) }), { now });
    expect(view.isExpired).toBe(true);
  });
});

describe('GuestViewModel charity allocation label', () => {
  it('builds percentage allocation label', () => {
    const view = buildGuestViewModel(
      makeBoard({
        charityEnabled: true,
        charityName: 'Ikamva Youth',
        charitySplitType: 'percentage',
        charityPercentageBps: 2500,
      }),
      { now }
    );

    expect(view.charityAllocationLabel).toBe('25% of contributions support Ikamva Youth');
  });

  it('builds threshold allocation label', () => {
    const view = buildGuestViewModel(
      makeBoard({
        charityEnabled: true,
        charityName: 'Ikamva Youth',
        charitySplitType: 'threshold',
        charityThresholdCents: 50000,
      }),
      { now }
    );

    expect(view.charityAllocationLabel).toBe('Up to R500 will go to Ikamva Youth');
  });

  it('returns null allocation label when charity is disabled', () => {
    const view = buildGuestViewModel(makeBoard({ charityEnabled: false }), { now });
    expect(view.charityAllocationLabel).toBeNull();
  });
});

describe('ThankYouViewModel', () => {
  it('returns personalized contributor details', () => {
    const view = buildThankYouViewModel({
      board: makeBoard({
        charityEnabled: true,
        charityName: 'Ikamva Youth',
        charitySplitType: 'percentage',
        charityPercentageBps: 2000,
      }),
      contribution: {
        id: 'contribution-1',
        dreamBoardId: 'board-1',
        contributorName: 'Ava',
        contributorEmail: 'ava@example.com',
        isAnonymous: false,
        amountCents: 10000,
        feeCents: 0,
        netCents: 10000,
        charityCents: 2000,
        message: null,
        partnerId: 'partner-1',
        paymentStatus: 'completed',
        createdAt: new Date(),
      },
    });

    expect(view.contributorName).toBe('Ava');
    expect(view.isAnonymous).toBe(false);
    expect(view.charityAmountCents).toBe(2000);
  });

  it('handles anonymous contributor and threshold charity amount', () => {
    const view = buildThankYouViewModel({
      board: makeBoard({
        charityEnabled: true,
        charityName: 'Ikamva Youth',
        charitySplitType: 'threshold',
        charityThresholdCents: 5000,
      }),
      contribution: {
        id: 'contribution-2',
        dreamBoardId: 'board-1',
        contributorName: null,
        contributorEmail: null,
        isAnonymous: true,
        amountCents: 12000,
        feeCents: 0,
        netCents: 12000,
        charityCents: 1500,
        message: null,
        partnerId: 'partner-1',
        paymentStatus: 'completed',
        createdAt: new Date(),
      },
    });

    expect(view.isAnonymous).toBe(true);
    expect(view.charityAmountCents).toBe(1500);
    expect(view.childName).toBe('Maya');
  });

  it('defaults to non-anonymous when contribution is missing', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: null,
    });

    expect(view.isAnonymous).toBe(false);
    expect(view.isContributionCompleted).toBe(false);
  });
});
