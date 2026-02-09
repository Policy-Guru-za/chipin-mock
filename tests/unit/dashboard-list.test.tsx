import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  listDreamBoardsForHostExpanded: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => authMocks);
vi.mock('@/lib/host/queries', () => queryMocks);

import HostDashboardPage from '@/app/(host)/dashboard/page';

describe('HostDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
  });

  it('renders board cards and create card with dashboard links', async () => {
    queryMocks.listDreamBoardsForHostExpanded.mockResolvedValue([
      {
        id: 'board-1',
        slug: 'maya-birthday',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        partyDate: '2099-06-12',
        campaignEndDate: '2099-06-10',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        status: 'active',
        goalCents: 50000,
        charityEnabled: false,
        raisedCents: 25000,
        contributionCount: 3,
      },
    ]);

    const html = renderToStaticMarkup(await HostDashboardPage());

    expect(html).toContain("Maya&#x27;s Dream Board");
    expect(html).toContain('href="/dashboard/board-1"');
    expect(html).toContain('from 3 contributors');
    expect(html).toContain('Create a Dream Board +');
    expect(html).toContain('Create a Dream Board</span>');
  });

  it('renders empty state when host has no boards', async () => {
    queryMocks.listDreamBoardsForHostExpanded.mockResolvedValue([]);

    const html = renderToStaticMarkup(await HostDashboardPage());

    expect(html).toContain("You haven&#x27;t created a Dream Board yet.");
    expect(html).toContain('Create your first Dream Board');
  });
});
