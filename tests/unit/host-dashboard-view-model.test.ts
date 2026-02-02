import { describe, expect, it } from 'vitest';

import { buildDashboardViewModel } from '@/lib/host/dashboard-view-model';

describe('buildDashboardViewModel', () => {
  it('builds status, percentage, and share data', () => {
    const view = buildDashboardViewModel(
      {
        id: 'board-1',
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: 'https://example.com/child.jpg',
        giftName: 'Scooter',
        giftImageUrl: 'https://example.com/scooter.jpg',
        goalCents: 5000,
        status: 'paid_out',
        raisedCents: 6000,
        contributionCount: 4,
      },
      { baseUrl: 'https://chipin.co.za' }
    );

    expect(view.boardTitle).toBe("Maya's Dream Board");
    expect(view.statusLabel).toBe('Paid out');
    expect(view.percentage).toBe(100);
    expect(view.shareUrl).toBe('https://chipin.co.za/maya-birthday-123');
    expect(view.displayTitle).toBe('Scooter');
  });
});
