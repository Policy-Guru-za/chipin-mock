import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  getDashboardDetailExpanded: vi.fn(),
  listPayoutsForDreamBoard: vi.fn(),
  listCompletedContributionsForDreamBoard: vi.fn(),
  listBirthdayMessages: vi.fn(),
}));

const viewModelMocks = vi.hoisted(() => ({
  buildDashboardDetailViewModel: vi.fn(),
}));

const detailClientMock = vi.hoisted(() => vi.fn());
const postCampaignClientMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/clerk-wrappers', () => authMocks);
vi.mock('@/lib/host/queries', () => queryMocks);
vi.mock('@/lib/host/dashboard-view-model', () => viewModelMocks);
vi.mock('@/app/(host)/dashboard/[id]/actions', () => ({
  updateDreamBoard: vi.fn(),
}));
vi.mock('@/app/(host)/dashboard/[id]/DashboardDetailClient', () => ({
  DashboardDetailClient: (props: unknown) => {
    detailClientMock(props);
    return <div data-testid="dashboard-detail-client" />;
  },
}));
vi.mock('@/app/(host)/dashboard/[id]/DashboardPostCampaignClient', () => ({
  DashboardPostCampaignClient: (props: unknown) => {
    postCampaignClientMock(props);
    return <div data-testid="dashboard-post-campaign-client" />;
  },
}));

import DreamBoardDetailPage from '@/app/(host)/dashboard/[id]/page';

const board = {
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
  status: 'funded',
  goalCents: 50000,
  payoutMethod: 'karri_card',
  karriCardHolderName: 'Maya Parent',
  bankAccountHolder: null,
  payoutEmail: 'parent@example.com',
  charityEnabled: false,
  charityName: null,
  totalRaisedCents: 30000,
  totalFeeCents: 900,
  totalCharityCents: 0,
  contributionCount: 2,
  messageCount: 1,
};

describe('dashboard detail page orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDashboardDetailExpanded.mockResolvedValue(board);
    queryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);
    queryMocks.listCompletedContributionsForDreamBoard.mockResolvedValue([]);
    queryMocks.listBirthdayMessages.mockResolvedValue([]);
  });

  it('routes funded boards to active detail client', async () => {
    viewModelMocks.buildDashboardDetailViewModel.mockReturnValue({
      boardId: 'board-1',
      isComplete: false,
    });

    const html = renderToStaticMarkup(
      await DreamBoardDetailPage({ params: Promise.resolve({ id: 'board-1' }) })
    );

    expect(html).toContain('dashboard-detail-client');
    expect(html).not.toContain('dashboard-post-campaign-client');
    expect(queryMocks.listCompletedContributionsForDreamBoard).toHaveBeenCalledWith('board-1');
    expect(queryMocks.listBirthdayMessages).toHaveBeenCalledWith('board-1');
  });

  it('routes closed boards to post-campaign client', async () => {
    viewModelMocks.buildDashboardDetailViewModel.mockReturnValue({
      boardId: 'board-1',
      isComplete: true,
    });

    const html = renderToStaticMarkup(
      await DreamBoardDetailPage({ params: Promise.resolve({ id: 'board-1' }) })
    );

    expect(html).toContain('dashboard-post-campaign-client');
    expect(html).not.toContain('dashboard-detail-client');
  });
});
