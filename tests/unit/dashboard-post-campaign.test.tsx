/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { DashboardPostCampaignClient } from '@/app/(host)/dashboard/[id]/DashboardPostCampaignClient';
import type { DashboardDetailViewModel } from '@/lib/host/dashboard-view-model';

const fetchMock = vi.fn();

const baseView: DashboardDetailViewModel = {
  boardId: 'board-1',
  slug: 'maya-birthday',
  childName: 'Maya',
  childPhotoUrl: 'https://example.com/child.jpg',
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  partyDate: new Date('2099-06-12T00:00:00.000Z'),
  campaignEndDate: new Date('2099-06-10T00:00:00.000Z'),
  status: 'closed',
  statusLabel: 'Complete',
  statusVariant: 'closed',
  message: null,
  goalCents: 50000,
  raisedCents: 45000,
  percentage: 90,
  raisedLabel: 'R 450',
  goalLabel: 'R 500',
  progressLabel: '90% funded',
  totalFeeCents: 1350,
  totalCharityCents: 0,
  netPayoutCents: 43650,
  feeLabel: 'R 14',
  charityLabel: 'R 0',
  payoutLabel: 'R 437',
  contributionCount: 2,
  messageCount: 1,
  daysRemaining: null,
  timeLabel: 'Ended 10 Jan',
  payoutMethod: 'karri_card',
  payoutMethodLabel: 'Karri Card',
  payoutRecipientDisplay: 'Maya Parent',
  payouts: [],
  charityEnabled: false,
  charityName: null,
  shareUrl: 'https://gifta.co.za/maya-birthday',
  publicUrl: 'https://gifta.co.za/maya-birthday',
  isComplete: true,
  isFunded: false,
  isEditable: false,
};

beforeEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob://test'),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DashboardPostCampaignClient', () => {
  it('hides download actions when no messages or contributors exist', () => {
    render(
      <DashboardPostCampaignClient
        view={{ ...baseView, contributionCount: 0, messageCount: 0 }}
        contributions={[]}
        messages={[]}
      />
    );

    expect(screen.queryByRole('button', { name: /download birthday messages/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download contributor list/i })).not.toBeInTheDocument();
  });

  it('downloads CSV from contributor endpoint when button is clicked', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['Name'], { type: 'text/csv' }),
    });

    render(
      <DashboardPostCampaignClient
        view={{ ...baseView, contributionCount: 1, messageCount: 1 }}
        contributions={[
          {
            id: 'contrib-1',
            contributorName: 'Ava',
            isAnonymous: false,
            message: 'Happy birthday',
            amountCents: 25000,
            feeCents: 750,
            charityCents: 0,
            paymentStatus: 'completed',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]}
        messages={[
          {
            id: 'msg-1',
            contributorName: 'Ava',
            isAnonymous: false,
            message: 'Happy birthday',
            amountCents: 25000,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /download contributor list/i }));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/internal/downloads/contributor-list?dreamBoardId=board-1'
    );
  });
});
