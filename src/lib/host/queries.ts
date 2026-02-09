import { and, asc, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { charities, contributions, dreamBoards, payouts } from '@/lib/db/schema';
import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';

export type HostDashboardListRow = {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  giftName: string;
  giftImageUrl: string;
  partyDate: string;
  campaignEndDate: string | null;
  createdAt: Date;
  status: string;
  goalCents: number;
  charityEnabled: boolean;
  raisedCents: number;
  contributionCount: number;
};

export type HostDashboardDetailRow = {
  id: string;
  hostId: string;
  slug: string;
  childName: string;
  childPhotoUrl: string;
  giftName: string;
  giftImageUrl: string;
  partyDate: string;
  campaignEndDate: string | null;
  message: string | null;
  status: string;
  goalCents: number;
  payoutMethod: 'karri_card' | 'bank';
  karriCardHolderName: string | null;
  bankAccountHolder: string | null;
  payoutEmail: string;
  charityEnabled: boolean;
  charityName: string | null;
  totalRaisedCents: number;
  totalFeeCents: number;
  totalCharityCents: number;
  contributionCount: number;
  messageCount: number;
};

export type HostPayoutRow = {
  id: string;
  type: 'karri_card' | 'bank' | 'charity';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  grossCents: number;
  feeCents: number;
  netCents: number;
  externalRef: string | null;
  completedAt: Date | null;
};

export type HostContributionRow = {
  id: string;
  contributorName: string | null;
  isAnonymous: boolean;
  message: string | null;
  amountCents: number;
  feeCents: number;
  charityCents: number | null;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
};

export type HostBirthdayMessageRow = {
  id: string;
  contributorName: string | null;
  isAnonymous: boolean;
  message: string;
  amountCents: number;
  createdAt: Date;
};

type HostDreamBoardPatch = {
  childName?: string;
  childPhotoUrl?: string;
  partyDate?: string | Date;
  campaignEndDate?: string | Date;
};

const normalizeDateOnly = (value: string | Date | undefined) => {
  if (!value) return undefined;
  const parsed = parseDateOnly(value);
  return parsed ? formatDateOnly(parsed) : undefined;
};

export async function listDreamBoardsForHostExpanded(hostId: string): Promise<HostDashboardListRow[]> {
  return db
    .select({
      id: dreamBoards.id,
      slug: dreamBoards.slug,
      childName: dreamBoards.childName,
      childPhotoUrl: dreamBoards.childPhotoUrl,
      giftName: dreamBoards.giftName,
      giftImageUrl: dreamBoards.giftImageUrl,
      partyDate: dreamBoards.partyDate,
      campaignEndDate: dreamBoards.campaignEndDate,
      createdAt: dreamBoards.createdAt,
      status: dreamBoards.status,
      goalCents: dreamBoards.goalCents,
      charityEnabled: dreamBoards.charityEnabled,
      raisedCents: sql<number>`COALESCE(SUM(${contributions.amountCents}), 0)`.as('raised_cents'),
      contributionCount: sql<number>`COUNT(${contributions.id})`.as('contribution_count'),
    })
    .from(dreamBoards)
    .leftJoin(
      contributions,
      and(
        eq(contributions.dreamBoardId, dreamBoards.id),
        eq(contributions.paymentStatus, 'completed')
      )
    )
    .where(eq(dreamBoards.hostId, hostId))
    .groupBy(dreamBoards.id)
    .orderBy(desc(dreamBoards.createdAt));
}

export async function getDashboardDetailExpanded(
  id: string,
  hostId: string
): Promise<HostDashboardDetailRow | null> {
  const [board] = await db
    .select({
      id: dreamBoards.id,
      hostId: dreamBoards.hostId,
      slug: dreamBoards.slug,
      childName: dreamBoards.childName,
      childPhotoUrl: dreamBoards.childPhotoUrl,
      giftName: dreamBoards.giftName,
      giftImageUrl: dreamBoards.giftImageUrl,
      partyDate: dreamBoards.partyDate,
      campaignEndDate: dreamBoards.campaignEndDate,
      message: dreamBoards.message,
      status: dreamBoards.status,
      goalCents: dreamBoards.goalCents,
      payoutMethod: dreamBoards.payoutMethod,
      karriCardHolderName: dreamBoards.karriCardHolderName,
      bankAccountHolder: dreamBoards.bankAccountHolder,
      payoutEmail: dreamBoards.payoutEmail,
      charityEnabled: dreamBoards.charityEnabled,
      charityName: charities.name,
      totalRaisedCents: sql<number>`COALESCE(SUM(${contributions.amountCents}), 0)`.as(
        'total_raised_cents'
      ),
      totalFeeCents: sql<number>`COALESCE(SUM(${contributions.feeCents}), 0)`.as('total_fee_cents'),
      totalCharityCents:
        sql<number>`COALESCE(SUM(COALESCE(${contributions.charityCents}, 0)), 0)`.as(
          'total_charity_cents'
        ),
      contributionCount: sql<number>`COUNT(${contributions.id})`.as('contribution_count'),
      messageCount:
        sql<number>`COUNT(CASE WHEN ${contributions.message} IS NOT NULL AND ${contributions.message} != '' THEN 1 END)`.as(
          'message_count'
        ),
    })
    .from(dreamBoards)
    .leftJoin(
      contributions,
      and(
        eq(contributions.dreamBoardId, dreamBoards.id),
        eq(contributions.paymentStatus, 'completed')
      )
    )
    .leftJoin(
      charities,
      and(eq(dreamBoards.charityEnabled, true), eq(dreamBoards.charityId, charities.id))
    )
    .where(and(eq(dreamBoards.id, id), eq(dreamBoards.hostId, hostId)))
    .groupBy(dreamBoards.id, charities.id)
    .limit(1);

  return board ?? null;
}

export async function getDreamBoardHostAccessById(id: string): Promise<{
  id: string;
  hostId: string;
  childName: string;
} | null> {
  const [board] = await db
    .select({
      id: dreamBoards.id,
      hostId: dreamBoards.hostId,
      childName: dreamBoards.childName,
    })
    .from(dreamBoards)
    .where(eq(dreamBoards.id, id))
    .limit(1);
  return board ?? null;
}

export async function listPayoutsForDreamBoard(dreamBoardId: string): Promise<HostPayoutRow[]> {
  return db
    .select({
      id: payouts.id,
      type: payouts.type,
      status: payouts.status,
      grossCents: payouts.grossCents,
      feeCents: payouts.feeCents,
      netCents: payouts.netCents,
      externalRef: payouts.externalRef,
      completedAt: payouts.completedAt,
    })
    .from(payouts)
    .where(eq(payouts.dreamBoardId, dreamBoardId))
    .orderBy(
      sql`CASE WHEN ${payouts.type} = 'charity' THEN 1 ELSE 0 END`,
      asc(payouts.createdAt)
    );
}

export async function listCompletedContributionsForDreamBoard(
  dreamBoardId: string
): Promise<HostContributionRow[]> {
  return db
    .select({
      id: contributions.id,
      contributorName: contributions.contributorName,
      isAnonymous: contributions.isAnonymous,
      message: contributions.message,
      amountCents: contributions.amountCents,
      feeCents: contributions.feeCents,
      charityCents: contributions.charityCents,
      paymentStatus: contributions.paymentStatus,
      createdAt: contributions.createdAt,
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.dreamBoardId, dreamBoardId),
        eq(contributions.paymentStatus, 'completed')
      )
    )
    .orderBy(desc(contributions.createdAt));
}

