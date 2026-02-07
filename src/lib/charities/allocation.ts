import { and, eq, ne, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { contributions, dreamBoards } from '@/lib/db/schema';
import { LOCKED_CHARITY_SPLIT_MODES } from '@/lib/ux-v2/decision-locks';

export const calculatePercentageCharityCents = (params: {
  amountCents: number;
  charityPercentageBps: number;
}) => {
  if (params.amountCents <= 0) return 0;
  if (params.charityPercentageBps <= 0) return 0;

  return Math.round((params.amountCents * params.charityPercentageBps) / 10000);
};

export const calculateThresholdCharityCents = (params: {
  amountCents: number;
  charityThresholdCents: number;
  alreadyAllocatedCents: number;
}) => {
  if (params.amountCents <= 0) return 0;

  const remaining = Math.max(0, params.charityThresholdCents - params.alreadyAllocatedCents);
  return Math.max(0, Math.min(params.amountCents, remaining));
};

type ContributionCharityContext = {
  contributionId: string;
  dreamBoardId: string;
  amountCents: number;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  existingCharityCents: number | null;
  charityEnabled: boolean;
  charityId: string | null;
  charitySplitType: (typeof LOCKED_CHARITY_SPLIT_MODES)[number] | null;
  charityPercentageBps: number | null;
  charityThresholdCents: number | null;
};

export const resolveCharityCentsFromContext = (
  context: ContributionCharityContext,
  alreadyAllocatedCents: number
): number | null => {
  if (!context.charityEnabled) {
    return null;
  }

  if (context.paymentStatus === 'completed' && context.existingCharityCents !== null) {
    return context.existingCharityCents;
  }

  if (!context.charityId || !context.charitySplitType) {
    return null;
  }

  if (context.charitySplitType === 'percentage') {
    if (typeof context.charityPercentageBps !== 'number') {
      return null;
    }
    return calculatePercentageCharityCents({
      amountCents: context.amountCents,
      charityPercentageBps: context.charityPercentageBps,
    });
  }

  if (context.charitySplitType === 'threshold') {
    if (typeof context.charityThresholdCents !== 'number') {
      return null;
    }

    return calculateThresholdCharityCents({
      amountCents: context.amountCents,
      charityThresholdCents: context.charityThresholdCents,
      alreadyAllocatedCents,
    });
  }

  return null;
};

const getContributionCharityContext = async (
  contributionId: string,
  reader: Pick<typeof db, 'select'> = db
): Promise<ContributionCharityContext | null> => {
  const [row] = await reader
    .select({
      contributionId: contributions.id,
      dreamBoardId: contributions.dreamBoardId,
      amountCents: contributions.amountCents,
      paymentStatus: contributions.paymentStatus,
      existingCharityCents: contributions.charityCents,
      charityEnabled: dreamBoards.charityEnabled,
      charityId: dreamBoards.charityId,
      charitySplitType: dreamBoards.charitySplitType,
      charityPercentageBps: dreamBoards.charityPercentageBps,
      charityThresholdCents: dreamBoards.charityThresholdCents,
    })
    .from(contributions)
    .innerJoin(dreamBoards, eq(dreamBoards.id, contributions.dreamBoardId))
    .where(eq(contributions.id, contributionId))
    .limit(1);

  return row ?? null;
};

const getAlreadyAllocatedCharityCents = async (params: {
  dreamBoardId: string;
  contributionId: string;
}, reader: Pick<typeof db, 'select'> = db) => {
  const [row] = await reader
    .select({
      total: sql<number>`COALESCE(SUM(${contributions.charityCents}), 0)`.as('total'),
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.dreamBoardId, params.dreamBoardId),
        eq(contributions.paymentStatus, 'completed'),
        ne(contributions.id, params.contributionId)
      )
    );

  return row?.total ?? 0;
};

export const resolveCharityAllocationForContribution = async (
  contributionId: string
): Promise<number | null> => {
  const context = await getContributionCharityContext(contributionId);
  if (!context) {
    throw new Error('Contribution not found');
  }

  if (context.paymentStatus === 'completed' && context.existingCharityCents !== null) {
    return context.existingCharityCents;
  }

  const alreadyAllocatedCents =
    context.charityEnabled && context.charitySplitType === 'threshold'
      ? await getAlreadyAllocatedCharityCents({
          dreamBoardId: context.dreamBoardId,
          contributionId: context.contributionId,
        })
      : 0;

  return resolveCharityCentsFromContext(context, alreadyAllocatedCents);
};

export const completeContributionWithResolvedCharity = async (
  contributionId: string
): Promise<number | null> =>
  db.transaction(async (tx) => {
    const [contribution] = await tx
      .select({
        id: contributions.id,
        dreamBoardId: contributions.dreamBoardId,
      })
      .from(contributions)
      .where(eq(contributions.id, contributionId))
      .limit(1);

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`charity-allocation:${contribution.dreamBoardId}`})::bigint)`
    );

    const context = await getContributionCharityContext(contributionId, tx);
    if (!context) {
      throw new Error('Contribution not found');
    }

    if (context.paymentStatus === 'completed' && context.existingCharityCents !== null) {
      return context.existingCharityCents;
    }

    const alreadyAllocatedCents =
      context.charityEnabled && context.charitySplitType === 'threshold'
        ? await getAlreadyAllocatedCharityCents(
            {
              dreamBoardId: context.dreamBoardId,
              contributionId: context.contributionId,
            },
            tx
          )
        : 0;

    const charityCents = resolveCharityCentsFromContext(context, alreadyAllocatedCents);

    await tx
      .update(contributions)
      .set({
        charityCents,
        paymentStatus: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(contributions.id, contributionId));

    return charityCents;
  });
