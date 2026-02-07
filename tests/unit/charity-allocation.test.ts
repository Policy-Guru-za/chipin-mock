import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import {
  calculatePercentageCharityCents,
  calculateThresholdCharityCents,
  completeContributionWithResolvedCharity,
  resolveCharityAllocationForContribution,
  resolveCharityCentsFromContext,
} from '@/lib/charities/allocation';

const makeContributionLookupQuery = (row: Record<string, unknown> | null) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.limit = vi.fn(async () => (row ? [row] : []));
  return query;
};

const makeContextQuery = (row: Record<string, unknown> | null) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.innerJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.limit = vi.fn(async () => (row ? [row] : []));
  return query;
};

const makeSumQuery = (total: number) => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(async () => [{ total }]);
  return query;
};

describe('charity allocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates percentage allocations with deterministic rounding', () => {
    expect(
      calculatePercentageCharityCents({
        amountCents: 199,
        charityPercentageBps: 500,
      })
    ).toBe(10);

    expect(
      calculatePercentageCharityCents({
        amountCents: 1000,
        charityPercentageBps: 1250,
      })
    ).toBe(125);
  });

  it('caps threshold allocations by remaining threshold amount', () => {
    expect(
      calculateThresholdCharityCents({
        amountCents: 700,
        charityThresholdCents: 1000,
        alreadyAllocatedCents: 450,
      })
    ).toBe(550);

    expect(
      calculateThresholdCharityCents({
        amountCents: 700,
        charityThresholdCents: 1000,
        alreadyAllocatedCents: 1000,
      })
    ).toBe(0);
  });

  it('returns existing value for already-completed contributions (idempotent)', () => {
    const allocation = resolveCharityCentsFromContext(
      {
        contributionId: 'contrib-1',
        dreamBoardId: 'board-1',
        amountCents: 5000,
        paymentStatus: 'completed',
        existingCharityCents: 650,
        charityEnabled: true,
        charityId: 'charity-1',
        charitySplitType: 'percentage',
        charityPercentageBps: 1300,
        charityThresholdCents: null,
      },
      0
    );

    expect(allocation).toBe(650);
  });

  it('returns null when board charity is disabled', () => {
    const allocation = resolveCharityCentsFromContext(
      {
        contributionId: 'contrib-1',
        dreamBoardId: 'board-1',
        amountCents: 5000,
        paymentStatus: 'pending',
        existingCharityCents: null,
        charityEnabled: false,
        charityId: null,
        charitySplitType: null,
        charityPercentageBps: null,
        charityThresholdCents: null,
      },
      0
    );

    expect(allocation).toBeNull();
  });

  it('resolves threshold allocations using prior completed board allocations', async () => {
    dbMock.select
      .mockReturnValueOnce(
        makeContextQuery({
          contributionId: 'contrib-1',
          dreamBoardId: 'board-1',
          amountCents: 700,
          paymentStatus: 'pending',
          existingCharityCents: null,
          charityEnabled: true,
          charityId: 'charity-1',
          charitySplitType: 'threshold',
          charityPercentageBps: null,
          charityThresholdCents: 1000,
        })
      )
      .mockReturnValueOnce(makeSumQuery(450));

    const allocation = await resolveCharityAllocationForContribution('contrib-1');

    expect(allocation).toBe(550);
    expect(dbMock.select).toHaveBeenCalledTimes(2);
  });

  it('is idempotent at DB resolver level for completed contributions', async () => {
    dbMock.select.mockReturnValueOnce(
      makeContextQuery({
        contributionId: 'contrib-1',
        dreamBoardId: 'board-1',
        amountCents: 700,
        paymentStatus: 'completed',
        existingCharityCents: 300,
        charityEnabled: true,
        charityId: 'charity-1',
        charitySplitType: 'threshold',
        charityPercentageBps: null,
        charityThresholdCents: 1000,
      })
    );

    const allocation = await resolveCharityAllocationForContribution('contrib-1');

    expect(allocation).toBe(300);
    expect(dbMock.select).toHaveBeenCalledTimes(1);
  });

});

describe('charity allocation completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes contributions atomically with advisory locking', async () => {
    const updateWhere = vi.fn(async () => undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const tx = {
      select: vi
        .fn()
        .mockReturnValueOnce(makeContributionLookupQuery({ id: 'contrib-1', dreamBoardId: 'board-1' }))
        .mockReturnValueOnce(
          makeContextQuery({
            contributionId: 'contrib-1',
            dreamBoardId: 'board-1',
            amountCents: 700,
            paymentStatus: 'pending',
            existingCharityCents: null,
            charityEnabled: true,
            charityId: 'charity-1',
            charitySplitType: 'threshold',
            charityPercentageBps: null,
            charityThresholdCents: 1000,
          })
        )
        .mockReturnValueOnce(makeSumQuery(450)),
      execute: vi.fn(async () => undefined),
      update: vi.fn(() => ({ set: updateSet })),
    };

    dbMock.transaction.mockImplementationOnce(async (handler) => handler(tx as never));

    const charityCents = await completeContributionWithResolvedCharity('contrib-1');

    expect(charityCents).toBe(550);
    expect(tx.execute).toHaveBeenCalledTimes(1);
    expect(tx.update).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        charityCents: 550,
        paymentStatus: 'completed',
      })
    );
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });
});
