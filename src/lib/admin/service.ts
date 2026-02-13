import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';

import { encodeCursor, type PaginationCursor } from '@/lib/api/pagination';
import { listMonthlyCharitySummary } from '@/lib/charities/service';
import { db } from '@/lib/db';
import { charities, contributions, dreamBoards, hosts, payouts } from '@/lib/db/schema';
import {
  MAX_FEE_CENTS,
  MIN_FEE_CENTS,
  PLATFORM_FEE_PERCENTAGE,
} from '@/lib/payments/fees';
import {
  LOCKED_ACCESSIBILITY_BASELINE,
  LOCKED_BRAND_STRING,
  LOCKED_CHARITY_PAYOUT_POLICY,
  LOCKED_CHARITY_SPLIT_MODES,
} from '@/lib/ux-v2/decision-locks';
import { isBankWritePathEnabled, isCharityWritePathEnabled } from '@/lib/ux-v2/write-path-gates';

import type {
  AdminCharityDataset,
  AdminCharityFilters,
  AdminContributionDataset,
  AdminContributionFilters,
  AdminDashboardDataset,
  AdminDreamBoardDataset,
  AdminDreamBoardFilters,
  AdminHostDataset,
  AdminHostFilters,
  AdminMonthlyCharityReconciliationDataset,
  AdminPage,
  AdminPayoutDataset,
  AdminPayoutFilters,
  AdminPlatformSettingsDataset,
  AdminPlatformSummaryDataset,
  AdminTimeRange,
} from './types';

const DEFAULT_LIMIT = 50;

const applyCursor = (params: {
  cursor?: PaginationCursor | null;
  createdAtColumn:
    | typeof dreamBoards.createdAt
    | typeof contributions.createdAt
    | typeof payouts.createdAt
    | typeof charities.createdAt
    | typeof hosts.createdAt;
  idColumn:
    | typeof dreamBoards.id
    | typeof contributions.id
    | typeof payouts.id
    | typeof charities.id
    | typeof hosts.id;
}) => {
  if (!params.cursor) return null;
  return or(
    lt(params.createdAtColumn, params.cursor.createdAt),
    and(eq(params.createdAtColumn, params.cursor.createdAt), lt(params.idColumn, params.cursor.id)),
  );
};

const resolveLimit = (value?: number) => {
  if (!value || value < 1) return DEFAULT_LIMIT;
  return Math.min(value, 200);
};

const buildPage = <T extends { id: string; createdAt: Date }>(
  items: T[],
  totalCount: number,
  limit: number,
): AdminPage<T> => {
  const last = items[items.length - 1];
  const nextCursor = items.length === limit && last
    ? encodeCursor({ createdAt: last.createdAt, id: last.id })
    : null;

  return {
    items,
    totalCount,
    nextCursor,
    limit,
  };
};

const parseRecipientSummary = (
  recipientData: unknown,
): Record<string, unknown> => {
  if (!recipientData || typeof recipientData !== 'object' || Array.isArray(recipientData)) {
    return {};
  }

  const source = recipientData as Record<string, unknown>;
  const keys = [
    'payoutMethod',
    'email',
    'charityId',
    'charityName',
    'settlementMonth',
    'settlementYear',
    'bankAccountLast4',
    'karriCardHolderName',
  ] as const;

  const summary: Record<string, unknown> = {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      summary[key] = source[key];
    }
  }
  return summary;
};

