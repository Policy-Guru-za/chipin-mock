/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';
import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';
import { ReturnVisitBanner } from '@/components/dream-board/ReturnVisitBanner';
import { TimeRemaining } from '@/components/dream-board/TimeRemaining';
import { buildGuestViewModel } from '@/lib/dream-boards/view-model';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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
    contributionCount: 0,
    ...overrides,
  }) as BoardRecord;

const makeContributors = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Person ${index + 1}`,
    isAnonymous: false,
    avatarColorIndex: index,
  }));

function PublicBoardHarness({ board, contributors }: { board: BoardRecord; contributors: ReturnType<typeof makeContributors> }) {
  const view = buildGuestViewModel(board, { now });

  return (
    <div>
      <TimeRemaining
        message={view.timeRemainingMessage}
        urgency={view.timeRemainingUrgency}
        daysLeft={view.daysLeft}
      />
      <ContributorDisplay contributors={contributors} totalCount={view.contributionCount} />
      {view.charityEnabled && view.charityName && view.charityAllocationLabel ? (
        <CharitableGivingCard
          charityName={view.charityName}
          charityDescription={view.charityDescription}
          charityLogoUrl={view.charityLogoUrl}
          allocationLabel={view.charityAllocationLabel}
        />
      ) : null}
      {view.isFunded ? <p>Goal reached!</p> : null}
      <ReturnVisitBanner
        slug={view.slug}
        childName={view.childName}
        href={`/${view.slug}/contribute?source=dream-board`}
        isExpired={view.isExpired || view.isClosed}
      />
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
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('renders charity section when enabled', () => {
    const board = makeBoard({
      charityEnabled: true,
      charityName: 'Ikamva Youth',
      charitySplitType: 'percentage',
      charityPercentageBps: 2500,
      contributionCount: 5,
    });
    render(<PublicBoardHarness board={board} contributors={makeContributors(5)} />);

    expect(screen.getByText('Ikamva Youth')).toBeInTheDocument();
    expect(screen.getByText('25% of contributions support Ikamva Youth')).toBeInTheDocument();
  });

  it('hides charity section when disabled', () => {
    const board = makeBoard({ charityEnabled: false, contributionCount: 5 });
    render(<PublicBoardHarness board={board} contributors={makeContributors(5)} />);

    expect(screen.queryByText('Ikamva Youth')).not.toBeInTheDocument();
  });

  it('shows empty contributor state for zero contributors', () => {
    render(<PublicBoardHarness board={makeBoard({ contributionCount: 0 })} contributors={[]} />);
    expect(screen.getByText('Be the first to chip in... 🎁')).toBeInTheDocument();
  });

  it('shows all 5 contributors', () => {
    render(<PublicBoardHarness board={makeBoard({ contributionCount: 5 })} contributors={makeContributors(5)} />);
    expect(screen.getAllByText('Person 5')).toHaveLength(1);
    expect(screen.queryByText(/\+ .* others/)).not.toBeInTheDocument();
  });

  it('shows first 5 and +15 others for 20 contributors', () => {
    render(
      <PublicBoardHarness board={makeBoard({ contributionCount: 20 })} contributors={makeContributors(20)} />
    );
    expect(screen.getByText('+ 15 others ➜')).toBeInTheDocument();
    expect(screen.queryByText('Person 6')).not.toBeInTheDocument();
  });

  it('disables CTA and shows expired message for expired boards', () => {
    const board = makeBoard({
      campaignEndDate: addDays(-1),
      contributionCount: 1,
    });

    render(<PublicBoardHarness board={board} contributors={makeContributors(1)} />);
    expect(screen.getByText(/Dream Board is closed to new contributions/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chip in for Maya/i })).toBeDisabled();
  });

  it('shows funded banner when board is funded', () => {
    const board = makeBoard({ raisedCents: 60000, goalCents: 50000, contributionCount: 2 });
    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(screen.getByText('Goal reached!')).toBeInTheDocument();
  });

  it('keeps CTA enabled for funded status boards', () => {
    const board = makeBoard({
      status: 'funded',
      raisedCents: 60000,
      goalCents: 50000,
      contributionCount: 2,
      campaignEndDate: addDays(10),
    });
    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(screen.getByRole('button', { name: /Chip in for Maya/i })).toBeEnabled();
  });

  it('keeps CTA enabled for active boards', () => {
    const board = makeBoard({ contributionCount: 2, campaignEndDate: addDays(10) });
    render(<PublicBoardHarness board={board} contributors={makeContributors(2)} />);
    expect(screen.getByRole('button', { name: /Chip in for Maya/i })).toBeEnabled();
    expect(screen.getByText(/days left to chip in|Plenty of time|Just .* days left/)).toBeInTheDocument();
  });
});
