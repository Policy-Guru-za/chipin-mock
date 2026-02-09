import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
  execute: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import {
  listAdminCharities,
  getAdminPlatformSummaryDataset,
  listAdminDreamBoards,
  listAdminPayouts,
} from '@/lib/admin/service';

const makePayoutRowsQuery = (rows: unknown[]) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.innerJoin = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(() => query);
  query.limit = vi.fn(async () => rows);
  return query;
};

const makeCountQuery = (count: number) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(async () => [{ totalCount: count }]);
  return query;
};

const makeDreamBoardRowsQuery = (rows: unknown[]) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(() => query);
  query.limit = vi.fn(async () => rows);
  return query;
};

const makeCharityRowsQuery = (rows: unknown[]) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(() => query);
  query.limit = vi.fn(async () => rows);
  return query;
};

describe('admin datasets integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns payout datasets with charity filter metadata', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makePayoutRowsQuery([
          {
            id: 'payout-1',
            dreamBoardId: 'board-1',
            dreamBoardSlug: 'maya-board',
            childName: 'Maya',
            type: 'charity',
            status: 'pending',
            grossCents: 3000,
            feeCents: 0,
            charityCents: 3000,
            netCents: 3000,
            payoutEmail: 'host@gifta.co.za',
            hostEmail: 'host@gifta.co.za',
            recipientData: {
              payoutMethod: 'charity',
              charityId: 'charity-1',
              charityName: 'Save The Ocean',
            },
            createdAt: new Date('2026-02-08T05:00:00.000Z'),
            completedAt: null,
          },
        ])
      )
      .mockReturnValueOnce(makeCountQuery(1));

    const result = await listAdminPayouts({
      types: ['charity'],
      charityId: 'charity-1',
      limit: 20,
    });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        type: 'charity',
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        recipientSummary: expect.objectContaining({
          payoutMethod: 'charity',
          charityId: 'charity-1',
        }),
      })
    );
  });

  it('returns platform summary totals for the requested period', async () => {
    dbMock.execute.mockResolvedValue({
      rows: [
        {
          totalBoards: 12,
          totalContributions: 40,
          totalRaisedCents: 120000,
          totalPaidOutCents: 98000,
          totalFeesRetainedCents: 22000,
        },
      ],
    });

    const result = await getAdminPlatformSummaryDataset({
      from: new Date('2026-02-01T00:00:00.000Z'),
      to: new Date('2026-02-28T23:59:59.000Z'),
    });

    expect(result.totalBoards).toBe(12);
    expect(result.totalContributions).toBe(40);
    expect(result.totalRaisedCents).toBe(120000);
    expect(result.totalPaidOutCents).toBe(98000);
    expect(result.totalFeesRetainedCents).toBe(22000);
  });
});

describe('admin datasets list views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns dream boards with charity enabled filter field', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeDreamBoardRowsQuery([
          {
            id: 'board-1',
            slug: 'maya-board',
            childName: 'Maya',
            giftName: 'Scooter',
            status: 'active',
            hostId: 'host-1',
            hostName: 'Host Name',
            hostEmail: 'host@gifta.co.za',
            charityEnabled: true,
            goalCents: 100000,
            raisedCents: 78000,
            contributorCount: 12,
            payoutPendingCount: 1,
            payoutProcessingCount: 0,
            payoutCompletedCount: 0,
            payoutFailedCount: 0,
            createdAt: new Date('2026-02-01T00:00:00.000Z'),
            updatedAt: new Date('2026-02-02T00:00:00.000Z'),
          },
        ]),
      )
      .mockReturnValueOnce(makeCountQuery(1));

    const result = await listAdminDreamBoards({
      charityEnabled: true,
      limit: 20,
    });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: 'board-1',
        charityEnabled: true,
        payoutStatusSummary: expect.objectContaining({ pending: 1 }),
      }),
    );
  });

  it('does not expose encrypted bank payload in charity dataset', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeCharityRowsQuery([
          {
            id: 'charity-1',
            name: 'Hope Fund',
            description: 'Education support',
            category: 'Education',
            logoUrl: 'https://example.com/logo.png',
            website: 'https://example.com',
            contactName: 'Dana',
            contactEmail: 'dana@example.com',
            isActive: true,
            createdAt: new Date('2026-02-01T00:00:00.000Z'),
            updatedAt: new Date('2026-02-02T00:00:00.000Z'),
            totalBoards: 2,
            totalRaisedCents: 15000,
            totalPayoutsCents: 12000,
          },
        ]),
      )
      .mockReturnValueOnce(makeCountQuery(1));

    const result = await listAdminCharities({ limit: 20 });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: 'charity-1',
        contactName: 'Dana',
        contactEmail: 'dana@example.com',
      }),
    );
    expect(result.items[0]).not.toHaveProperty('bankDetailsEncrypted');
  });
});
