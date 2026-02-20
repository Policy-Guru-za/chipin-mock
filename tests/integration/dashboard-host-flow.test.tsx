/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';

const authMocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  listDreamBoardsForHostExpanded: vi.fn(),
  getDashboardDetailExpanded: vi.fn(),
  listPayoutsForDreamBoard: vi.fn(),
  listCompletedContributionsForDreamBoard: vi.fn(),
  listBirthdayMessages: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => authMocks);
vi.mock('@/lib/host/queries', () => queryMocks);
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ refresh: vi.fn() }),
  };
});
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

import HostDashboardPage from '@/app/(host)/dashboard/page';
import DreamBoardDetailPage from '@/app/(host)/dashboard/[id]/page';

const boardListRow = {
  id: 'board-1',
  slug: 'maya-birthday',
  childName: 'Maya',
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  partyDate: '2099-06-12',
  campaignEndDate: '2099-06-10',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  status: 'closed',
  goalCents: 50000,
  charityEnabled: false,
  raisedCents: 50000,
  contributionCount: 2,
};

const boardDetailRow = {
  id: 'board-1',
  hostId: 'host-1',
  slug: 'maya-birthday',
  childName: 'Maya',
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  partyDate: '2099-06-12',
  campaignEndDate: '2099-06-10',
  message: 'A dream gift',
  status: 'closed',
  goalCents: 50000,
  payoutMethod: 'karri_card' as const,
  karriCardHolderName: 'Maya Parent',
  bankAccountHolder: null,
  payoutEmail: 'parent@example.com',
  charityEnabled: false,
  charityName: null,
  totalRaisedCents: 50000,
  totalFeeCents: 1500,
  totalCharityCents: 0,
  contributionCount: 2,
  messageCount: 1,
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
  authMocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
  queryMocks.listDreamBoardsForHostExpanded.mockResolvedValue([boardListRow]);
  queryMocks.getDashboardDetailExpanded.mockResolvedValue(boardDetailRow);
  queryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);
  queryMocks.listCompletedContributionsForDreamBoard.mockResolvedValue([
    {
      id: 'contrib-1',
      contributorName: 'Ava',
      isAnonymous: false,
      message: 'Happy birthday',
      paymentStatus: 'completed',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    {
      id: 'contrib-2',
      contributorName: 'Liam',
      isAnonymous: false,
      message: null,
      paymentStatus: 'completed',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    },
  ]);
  queryMocks.listBirthdayMessages.mockResolvedValue([
    {
      id: 'msg-1',
      contributorName: 'Ava',
      isAnonymous: false,
      message: 'Happy birthday',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('host dashboard flow', () => {
  it('renders active detail without per-contributor amounts while keeping aggregate totals', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue({
      ...boardDetailRow,
      status: 'funded',
      totalRaisedCents: 45000,
      totalFeeCents: 1350,
      contributionCount: 2,
      messageCount: 1,
    });

    render(await DreamBoardDetailPage({ params: Promise.resolve({ id: 'board-1' }) }));

    expect(screen.getByRole('heading', { name: /maya's dreamboard/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contributions \(2\)/i })).toBeInTheDocument();
    expect(screen.getAllByText('Ava').length).toBeGreaterThan(0);
    expect(screen.queryByText(/R\s*250/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download birthday messages/i })).toBeInTheDocument();
  });

  it('renders list card link and matching closed-board totals on detail page', async () => {
    render(await HostDashboardPage());
    const link = screen.getByRole('link', { name: /scooter — complete/i });
    expect(link).toHaveAttribute('href', '/dashboard/board-1');

    cleanup();
    render(await DreamBoardDetailPage({ params: Promise.resolve({ id: 'board-1' }) }));

    expect(screen.getByText(/Financial Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Raised/i)).toBeInTheDocument();
    expect(screen.getByText(/R\s*500/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download birthday messages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download contributor list/i })).toBeInTheDocument();
  });

  it('hides post-campaign download actions when counts are zero', async () => {
    queryMocks.getDashboardDetailExpanded.mockResolvedValue({
      ...boardDetailRow,
      totalRaisedCents: 0,
      totalFeeCents: 0,
      contributionCount: 0,
      messageCount: 0,
    });
    queryMocks.listCompletedContributionsForDreamBoard.mockResolvedValue([]);
    queryMocks.listBirthdayMessages.mockResolvedValue([]);

    render(await DreamBoardDetailPage({ params: Promise.resolve({ id: 'board-1' }) }));

    expect(screen.queryByRole('button', { name: /download birthday messages/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download contributor list/i })).not.toBeInTheDocument();
  });
});