export const listAdminDreamBoards = async (
  filters: AdminDreamBoardFilters = {},
): Promise<AdminPage<AdminDreamBoardDataset>> => {
  const limit = resolveLimit(filters.limit);
  const conditions: SQL[] = [];

  if (filters.statuses?.length) {
    conditions.push(inArray(dreamBoards.status, filters.statuses));
  }

  if (filters.createdFrom) {
    conditions.push(gte(dreamBoards.createdAt, filters.createdFrom));
  }

  if (filters.createdTo) {
    conditions.push(lte(dreamBoards.createdAt, filters.createdTo));
  }

  if (filters.hostId) {
    conditions.push(eq(dreamBoards.hostId, filters.hostId));
  }

  if (filters.charityEnabled !== undefined) {
    conditions.push(eq(dreamBoards.charityEnabled, filters.charityEnabled));
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(dreamBoards.childName, pattern),
        ilike(dreamBoards.giftName, pattern),
      ) as SQL,
    );
  }

  const cursorCondition = applyCursor({
    cursor: filters.cursor,
    createdAtColumn: dreamBoards.createdAt,
    idColumn: dreamBoards.id,
  });

  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: dreamBoards.id,
      slug: dreamBoards.slug,
      childName: dreamBoards.childName,
      giftName: dreamBoards.giftName,
      status: dreamBoards.status,
      hostId: dreamBoards.hostId,
      hostName: hosts.name,
      hostEmail: sql<string>`COALESCE(${hosts.email}, '')`,
      charityEnabled: dreamBoards.charityEnabled,
      goalCents: dreamBoards.goalCents,
      raisedCents: sql<number>`COALESCE((
        SELECT SUM(c.amount_cents)::int
        FROM contributions c
        WHERE c.dream_board_id = ${dreamBoards.id}
          AND c.payment_status = 'completed'
      ), 0)`,
      contributorCount: sql<number>`COALESCE((
        SELECT COUNT(c.id)::int
        FROM contributions c
        WHERE c.dream_board_id = ${dreamBoards.id}
          AND c.payment_status = 'completed'
      ), 0)`,
      payoutPendingCount: sql<number>`COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.dream_board_id = ${dreamBoards.id}
          AND p.status = 'pending'
      ), 0)`,
      payoutProcessingCount: sql<number>`COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.dream_board_id = ${dreamBoards.id}
          AND p.status = 'processing'
      ), 0)`,
      payoutCompletedCount: sql<number>`COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.dream_board_id = ${dreamBoards.id}
          AND p.status = 'completed'
      ), 0)`,
      payoutFailedCount: sql<number>`COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.dream_board_id = ${dreamBoards.id}
          AND p.status = 'failed'
      ), 0)`,
      createdAt: dreamBoards.createdAt,
      updatedAt: dreamBoards.updatedAt,
    })
    .from(dreamBoards)
    .leftJoin(hosts, eq(hosts.id, dreamBoards.hostId))
    .where(whereClause)
    .orderBy(desc(dreamBoards.createdAt), desc(dreamBoards.id))
    .limit(limit);

  const countConditions = conditions.filter((condition) => condition !== cursorCondition);
  const countWhereClause = countConditions.length ? and(...countConditions) : undefined;

  const [countRow] = await db
    .select({ totalCount: sql<number>`COUNT(${dreamBoards.id})::int` })
    .from(dreamBoards)
    .where(countWhereClause);

  const items: AdminDreamBoardDataset[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    childName: row.childName,
    giftName: row.giftName,
    status: row.status,
    hostId: row.hostId,
    hostName: row.hostName,
    hostEmail: row.hostEmail,
    charityEnabled: row.charityEnabled,
    goalCents: row.goalCents,
    raisedCents: row.raisedCents,
    contributorCount: row.contributorCount,
    payoutStatusSummary: {
      pending: row.payoutPendingCount,
      processing: row.payoutProcessingCount,
      completed: row.payoutCompletedCount,
      failed: row.payoutFailedCount,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return buildPage(items, countRow?.totalCount ?? 0, limit);
};

export const listAdminContributions = async (
  filters: AdminContributionFilters = {},
): Promise<AdminPage<AdminContributionDataset>> => {
  const limit = resolveLimit(filters.limit);
  const conditions: SQL[] = [];

  if (filters.statuses?.length) {
    conditions.push(inArray(contributions.paymentStatus, filters.statuses));
  }

  if (filters.paymentProviders?.length) {
    conditions.push(inArray(contributions.paymentProvider, filters.paymentProviders));
  }

  if (filters.createdFrom) {
    conditions.push(gte(contributions.createdAt, filters.createdFrom));
  }

  if (filters.createdTo) {
    conditions.push(lte(contributions.createdAt, filters.createdTo));
  }

  if (filters.dreamBoardId) {
    conditions.push(eq(contributions.dreamBoardId, filters.dreamBoardId));
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(contributions.contributorName, pattern),
        ilike(contributions.paymentRef, pattern),
        ilike(dreamBoards.childName, pattern),
      ) as SQL,
    );
  }

  const cursorCondition = applyCursor({
    cursor: filters.cursor,
    createdAtColumn: contributions.createdAt,
    idColumn: contributions.id,
  });

  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: contributions.id,
      dreamBoardId: dreamBoards.id,
      dreamBoardSlug: dreamBoards.slug,
      childName: dreamBoards.childName,
      contributorName: contributions.contributorName,
      paymentProvider: contributions.paymentProvider,
      paymentStatus: contributions.paymentStatus,
      amountCents: contributions.amountCents,
      feeCents: contributions.feeCents,
      netCents: sql<number>`COALESCE(${contributions.netCents}, 0)`,
      charityCents: sql<number>`COALESCE(${contributions.charityCents}, 0)`,
      paymentRef: contributions.paymentRef,
      createdAt: contributions.createdAt,
    })
    .from(contributions)
    .innerJoin(dreamBoards, eq(dreamBoards.id, contributions.dreamBoardId))
    .where(whereClause)
    .orderBy(desc(contributions.createdAt), desc(contributions.id))
    .limit(limit);

  const countConditions = conditions.filter((condition) => condition !== cursorCondition);
  const countWhereClause = countConditions.length ? and(...countConditions) : undefined;

  const [countRow] = await db
    .select({ totalCount: sql<number>`COUNT(${contributions.id})::int` })
    .from(contributions)
    .innerJoin(dreamBoards, eq(dreamBoards.id, contributions.dreamBoardId))
    .where(countWhereClause);

  const items: AdminContributionDataset[] = rows.map((row) => ({
    id: row.id,
    dreamBoardId: row.dreamBoardId,
    dreamBoardSlug: row.dreamBoardSlug,
    childName: row.childName,
    contributorName: row.contributorName,
    paymentProvider: row.paymentProvider,
    paymentStatus: row.paymentStatus,
    amountCents: row.amountCents,
    feeCents: row.feeCents,
    netCents: row.netCents,
    charityCents: row.charityCents,
    paymentRef: row.paymentRef,
    createdAt: row.createdAt,
  }));

  return buildPage(items, countRow?.totalCount ?? 0, limit);
};

