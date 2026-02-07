import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import {
  aggregateBoardCharityBreakdown,
  aggregateMonthlyCharitySummary,
  listBoardCharityBreakdown,
  listCharities,
  listMonthlyCharitySummary,
} from '@/lib/charities/service';

const makeListQuery = (rows: unknown[]) => {
  const withPagination = {
    limit: vi.fn(() => ({ offset: vi.fn(async () => rows) })),
  };
  const filtered = {
    orderBy: vi.fn(() => withPagination),
  };
  const base = {
    where: vi.fn(() => filtered),
    orderBy: vi.fn(() => withPagination),
  };
  const query = {
    from: vi.fn(() => base),
  };

  return { query, where: base.where };
};

const makeMonthlySummaryQuery = (rows: unknown[]) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(async () => rows);
  return query;
};

const makeBoardBreakdownQuery = (rows: unknown[]) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(async () => rows);
  return query;
};

describe('charity service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces active-only visibility for public charity listings', async () => {
    const { query, where } = makeListQuery([]);
    dbMock.select.mockReturnValueOnce(query);

    await listCharities({ scope: 'public' });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('supports unfiltered admin listing when no filters are provided', async () => {
    const { query, where } = makeListQuery([]);
    dbMock.select.mockReturnValueOnce(query);

    await listCharities({ scope: 'admin' });

    expect(where).not.toHaveBeenCalled();
  });

  it('aggregates monthly charity summary totals correctly', () => {
    const summary = aggregateMonthlyCharitySummary([
      {
        dreamBoardId: 'board-1',
        charityCents: 300,
        recipientData: { charityId: 'charity-1', charityName: 'Save The Ocean' },
      },
      {
        dreamBoardId: 'board-2',
        charityCents: 500,
        recipientData: { charityId: 'charity-1', charityName: 'Save The Ocean' },
      },
      {
        dreamBoardId: 'board-3',
        charityCents: 200,
        recipientData: { charityId: 'charity-2', charityName: 'Tree Trust' },
      },
    ]);

    expect(summary).toEqual([
      {
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        totalCharityCents: 800,
        payoutCount: 2,
        boardCount: 2,
      },
      {
        charityId: 'charity-2',
        charityName: 'Tree Trust',
        totalCharityCents: 200,
        payoutCount: 1,
        boardCount: 1,
      },
    ]);
  });

  it('aggregates per-board charity breakdown correctly', () => {
    const breakdown = aggregateBoardCharityBreakdown([
      {
        dreamBoardId: 'board-1',
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        splitType: 'percentage',
        contributionId: 'contrib-1',
        charityCents: 300,
      },
      {
        dreamBoardId: 'board-1',
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        splitType: 'percentage',
        contributionId: 'contrib-2',
        charityCents: 100,
      },
      {
        dreamBoardId: 'board-2',
        charityId: 'charity-2',
        charityName: 'Tree Trust',
        splitType: 'threshold',
        contributionId: 'contrib-3',
        charityCents: 0,
      },
    ]);

    expect(breakdown).toEqual([
      {
        dreamBoardId: 'board-1',
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        splitType: 'percentage',
        totalCharityCents: 400,
        allocatedContributionCount: 2,
      },
      {
        dreamBoardId: 'board-2',
        charityId: 'charity-2',
        charityName: 'Tree Trust',
        splitType: 'threshold',
        totalCharityCents: 0,
        allocatedContributionCount: 0,
      },
    ]);
  });

  it('returns monthly summary from payout rows for a month window', async () => {
    dbMock.select.mockReturnValueOnce(
      makeMonthlySummaryQuery([
        {
          dreamBoardId: 'board-1',
          charityCents: 300,
          recipientData: { charityId: 'charity-1', charityName: 'Save The Ocean' },
        },
      ])
    );

    const summary = await listMonthlyCharitySummary({ year: 2026, month: 2 });

    expect(summary).toEqual([
      {
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        totalCharityCents: 300,
        payoutCount: 1,
        boardCount: 1,
      },
    ]);
  });

  it('returns board-level breakdown dataset for admin consumers', async () => {
    dbMock.select.mockReturnValueOnce(
      makeBoardBreakdownQuery([
        {
          dreamBoardId: 'board-1',
          charityId: 'charity-1',
          charityName: 'Save The Ocean',
          splitType: 'percentage',
          contributionId: 'contrib-1',
          charityCents: 300,
        },
      ])
    );

    const breakdown = await listBoardCharityBreakdown();

    expect(breakdown).toEqual([
      {
        dreamBoardId: 'board-1',
        charityId: 'charity-1',
        charityName: 'Save The Ocean',
        splitType: 'percentage',
        totalCharityCents: 300,
        allocatedContributionCount: 1,
      },
    ]);
  });
});