export async function listBirthdayMessages(
  dreamBoardId: string
): Promise<HostBirthdayMessageRow[]> {
  return db
    .select({
      id: contributions.id,
      contributorName: contributions.contributorName,
      isAnonymous: contributions.isAnonymous,
      message: contributions.message,
      amountCents: contributions.amountCents,
      createdAt: contributions.createdAt,
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.dreamBoardId, dreamBoardId),
        eq(contributions.paymentStatus, 'completed'),
        isNotNull(contributions.message),
        ne(contributions.message, '')
      )
    )
    .orderBy(asc(contributions.createdAt)) as Promise<HostBirthdayMessageRow[]>;
}

export async function updateDreamBoardForHost(
  id: string,
  hostId: string,
  data: HostDreamBoardPatch
): Promise<boolean> {
  const patch = {
    childName: data.childName,
    childPhotoUrl: data.childPhotoUrl,
    partyDate: normalizeDateOnly(data.partyDate),
    campaignEndDate: normalizeDateOnly(data.campaignEndDate),
  };

  const nextValues = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Record<string, unknown>;

  if (Object.keys(nextValues).length === 0) {
    return false;
  }

  const [updated] = await db
    .update(dreamBoards)
    .set({
      ...(nextValues as Partial<typeof dreamBoards.$inferInsert>),
      updatedAt: new Date(),
    })
    .where(and(eq(dreamBoards.id, id), eq(dreamBoards.hostId, hostId)))
    .returning({ id: dreamBoards.id });

  return Boolean(updated);
}
