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
  birthdayDate: new Date('2099-06-11T00:00:00.000Z'),
  giftName: 'Scooter',
  giftImageUrl: 'https://example.com/scooter.jpg',
  partyDate: new Date('2099-06-12T00:00:00.000Z'),
  hasBirthdayParty: true,
  campaignEndDate: new Date('2099-06-10T00:00:00.000Z'),
  status: 'closed',
  statusLabel: 'Complete',
  statusVariant: 'closed',
  message: null,
  goalCents: 50000,
  raisedCents: 45000,
  raisedLabel: 'R 450',
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
  givingBackLabel: null,
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

  it('does not render per-contributor amounts in contribution history', () => {
    render(
      <DashboardPostCampaignClient
        view={{ ...baseView, contributionCount: 1 }}
        contributions={[
          {
            id: 'contrib-2',
            contributorName: 'Guest A',
            isAnonymous: false,
            message: null,
            paymentStatus: 'completed',
            createdAt: new Date('2026-01-03T00:00:00.000Z'),
          },
        ]}
        messages={[]}
      />
    );

    const contributorsHeading = screen.getByRole('heading', { name: /contributors/i });
    expect(contributorsHeading).toHaveClass('text-[18px]');
    expect(contributorsHeading).not.toHaveClass('text-[28px]');
    expect(contributorsHeading.querySelector('span')).toHaveClass('text-[13px]');
    expect(screen.getByText('Guest A')).toBeInTheDocument();
    expect(screen.getByText('Guest A')).toHaveClass('text-sm');
    expect(screen.queryByText(/R\s*543/)).not.toBeInTheDocument();
  });

  it('renders birthday messages with quote-style cards', () => {
    const { container } = render(
      <DashboardPostCampaignClient
        view={{ ...baseView, messageCount: 1 }}
        contributions={[]}
        messages={[
          {
            id: 'msg-2',
            contributorName: 'Grandma Rose',
            isAnonymous: false,
            message: "Happy birthday, superstar!",
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]}
      />
    );

    const financialHeading = screen.getByRole('heading', { name: /financial summary/i });
    expect(financialHeading).toHaveClass('text-[18px]');
    expect(financialHeading).not.toHaveClass('text-[28px]');
    const payoutStatusHeading = screen.getByRole('heading', { name: /payout status/i });
    expect(payoutStatusHeading).toHaveClass('text-[18px]');
    const birthdayHeading = screen.getByRole('heading', { name: /birthday messages/i });
    expect(birthdayHeading).toHaveClass('text-[18px]');
    expect(screen.getByText('Grandma Rose')).toBeInTheDocument();
    expect(screen.getByText(/happy birthday, superstar!/i)).toBeInTheDocument();
    expect(screen.getByText(/happy birthday, superstar!/i)).toHaveClass('text-sm');
    expect(
      container.querySelectorAll('span[aria-hidden="true"]')[0]?.textContent
    ).toContain('“');
  });
});
