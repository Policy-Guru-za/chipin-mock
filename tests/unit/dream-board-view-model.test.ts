import { describe, expect, it } from 'vitest';

import {
  buildContributionViewModel,
  buildGuestViewModel,
  buildThankYouViewModel,
} from '@/lib/dream-boards/view-model';

type DreamBoardRecord = Parameters<typeof buildGuestViewModel>[0];

const makeBoard = (overrides: Partial<DreamBoardRecord> = {}) =>
  ({
    id: 'board-1',
    slug: 'maya-birthday-123',
    hostId: 'host-1',
    childName: 'Maya',
    childPhotoUrl: 'https://example.com/child.jpg',
    partyDate: new Date('2026-02-01'),
    giftName: 'Scooter',
    giftImageUrl: 'https://example.com/scooter.jpg',
    giftImagePrompt: 'A mint green scooter',
    goalCents: 5000,
    payoutMethod: 'karri_card',
    message: 'Let’s do it',
    status: 'active',
    payoutEmail: 'maya@example.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    raisedCents: 1000,
    contributionCount: 2,
    ...overrides,
  }) as DreamBoardRecord;

describe('buildGuestViewModel', () => {
  it('builds a gift view model', () => {
    const view = buildGuestViewModel(makeBoard());

    expect(view.giftTitle).toBe('Scooter');
    expect(view.giftSubtitle).toBe('Dream gift');
    expect(view.displayTitle).toBe('Scooter');
    expect(view.displaySubtitle).toBe('Dream gift');
    expect(view.displayImage).toBe('https://example.com/scooter.jpg');
  });

  it('uses the injected clock for days left', () => {
    const view = buildGuestViewModel(
      makeBoard({ partyDate: new Date('2026-02-05T00:00:00.000Z') }),
      { now: new Date('2026-02-03T00:00:00.000Z') }
    );

    expect(view.daysLeft).toBe(3);
  });

  it('keeps the gift display when funded', () => {
    const view = buildGuestViewModel(makeBoard({ raisedCents: 6000 }));

    expect(view.displayTitle).toBe('Scooter');
    expect(view.displaySubtitle).toBe('Dream gift');
    expect(view.displayImage).toBe('https://example.com/scooter.jpg');
  });
});

describe('buildContributionViewModel', () => {
  it('builds a standard contribution headline', () => {
    const view = buildContributionViewModel(makeBoard());

    expect(view.headline).toBe("Chip in for Maya's dream gift");
  });

  it('keeps the standard contribution copy when funded', () => {
    const view = buildContributionViewModel(makeBoard({ raisedCents: 7000 }));

    expect(view.headline).toBe("Chip in for Maya's dream gift");
  });
});

describe('buildThankYouViewModel', () => {
  it('builds a completed thank-you message', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: {
        id: 'contrib-1',
        dreamBoardId: 'board-1',
        contributorName: 'Ava',
        amountCents: 2500,
        feeCents: 0,
        netCents: 2500,
        paymentStatus: 'completed',
      },
    });

    expect(view.headline).toBe('Thank you, Ava!');
    expect(view.message).toMatch(/You're helping Maya get their dream gift\./);
    expect(view.percentage).toBe(20);
    expect(view.isContributionCompleted).toBe(true);
  });

  it('builds a pending thank-you message', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: {
        id: 'contrib-2',
        dreamBoardId: 'board-1',
        contributorName: null,
        amountCents: 2500,
        feeCents: 0,
        netCents: 2500,
        paymentStatus: 'pending',
      },
    });

    expect(view.headline).toBe('Thanks for your support!');
    expect(view.message).toBe('We’ll update this page once your payment is confirmed.');
    expect(view.isContributionCompleted).toBe(false);
  });

  it('builds a gift thank-you message even when funded', () => {
    const view = buildThankYouViewModel({
      board: makeBoard({ raisedCents: 7000 }),
      contribution: {
        id: 'contrib-3',
        dreamBoardId: 'board-1',
        contributorName: 'Ava',
        amountCents: 2500,
        feeCents: 0,
        netCents: 2500,
        paymentStatus: 'completed',
      },
    });

    expect(view.message).toMatch(/helping Maya get their dream gift\./);
  });
});