export const listAdminPayouts = async (
  filters: AdminPayoutFilters = {},
): Promise<AdminPage<AdminPayoutDataset>> => {
  const limit = resolveLimit(filters.limit);
  const conditions: SQL[] = [];

  if (filters.statuses?.length) {
    conditions.push(inArray(payouts.status, filters.statuses));
  }

  if (filters.types?.length) {
    conditions.push(inArray(payouts.type, filters.types));
  }

  if (filters.giftMethod) {
    conditions.push(eq(payouts.type, filters.giftMethod));
  }

  if (filters.createdFrom) {
    conditions.push(gte(payouts.createdAt, filters.createdFrom));
  }

  if (filters.createdTo) {
    conditions.push(lte(payouts.createdAt, filters.createdTo));
  }

  if (filters.charityId) {
    conditions.push(eq(payouts.type, 'charity'));
    conditions.push(sql`${payouts.recipientData} ->> 'charityId' = ${filters.charityId}`);
  }

  const cursorCondition = applyCursor({
    cursor: filters.cursor,
    createdAtColumn: payouts.createdAt,
    idColumn: payouts.id,
  });

  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: payouts.id,
      dreamBoardId: dreamBoards.id,
      dreamBoardSlug: dreamBoards.slug,
      childName: dreamBoards.childName,
      type: payouts.type,
      status: payouts.status,
      grossCents: payouts.grossCents,
      feeCents: payouts.feeCents,
      charityCents: payouts.charityCents,
      netCents: payouts.netCents,
      payoutEmail: dreamBoards.payoutEmail,
      hostEmail: sql<string>`COALESCE(${hosts.email}, '')`,
      recipientData: payouts.recipientData,
      createdAt: payouts.createdAt,
      completedAt: payouts.completedAt,
    })
    .from(payouts)
    .innerJoin(dreamBoards, eq(dreamBoards.id, payouts.dreamBoardId))
    .leftJoin(hosts, eq(hosts.id, dreamBoards.hostId))
    .where(whereClause)
    .orderBy(desc(payouts.createdAt), desc(payouts.id))
    .limit(limit);

  const countConditions = conditions.filter((condition) => condition !== cursorCondition);
  const countWhereClause = countConditions.length ? and(...countConditions) : undefined;

  const [countRow] = await db
    .select({ totalCount: sql<number>`COUNT(${payouts.id})::int` })
    .from(payouts)
    .where(countWhereClause);

  const items: AdminPayoutDataset[] = rows.map((row) => {
    const recipientSummary = parseRecipientSummary(row.recipientData);
    const charityId =
      row.type === 'charity' && typeof recipientSummary.charityId === 'string'
        ? recipientSummary.charityId
        : null;
    const charityName =
      row.type === 'charity' && typeof recipientSummary.charityName === 'string'
        ? recipientSummary.charityName
        : null;

    return {
      id: row.id,
      dreamBoardId: row.dreamBoardId,
      dreamBoardSlug: row.dreamBoardSlug,
      childName: row.childName,
      type: row.type,
      status: row.status,
      grossCents: row.grossCents,
      feeCents: row.feeCents,
      charityCents: row.charityCents,
      netCents: row.netCents,
      payoutEmail: row.payoutEmail,
      hostEmail: row.hostEmail,
      charityId,
      charityName,
      recipientSummary,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    };
  });

  return buildPage(items, countRow?.totalCount ?? 0, limit);
};

