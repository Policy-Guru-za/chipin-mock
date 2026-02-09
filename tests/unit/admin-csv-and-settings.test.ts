import { describe, expect, it } from 'vitest';

import {
  getAdminPlatformSettingsDataset,
  toAdminCharityCsvRows,
  toAdminContributionCsvRows,
  toAdminDreamBoardCsvRows,
  toAdminHostCsvRows,
  toAdminPayoutCsvRows,
} from '@/lib/admin';

describe('admin csv payload mappers', () => {
  it('maps dream board rows to csv schema', () => {
    const rows = toAdminDreamBoardCsvRows([
      {
        id: 'db-1',
        slug: 'maya',
        childName: 'Maya',
        giftName: 'Bike',
        status: 'active',
        hostId: 'host-1',
        hostName: 'Ryan',
        hostEmail: 'host@gifta.co.za',
        charityEnabled: false,
        goalCents: 10000,
        raisedCents: 9000,
        contributorCount: 4,
        payoutStatusSummary: { pending: 1, processing: 0, completed: 0, failed: 0 },
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    ]);

    expect(rows[0]).toEqual(
      expect.objectContaining({
        id: 'db-1',
        raised_cents: 9000,
        payout_pending_count: 1,
      }),
    );
  });

  it('maps contribution, payout, charity, and host rows', () => {
    const contributionRows = toAdminContributionCsvRows([
      {
        id: 'c-1',
        dreamBoardId: 'db-1',
        dreamBoardSlug: 'maya',
        childName: 'Maya',
        contributorName: null,
        paymentProvider: 'payfast',
        paymentStatus: 'completed',
        amountCents: 10000,
        feeCents: 300,
        netCents: 9700,
        charityCents: 0,
        paymentRef: 'PF-1',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    ]);

    const payoutRows = toAdminPayoutCsvRows([
      {
        id: 'p-1',
        dreamBoardId: 'db-1',
        dreamBoardSlug: 'maya',
        childName: 'Maya',
        type: 'karri_card',
        status: 'pending',
        grossCents: 10000,
        feeCents: 300,
        charityCents: 0,
        netCents: 9700,
        payoutEmail: 'host@gifta.co.za',
        hostEmail: 'host@gifta.co.za',
        charityId: null,
        charityName: null,
        recipientSummary: {},
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        completedAt: null,
      },
    ]);

    const charityRows = toAdminCharityCsvRows([
      {
        id: 'charity-1',
        name: 'Hope',
        description: 'desc',
        category: 'education',
        logoUrl: 'https://example.com/logo.png',
        website: null,
        contactName: 'Dana',
        contactEmail: 'dana@example.com',
        isActive: true,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        lifetimeTotals: { totalRaisedCents: 12000, totalBoards: 3, totalPayoutsCents: 8000 },
      },
    ]);

    const hostRows = toAdminHostCsvRows([
      {
        id: 'host-1',
        email: 'host@gifta.co.za',
        name: null,
        phone: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        summary: {
          totalBoards: 5,
          totalRaisedCents: 55000,
          activeBoards: 2,
          closedBoards: 3,
        },
      },
    ]);

    expect(contributionRows[0].contributor_name).toBe('');
    expect(payoutRows[0].completed_at_iso).toBe('');
    expect(charityRows[0].total_boards).toBe(3);
    expect(hostRows[0].name).toBe('');
  });
});

describe('admin settings dataset', () => {
  it('exposes locked and runtime config values', () => {
    const originalBank = process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
    const originalCharity = process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

    try {
      process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
      process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'false';

      const settings = getAdminPlatformSettingsDataset();

      expect(settings.brand).toBe('Gifta');
      expect(settings.feeConfiguration.percentageBps).toBe(300);
      expect(settings.charityConfiguration.splitModes).toEqual(['percentage', 'threshold']);
      expect(settings.writePathGates.bankEnabled).toBe(true);
      expect(settings.writePathGates.charityEnabled).toBe(false);
    } finally {
      process.env.UX_V2_ENABLE_BANK_WRITE_PATH = originalBank;
      process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = originalCharity;
    }
  });
});
