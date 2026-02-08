/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { ThankYouClient } from '@/app/(guest)/[slug]/thanks/ThankYouClient';
import { requestReceiptAction } from '@/app/(guest)/[slug]/thanks/page';
import { buildThankYouViewModel } from '@/lib/dream-boards/view-model';

vi.mock('@/components/effects/ConfettiTrigger', () => ({
  ConfettiTrigger: () => null,
}));

type BoardRecord = Parameters<typeof buildThankYouViewModel>[0]['board'];

const now = new Date('2026-02-01T12:00:00.000Z');

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
};

const makeBoard = (overrides: Partial<BoardRecord> = {}) =>
  ({
    id: 'board-1',
    slug: 'maya-birthday',
    hostId: 'host-1',
    childName: 'Maya',
    childPhotoUrl: 'https://example.com/child.jpg',
    childAge: 7,
    birthdayDate: addDays(20),
    partyDate: addDays(20),
    campaignEndDate: addDays(10),
    giftName: 'Scooter',
    giftDescription: 'Mint scooter',
    giftImageUrl: 'https://example.com/gift.jpg',
    giftImagePrompt: null,
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
    message: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    raisedCents: 12000,
    contributionCount: 4,
    ...overrides,
  }) as BoardRecord;

const makeContribution = (overrides: Record<string, unknown> = {}) => ({
  id: 'contribution-1',
  partnerId: 'partner-1',
  dreamBoardId: 'board-1',
  contributorName: 'Ava',
  contributorEmail: 'ava@example.com',
  isAnonymous: false,
  message: null,
  amountCents: 10000,
  feeCents: 0,
  netCents: 10000,
  charityCents: null,
  paymentStatus: 'completed',
  createdAt: new Date(),
  ...overrides,
});

describe('thank-you display integration', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn() },
      share: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('shows personalized heading when contributor has a name', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: makeContribution(),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.getByText('Thank you, Ava!')).toBeInTheDocument();
  });

  it('shows generic heading when contribution is anonymous', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: makeContribution({ contributorName: null, isAnonymous: true }),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.getByText('Thank you, Friend!')).toBeInTheDocument();
  });

  it('renders charity impact section when board has charity enabled', () => {
    const view = buildThankYouViewModel({
      board: makeBoard({
        charityEnabled: true,
        charityName: 'Ikamva Youth',
        charitySplitType: 'percentage',
        charityPercentageBps: 2000,
      }),
      contribution: makeContribution({ amountCents: 10000, charityCents: 2000 }),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.getAllByText(/Ikamva Youth/).length).toBeGreaterThan(0);
    expect(screen.getByText(/of your contribution will support Ikamva Youth/)).toBeInTheDocument();
  });

  it('hides charity impact section when board has no charity', () => {
    const view = buildThankYouViewModel({
      board: makeBoard({ charityEnabled: false }),
      contribution: makeContribution(),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.queryByText(/A GIFT THAT GIVES TWICE/)).not.toBeInTheDocument();
  });

  it('renders pending payment copy without success confirmation', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: makeContribution({ paymentStatus: 'pending' }),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.getByText('Thanks for your support!')).toBeInTheDocument();
    expect(screen.getByText('We’ll update this page once your payment is confirmed.')).toBeInTheDocument();
    expect(screen.queryByText(/parents have been notified/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Receipt' })).not.toBeInTheDocument();
  });

  it('renders no-ref state without contribution amount copy', () => {
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: null,
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    expect(screen.getByText('Thanks for your support!')).toBeInTheDocument();
    expect(screen.queryByText(/Contribution amount:/i)).not.toBeInTheDocument();
  });

  it('receipt action stub returns success', async () => {
    const result = await requestReceiptAction('contribution-1', 'ava@example.com');
    expect(result).toEqual({ success: true });
  });

  it('submits receipt request and shows success feedback', async () => {
    const user = userEvent.setup();
    const view = buildThankYouViewModel({
      board: makeBoard(),
      contribution: makeContribution(),
    });

    render(
      <ThankYouClient view={view} slug="maya-birthday" requestReceiptAction={async () => ({ success: true })} />
    );

    const emailField = screen.getByPlaceholderText('you@example.com');
    await user.clear(emailField);
    await user.type(emailField, 'ava@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Receipt' }));

    expect(await screen.findByText('Receipt sent to your email!')).toBeInTheDocument();
  });
});