export const listAdminCharities = async (
  filters: AdminCharityFilters = {},
): Promise<AdminPage<AdminCharityDataset>> => {
  const limit = resolveLimit(filters.limit);
  const conditions: SQL[] = [];
  const charityIdReference = sql.raw('"charities"."id"');
  const charityIdTextReference = sql.raw('"charities"."id"::text');

  if (filters.isActive !== undefined) {
    conditions.push(eq(charities.isActive, filters.isActive));
  }

  if (filters.category) {
    conditions.push(sql`LOWER(${charities.category}) = LOWER(${filters.category})`);
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(ilike(charities.name, pattern), ilike(charities.description, pattern)) as SQL,
    );
  }

  const cursorCondition = applyCursor({
    cursor: filters.cursor,
    createdAtColumn: charities.createdAt,
    idColumn: charities.id,
  });

  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: charities.id,
      name: charities.name,
      description: charities.description,
      category: charities.category,
      logoUrl: charities.logoUrl,
      website: charities.website,
      contactName: charities.contactName,
      contactEmail: charities.contactEmail,
      isActive: charities.isActive,
      createdAt: charities.createdAt,
      updatedAt: charities.updatedAt,
      totalBoards: sql<number>`COALESCE((
        SELECT COUNT(DISTINCT db.id)::int
        FROM dream_boards db
        WHERE db.charity_enabled = true
          AND db.charity_id = ${charityIdReference}
      ), 0)`,
      totalRaisedCents: sql<number>`COALESCE((
        SELECT SUM(COALESCE(c.charity_cents, 0))::int
        FROM contributions c
        JOIN dream_boards db ON db.id = c.dream_board_id
        WHERE db.charity_enabled = true
          AND db.charity_id = ${charityIdReference}
          AND c.payment_status = 'completed'
      ), 0)`,
      totalPayoutsCents: sql<number>`COALESCE((
        SELECT SUM(p.net_cents)::int
        FROM payouts p
        WHERE p.type = 'charity'
          AND p.status = 'completed'
          AND p.recipient_data ->> 'charityId' = ${charityIdTextReference}
      ), 0)`,
    })
    .from(charities)
    .where(whereClause)
    .orderBy(desc(charities.createdAt), desc(charities.id))
    .limit(limit);

  const countConditions = conditions.filter((condition) => condition !== cursorCondition);
  const countWhereClause = countConditions.length ? and(...countConditions) : undefined;

  const [countRow] = await db
    .select({ totalCount: sql<number>`COUNT(${charities.id})::int` })
    .from(charities)
    .where(countWhereClause);

  const items: AdminCharityDataset[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    logoUrl: row.logoUrl,
    website: row.website,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lifetimeTotals: {
      totalRaisedCents: row.totalRaisedCents,
      totalBoards: row.totalBoards,
      totalPayoutsCents: row.totalPayoutsCents,
    },
  }));

  return buildPage(items, countRow?.totalCount ?? 0, limit);
};

