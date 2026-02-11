/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DashboardTimeline } from '@/components/dashboard-timeline/DashboardTimeline';
import type { DashboardCardViewModel } from '@/lib/host/dashboard-view-model';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

const makeCard = (overrides: Partial<DashboardCardViewModel> = {}): DashboardCardViewModel => ({
  boardId: 'board-1',
  boardTitle: "Maya's Dreamboard",
  raisedLabel: 'R 250',
  raisedCents: 25000,
  goalCents: 50000,
  contributionCount: 3,
  statusLabel: 'Active',
  manageHref: '/dashboard/board-1',
  displayTitle: 'Scooter',
  displaySubtitle: 'Dream gift',
  displayImage: null,
  slug: 'maya-birthday',
  childPhotoUrl: null,
  partyDate: new Date('2026-02-28T00:00:00.000Z'),
  campaignEndDate: new Date('2026-02-26T00:00:00.000Z'),
  daysRemaining: 17,
  timeLabel: '17 days left',
  statusVariant: 'active',
  isComplete: false,
  charityEnabled: false,
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe('DashboardTimeline', () => {
  it('renders hero, archived nodes, and create node', () => {
    render(
      <DashboardTimeline
        cards={[
          makeCard(),
          makeCard({
            boardId: 'board-2',
            boardTitle: "Emma's Dreamboard",
            displayTitle: 'Art Set',
            statusLabel: 'Complete',
            statusVariant: 'closed',
            manageHref: '/dashboard/board-2',
            partyDate: new Date('2025-08-10T00:00:00.000Z'),
            campaignEndDate: new Date('2025-08-08T00:00:00.000Z'),
            daysRemaining: null,
            timeLabel: 'Ended 8 Aug',
          }),
        ]}
      />
    );

    expect(screen.getByText('Happening now')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Scooter — Active' })).toHaveAttribute(
      'href',
      '/dashboard/board-1'
    );
    expect(screen.getByRole('link', { name: 'Art Set — Complete' })).toHaveAttribute(
      'href',
      '/dashboard/board-2'
    );
    expect(screen.getByText('Create another Dreamboard')).toBeInTheDocument();
  });

  it('treats first live board as hero and keeps additional live boards visible', () => {
    render(
      <DashboardTimeline
        cards={[
          makeCard(),
          makeCard({
            boardId: 'board-2',
            boardTitle: "Noah's Dreamboard",
            displayTitle: 'Playhouse',
            statusLabel: 'Funded!',
            statusVariant: 'funded',
            manageHref: '/dashboard/board-2',
            contributionCount: 8,
          }),
          makeCard({
            boardId: 'board-3',
            boardTitle: "Ava's Dreamboard",
            displayTitle: 'Skateboard',
            statusLabel: 'Complete',
            statusVariant: 'closed',
            manageHref: '/dashboard/board-3',
          }),
        ]}
      />
    );

    expect(screen.getAllByText('Happening now')).toHaveLength(1);
    expect(screen.getAllByText('Funded!').length).toBeGreaterThan(0);

    const boardLinks = screen
      .getAllByRole('link')
      .filter((link) => (link.getAttribute('href') ?? '').startsWith('/dashboard/'));
    expect(boardLinks).toHaveLength(3);
  });

  it('renders archived-only timeline without the hero label', () => {
    render(
      <DashboardTimeline
        cards={[
          makeCard({
            boardId: 'board-1',
            statusVariant: 'closed',
            statusLabel: 'Complete',
            daysRemaining: null,
            timeLabel: 'Ended 1 Jan',
          }),
          makeCard({
            boardId: 'board-2',
            boardTitle: "Luna's Dreamboard",
            displayTitle: 'Guitar',
            statusVariant: 'paid_out',
            statusLabel: 'Complete',
            manageHref: '/dashboard/board-2',
            daysRemaining: null,
            timeLabel: 'Ended 4 Jan',
          }),
        ]}
      />
    );

    expect(screen.queryByText('Happening now')).not.toBeInTheDocument();
    expect(screen.getByText('Create another Dreamboard')).toBeInTheDocument();

    const boardLinks = screen
      .getAllByRole('link')
      .filter((link) => (link.getAttribute('href') ?? '').startsWith('/dashboard/'));
    expect(boardLinks).toHaveLength(2);
  });
});
