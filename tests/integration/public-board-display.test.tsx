/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import {
  buildDreamboardCtaStateMessage,
  DreamboardCtaCard,
} from '@/components/dream-board/DreamboardCtaCard';
import { DreamboardDetailsCard } from '@/components/dream-board/DreamboardDetailsCard';
import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';
import { formatBirthdayPartyLine, hasBirthdayParty } from '@/lib/dream-boards/party-visibility';
import { buildGuestViewModel } from '@/lib/dream-boards/view-model';

type BoardRecord = Parameters<typeof buildGuestViewModel>[0];

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
    partyDateTime: null,
    campaignEndDate: addDays(10),
    giftName: 'Scooter',
    giftDescription: 'Mint scooter',
    giftImageUrl: 'https://example.com/gift.jpg',
    giftImagePrompt: null,
    goalCents: 50000,
    payoutMethod: 'bank',
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
    contributionCount: 0,
    ...overrides,
  }) as BoardRecord;

const makeContributors = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Person ${index + 1}`,
    isAnonymous: false,
  }));

function PublicBoardHarness({
  board,
  contributors,
}: {
  board: BoardRecord;
  contributors: ReturnType<typeof makeContributors>;
}) {
  const view = buildGuestViewModel(board, { now });
  const hasPartyOutput = hasBirthdayParty({
    birthdayDate: board.birthdayDate,
    partyDate: board.partyDate,
    partyDateTime: view.partyDateTime,
  });
  const partySummary = formatBirthdayPartyLine({
    birthdayDate: board.birthdayDate,
    partyDate: board.partyDate,
    partyDateTime: view.partyDateTime,
  });
  const partyDateTimeLine = partySummary ? `Birthday Party · ${partySummary}` : null;
  const ctaStateMessage = buildDreamboardCtaStateMessage({
    contributionCount: view.contributionCount,
    isFunded: view.isFunded,
    isExpired: view.isExpired,
    isClosed: view.isClosed,
    timeRemainingMessage: view.timeRemainingMessage,
  });

  return (
    <div>
      <DreamboardCtaCard
        slug={view.slug}
        childName={view.childName}
        stateMessage={ctaStateMessage}
        disabled={view.isExpired || view.isClosed}
      />
      <ContributorDisplay contributors={contributors} totalCount={view.contributionCount} />
      {hasPartyOutput ? (
        <DreamboardDetailsCard
          partyDateTimeLine={partyDateTimeLine}
          hasBirthdayParty={hasPartyOutput}
        />
      ) : null}
    </div>
  );
}

describe('public board display integration', () => {
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
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('shows empty contributor state for zero contributors', () => {
    render(<PublicBoardHarness board={makeBoard({ contributionCount: 0 })} contributors={[]} />);
    expect(
      screen.getByText("We're finalizing Stitch-powered contributions for Gifta. Online payments are not available yet.")
    ).toBeInTheDocument();
  });

  it('shows all 5 contributors without overflow indicator', () => {
    render(<PublicBoardHarness board={makeBoard({ contributionCount: 5 })} contributors={makeContributors(5)} />);
    expect(screen.getByText('P5')).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('shows first 6 and overflow indicator for 20 contributors', () => {
    render(
      <PublicBoardHarness board={makeBoard({ contributionCount: 20 })} contributors={makeContributors(20)} />
    );
    expect(screen.getByText('+14')).toBeInTheDocument();
    expect(screen.getByText('P6')).toBeInTheDocument();
    expect(screen.queryByText('P7')).not.toBeInTheDocument();
  });

  it('disables CTA and shows closed message for expired boards', () => {
    const board = makeBoard({
      campaignEndDate: addDays(-1),
      contributionCount: 1,
    });

    render(<PublicBoardHarness board={board} contributors={makeContributors(1)} />);
    expect(screen.getByText('This Dreamboard is closed to new contributions.')).toBeInTheDocument();
  });

  it('shows funded celebration copy when board is funded', () => {
    const board = makeBoard({
      status: 'funded',
      raisedCents: 60000,
      goalCents: 50000,
      contributionCount: 2,
    });
    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(screen.getByText('This Dreamboard has already hit its goal.')).toBeInTheDocument();
  });

  it('shows Stitch placeholder copy for active boards with contributors', () => {
    const board = makeBoard({ contributionCount: 2, campaignEndDate: addDays(10) });
    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(
      screen.getByText("We're finalizing Stitch-powered contributions for Gifta. Online payments are not available yet.")
    ).toBeInTheDocument();
  });

  it('does not render location copy in details card', () => {
    const board = makeBoard({
      partyDate: addDays(22),
      partyDateTime: new Date(`${addDays(22)}T14:00:00.000Z`),
      contributionCount: 2,
    });

    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    expect(screen.queryByText(/Birthday Party\s*[·•]/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Shared after you chip in')).not.toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });

  it('hides details card entirely when no party details are available', () => {
    render(<PublicBoardHarness board={makeBoard({ contributionCount: 2 })} contributors={makeContributors(2)} />);

    expect(screen.queryByText('Birthday Party')).not.toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });
});