export const listAdminHosts = async (
  filters: AdminHostFilters = {},
): Promise<AdminPage<AdminHostDataset>> => {
  const limit = resolveLimit(filters.limit);
  const conditions: SQL[] = [];

  if (filters.createdFrom) {
    conditions.push(gte(hosts.createdAt, filters.createdFrom));
  }

  if (filters.createdTo) {
    conditions.push(lte(hosts.createdAt, filters.createdTo));
  }

  if (filters.minBoardCount !== undefined) {
    conditions.push(sql`(
      SELECT COUNT(db.id)
      FROM dream_boards db
      WHERE db.host_id = ${hosts.id}
    ) >= ${filters.minBoardCount}`);
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(or(ilike(hosts.email, pattern), ilike(hosts.name, pattern)) as SQL);
  }

  const cursorCondition = applyCursor({
    cursor: filters.cursor,
    createdAtColumn: hosts.createdAt,
    idColumn: hosts.id,
  });

  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: hosts.id,
      email: hosts.email,
      name: hosts.name,
      phone: hosts.phone,
      createdAt: hosts.createdAt,
      totalBoards: sql<number>`COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.host_id = ${hosts.id}
      ), 0)`,
      totalRaisedCents: sql<number>`COALESCE((
        SELECT SUM(c.amount_cents)::int
        FROM contributions c
        JOIN dream_boards db ON db.id = c.dream_board_id
        WHERE db.host_id = ${hosts.id}
          AND c.payment_status = 'completed'
      ), 0)`,
      activeBoards: sql<number>`COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.host_id = ${hosts.id}
          AND db.status IN ('active', 'funded')
      ), 0)`,
      closedBoards: sql<number>`COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.host_id = ${hosts.id}
          AND db.status IN ('closed', 'paid_out', 'expired', 'cancelled')
      ), 0)`,
    })
    .from(hosts)
    .where(whereClause)
    .orderBy(desc(hosts.createdAt), desc(hosts.id))
    .limit(limit);

  const countConditions = conditions.filter((condition) => condition !== cursorCondition);
  const countWhereClause = countConditions.length ? and(...countConditions) : undefined;

  const [countRow] = await db
    .select({ totalCount: sql<number>`COUNT(${hosts.id})::int` })
    .from(hosts)
    .where(countWhereClause);

  const items: AdminHostDataset[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    createdAt: row.createdAt,
    summary: {
      totalBoards: row.totalBoards,
      totalRaisedCents: row.totalRaisedCents,
      activeBoards: row.activeBoards,
      closedBoards: row.closedBoards,
    },
  }));

  return buildPage(items, countRow?.totalCount ?? 0, limit);
};

const normalizeTimeRange = (params?: Partial<AdminTimeRange>): AdminTimeRange => {
  const to = params?.to ?? new Date();
  const from = params?.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
};

export const getAdminPlatformSummaryDataset = async (
  params?: Partial<AdminTimeRange>,
): Promise<AdminPlatformSummaryDataset> => {
  const period = normalizeTimeRange(params);
  const result = await db.execute<{
    totalBoards: number;
    totalContributions: number;
    totalRaisedCents: number;
    totalPaidOutCents: number;
    totalFeesRetainedCents: number;
  }>(sql`
    SELECT
      COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.created_at >= ${period.from}
          AND db.created_at <= ${period.to}
      ), 0) as "totalBoards",
      COALESCE((
        SELECT COUNT(c.id)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "totalContributions",
      COALESCE((
        SELECT SUM(c.amount_cents)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "totalRaisedCents",
      COALESCE((
        SELECT SUM(p.net_cents)::int
        FROM payouts p
        WHERE p.created_at >= ${period.from}
          AND p.created_at <= ${period.to}
          AND p.status = 'completed'
      ), 0) as "totalPaidOutCents",
      COALESCE((
        SELECT SUM(c.fee_cents)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "totalFeesRetainedCents"
  `);

  const row = result.rows[0] ?? {
    totalBoards: 0,
    totalContributions: 0,
    totalRaisedCents: 0,
    totalPaidOutCents: 0,
    totalFeesRetainedCents: 0,
  };

  return {
    period,
    totalBoards: row.totalBoards,
    totalContributions: row.totalContributions,
    totalRaisedCents: row.totalRaisedCents,
    totalPaidOutCents: row.totalPaidOutCents,
    totalFeesRetainedCents: row.totalFeesRetainedCents,
  };
};

