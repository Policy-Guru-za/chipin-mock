import { describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import { listDreamBoardsReadyForPayouts, listPayoutsForAdmin } from '@/lib/payouts/queries';

const makeBoardQuery = (result: unknown) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.groupBy = vi.fn(() => query);
  query.orderBy = vi.fn(async () => result);
  return query;
};

const makePayoutQuery = (result: unknown) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(async () => result);
  return query;
};

describe('payout queries', () => {
  it('returns empty list when no ready boards', async () => {
    dbMock.select.mockReturnValueOnce(makeBoardQuery([]));

    const result = await listDreamBoardsReadyForPayouts();

    expect(result).toEqual([]);
    expect(dbMock.select).toHaveBeenCalledTimes(1);
  });

  it('applies status filter for admin payouts', async () => {
    const query: any = {};
    query.from = vi.fn(() => query);
    query.leftJoin = vi.fn(() => query);
    query.where = vi.fn(() => query);
    query.orderBy = vi.fn(() => query);
    query.limit = vi.fn(() => query);
    query.offset = vi.fn(async () => [{ id: 'payout-1' }]);

    dbMock.select.mockReturnValueOnce(query);

    const result = await listPayoutsForAdmin({ statuses: ['pending'] });

    expect(query.where).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('includes boards missing payouts for their configured gift method', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeBoardQuery([
          {
            id: 'board-1',
            slug: 'maya',
            childName: 'Maya',
            status: 'closed',
            payoutMethod: 'karri_card',
            charityEnabled: false,
            payoutEmail: 'host@chipin.co.za',
            goalCents: 10000,
            raisedCents: 12000,
            charityCents: 0,
            contributionCount: 2,
            hostEmail: 'host@chipin.co.za',
            updatedAt: new Date(),
          },
        ])
      )
      .mockReturnValueOnce(makePayoutQuery([]));

    const result = await listDreamBoardsReadyForPayouts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('board-1');
  });

  it('includes bank boards missing bank payout rows', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeBoardQuery([
          {
            id: 'board-2',
            slug: 'noah',
            childName: 'Noah',
            status: 'closed',
            payoutMethod: 'bank',
            charityEnabled: false,
            payoutEmail: 'host@chipin.co.za',
            goalCents: 10000,
            raisedCents: 12000,
            charityCents: 0,
            contributionCount: 2,
            hostEmail: 'host@chipin.co.za',
            updatedAt: new Date(),
          },
        ])
      )
      .mockReturnValueOnce(makePayoutQuery([]));

    const result = await listDreamBoardsReadyForPayouts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('board-2');
  });

  it('includes charity-enabled boards when charity payout row is missing', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeBoardQuery([
          {
            id: 'board-3',
            slug: 'aria',
            childName: 'Aria',
            status: 'closed',
            payoutMethod: 'karri_card',
            charityEnabled: true,
            payoutEmail: 'host@chipin.co.za',
            goalCents: 10000,
            raisedCents: 12000,
            charityCents: 1500,
            contributionCount: 2,
            hostEmail: 'host@chipin.co.za',
            updatedAt: new Date(),
          },
        ])
      )
      .mockReturnValueOnce(
        makePayoutQuery([
          {
            dreamBoardId: 'board-3',
            type: 'karri_card',
          },
        ])
      );

    const result = await listDreamBoardsReadyForPayouts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('board-3');
  });

  it('excludes boards where gift net is zero and charity payout already exists', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeBoardQuery([
          {
            id: 'board-4',
            slug: 'kai',
            childName: 'Kai',
            status: 'closed',
            payoutMethod: 'karri_card',
            charityEnabled: true,
            payoutEmail: 'host@chipin.co.za',
            goalCents: 10000,
            raisedCents: 12000,
            charityCents: 12000,
            contributionCount: 2,
            hostEmail: 'host@chipin.co.za',
            updatedAt: new Date(),
          },
        ])
      )
      .mockReturnValueOnce(
        makePayoutQuery([
          {
            dreamBoardId: 'board-4',
            type: 'charity',
          },
        ])
      );

    const result = await listDreamBoardsReadyForPayouts();

    expect(result).toEqual([]);
  });
});