export const getAdminDashboardDataset = async (
  params?: Partial<AdminTimeRange>,
): Promise<AdminDashboardDataset> => {
  const period = normalizeTimeRange(params);

  const result = await db.execute<{
    grossMerchandiseValueCents: number;
    totalBoards: number;
    activeBoards: number;
    totalContributors: number;
    totalContributions: number;
    totalFeesRetainedCents: number;
    pendingPayoutsCount: number;
    failedPayoutsCount: number;
  }>(sql`
    SELECT
      COALESCE((
        SELECT SUM(c.amount_cents)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "grossMerchandiseValueCents",
      COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.created_at >= ${period.from}
          AND db.created_at <= ${period.to}
      ), 0) as "totalBoards",
      COALESCE((
        SELECT COUNT(db.id)::int
        FROM dream_boards db
        WHERE db.created_at >= ${period.from}
          AND db.created_at <= ${period.to}
          AND db.status IN ('active', 'funded')
      ), 0) as "activeBoards",
      COALESCE((
        SELECT COUNT(DISTINCT c.contributor_email)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
          AND c.contributor_email IS NOT NULL
      ), 0) as "totalContributors",
      COALESCE((
        SELECT COUNT(c.id)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "totalContributions",
      COALESCE((
        SELECT SUM(c.fee_cents)::int
        FROM contributions c
        WHERE c.created_at >= ${period.from}
          AND c.created_at <= ${period.to}
          AND c.payment_status = 'completed'
      ), 0) as "totalFeesRetainedCents",
      COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.created_at >= ${period.from}
          AND p.created_at <= ${period.to}
          AND p.status = 'pending'
      ), 0) as "pendingPayoutsCount",
      COALESCE((
        SELECT COUNT(p.id)::int
        FROM payouts p
        WHERE p.created_at >= ${period.from}
          AND p.created_at <= ${period.to}
          AND p.status = 'failed'
      ), 0) as "failedPayoutsCount"
  `);

  const row = result.rows[0] ?? {
    grossMerchandiseValueCents: 0,
    totalBoards: 0,
    activeBoards: 0,
    totalContributors: 0,
    totalContributions: 0,
    totalFeesRetainedCents: 0,
    pendingPayoutsCount: 0,
    failedPayoutsCount: 0,
  };

  return {
    period,
    grossMerchandiseValueCents: row.grossMerchandiseValueCents,
    totalBoards: row.totalBoards,
    activeBoards: row.activeBoards,
    totalContributors: row.totalContributors,
    totalContributions: row.totalContributions,
    totalFeesRetainedCents: row.totalFeesRetainedCents,
    pendingPayoutsCount: row.pendingPayoutsCount,
    failedPayoutsCount: row.failedPayoutsCount,
  };
};

export const getAdminMonthlyCharityReconciliationDataset = async (params: {
  year: number;
  month: number;
}): Promise<AdminMonthlyCharityReconciliationDataset> => {
  const items = await listMonthlyCharitySummary(params);

  const totals = items.reduce(
    (acc, item) => ({
      totalCharityCents: acc.totalCharityCents + item.totalCharityCents,
      totalBoardCount: acc.totalBoardCount + item.boardCount,
      totalPayoutCount: acc.totalPayoutCount + item.payoutCount,
    }),
    {
      totalCharityCents: 0,
      totalBoardCount: 0,
      totalPayoutCount: 0,
    },
  );

  return {
    month: params.month,
    year: params.year,
    generatedAt: new Date(),
    totals,
    items,
  };
};

export const getAdminPlatformSettingsDataset = (): AdminPlatformSettingsDataset => ({
  brand: LOCKED_BRAND_STRING,
  accessibilityBaseline: LOCKED_ACCESSIBILITY_BASELINE,
  feeConfiguration: {
    percentage: PLATFORM_FEE_PERCENTAGE,
    percentageBps: Math.round(PLATFORM_FEE_PERCENTAGE * 10000),
    minFeeCents: MIN_FEE_CENTS,
    maxFeeCents: MAX_FEE_CENTS,
    addedOnTopAtCheckout: true,
  },
  contributionLimits: {
    minContributionCents: 2000,
    maxContributionCents: 1000000,
  },
  charityConfiguration: {
    splitModes: LOCKED_CHARITY_SPLIT_MODES,
    monthlyPayoutCadence: LOCKED_CHARITY_PAYOUT_POLICY.cadence,
  },
  writePathGates: {
    bankEnabled: isBankWritePathEnabled(),
    charityEnabled: isCharityWritePathEnabled(),
  },
});
