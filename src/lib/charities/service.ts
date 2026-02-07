import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lt,
  or,
  type SQL,
} from 'drizzle-orm';

import { db } from '@/lib/db';
import { charities, contributions, dreamBoards, payouts } from '@/lib/db/schema';

type CharityRecord = typeof charities.$inferSelect;

type CharityScope = 'public' | 'admin';

export type CharityListParams = {
  scope?: CharityScope;
  category?: string;
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateCharityInput = {
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  website?: string | null;
  bankDetailsEncrypted: Record<string, unknown>;
  contactName: string;
  contactEmail: string;
  isActive?: boolean;
};

export type UpdateCharityInput = Partial<{
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  website: string | null;
  bankDetailsEncrypted: Record<string, unknown>;
  contactName: string;
  contactEmail: string;
}>;

const charitySelect = {
  id: charities.id,
  name: charities.name,
  description: charities.description,
  category: charities.category,
  logoUrl: charities.logoUrl,
  website: charities.website,
  bankDetailsEncrypted: charities.bankDetailsEncrypted,
  contactName: charities.contactName,
  contactEmail: charities.contactEmail,
  isActive: charities.isActive,
  createdAt: charities.createdAt,
  updatedAt: charities.updatedAt,
};

const buildVisibilityConditions = (params: {
  scope: CharityScope;
  isActive?: boolean;
}): SQL[] => {
  const conditions: SQL[] = [];

  if (params.scope === 'public') {
    conditions.push(eq(charities.isActive, true));
    return conditions;
  }

  if (params.isActive !== undefined) {
    conditions.push(eq(charities.isActive, params.isActive));
  }

  return conditions;
};

const normalizeScope = (scope: CharityScope | undefined): CharityScope => scope ?? 'public';

export const listCharities = async (params: CharityListParams = {}) => {
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;
  const scope = normalizeScope(params.scope);

  const conditions: SQL[] = [...buildVisibilityConditions({ scope, isActive: params.isActive })];

  if (params.category) {
    conditions.push(eq(charities.category, params.category));
  }

  if (params.search) {
    const pattern = `%${params.search}%`;
    conditions.push(
      or(ilike(charities.name, pattern), ilike(charities.description, pattern)) as SQL
    );
  }

  const baseQuery = db.select(charitySelect).from(charities);
  const filteredQuery = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;

  return filteredQuery.orderBy(asc(charities.name)).limit(limit).offset(offset);
};

export const listActiveCharities = async (params: Omit<CharityListParams, 'scope' | 'isActive'> = {}) =>
  listCharities({ ...params, scope: 'public' });

export const getCharityById = async (params: {
  id: string;
  scope?: CharityScope;
}): Promise<CharityRecord | null> => {
  const scope = normalizeScope(params.scope);
  const conditions: SQL[] = [eq(charities.id, params.id)];

  conditions.push(...buildVisibilityConditions({ scope }));

  const [charity] = await db
    .select(charitySelect)
    .from(charities)
    .where(and(...conditions))
    .limit(1);

  return charity ?? null;
};

export const getActiveCharityById = async (id: string) =>
  getCharityById({ id, scope: 'public' });

export const createCharity = async (input: CreateCharityInput): Promise<CharityRecord> => {
  const [created] = await db
    .insert(charities)
    .values({
      name: input.name,
      description: input.description,
      category: input.category,
      logoUrl: input.logoUrl,
      website: input.website ?? null,
      bankDetailsEncrypted: input.bankDetailsEncrypted,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      isActive: input.isActive ?? true,
    })
    .returning(charitySelect);

  if (!created) {
    throw new Error('Unable to create charity');
  }

  return created;
};

export const updateCharity = async (params: {
  id: string;
  input: UpdateCharityInput;
}): Promise<CharityRecord | null> => {
  const updates: Partial<typeof charities.$inferInsert> = {
    ...params.input,
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(charities)
    .set(updates)
    .where(eq(charities.id, params.id))
    .returning(charitySelect);

  return updated ?? null;
};

export const setCharityActiveState = async (params: {
  id: string;
  isActive: boolean;
}): Promise<CharityRecord | null> => {
  const [updated] = await db
    .update(charities)
    .set({ isActive: params.isActive, updatedAt: new Date() })
    .where(eq(charities.id, params.id))
    .returning(charitySelect);

  return updated ?? null;
};

export const activateCharity = async (id: string) =>
  setCharityActiveState({ id, isActive: true });

export const deactivateCharity = async (id: string) =>
  setCharityActiveState({ id, isActive: false });

export type MonthlyCharitySummaryItem = {
  charityId: string;
  charityName: string;
  totalCharityCents: number;
  payoutCount: number;
  boardCount: number;
};

type CharityPayoutSummaryRow = {
  dreamBoardId: string;
  charityCents: number;
  recipientData: unknown;
};

const getRecipientField = (recipientData: unknown, field: string) => {
  if (!recipientData || typeof recipientData !== 'object' || Array.isArray(recipientData)) {
    return null;
  }

  const value = (recipientData as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : null;
};

export const aggregateMonthlyCharitySummary = (
  rows: CharityPayoutSummaryRow[]
): MonthlyCharitySummaryItem[] => {
  const summary = new Map<
    string,
    {
      charityName: string;
      totalCharityCents: number;
      payoutCount: number;
      boardIds: Set<string>;
    }
  >();

  for (const row of rows) {
    const charityId = getRecipientField(row.recipientData, 'charityId') ?? 'unknown';
    const charityName = getRecipientField(row.recipientData, 'charityName') ?? 'Unknown charity';

    const existing =
      summary.get(charityId) ??
      { charityName, totalCharityCents: 0, payoutCount: 0, boardIds: new Set<string>() };

    existing.totalCharityCents += row.charityCents;
    existing.payoutCount += 1;
    existing.boardIds.add(row.dreamBoardId);

    summary.set(charityId, {
      charityName: existing.charityName,
      totalCharityCents: existing.totalCharityCents,
      payoutCount: existing.payoutCount,
      boardIds: existing.boardIds,
    });
  }

  return Array.from(summary.entries())
    .map(([charityId, item]) => ({
      charityId,
      charityName: item.charityName,
      totalCharityCents: item.totalCharityCents,
      payoutCount: item.payoutCount,
      boardCount: item.boardIds.size,
    }))
    .sort((a, b) => b.totalCharityCents - a.totalCharityCents);
};

const getMonthWindow = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { start, end };
};

export const listMonthlyCharitySummary = async (params: {
  year: number;
  month: number;
}): Promise<MonthlyCharitySummaryItem[]> => {
  const { start, end } = getMonthWindow(params.year, params.month);
  const rows = await db
    .select({
      dreamBoardId: payouts.dreamBoardId,
      charityCents: payouts.charityCents,
      recipientData: payouts.recipientData,
    })
    .from(payouts)
    .where(
      and(
        eq(payouts.type, 'charity'),
        gte(payouts.createdAt, start),
        lt(payouts.createdAt, end)
      )
    )
    .orderBy(desc(payouts.createdAt));

  return aggregateMonthlyCharitySummary(rows);
};

export type BoardCharityBreakdownItem = {
  dreamBoardId: string;
  charityId: string;
  charityName: string;
  splitType: 'percentage' | 'threshold' | null;
  totalCharityCents: number;
  allocatedContributionCount: number;
};

type CharityContributionBreakdownRow = {
  dreamBoardId: string;
  charityId: string | null;
  charityName: string | null;
  splitType: 'percentage' | 'threshold' | null;
  contributionId: string | null;
  charityCents: number | null;
};

export const aggregateBoardCharityBreakdown = (
  rows: CharityContributionBreakdownRow[]
): BoardCharityBreakdownItem[] => {
  const grouped = new Map<string, BoardCharityBreakdownItem>();

  for (const row of rows) {
    const existing = grouped.get(row.dreamBoardId) ?? {
      dreamBoardId: row.dreamBoardId,
      charityId: row.charityId ?? 'unknown',
      charityName: row.charityName ?? 'Unknown charity',
      splitType: row.splitType,
      totalCharityCents: 0,
      allocatedContributionCount: 0,
    };

    if (typeof row.charityCents === 'number' && row.charityCents > 0) {
      existing.totalCharityCents += row.charityCents;
      existing.allocatedContributionCount += 1;
    }

    grouped.set(row.dreamBoardId, existing);
  }

  return Array.from(grouped.values()).sort((a, b) => b.totalCharityCents - a.totalCharityCents);
};

export const listBoardCharityBreakdown = async (params?: {
  dreamBoardId?: string;
  charityId?: string;
}) => {
  const conditions: SQL[] = [eq(dreamBoards.charityEnabled, true)];

  if (params?.dreamBoardId) {
    conditions.push(eq(dreamBoards.id, params.dreamBoardId));
  }

  if (params?.charityId) {
    conditions.push(eq(dreamBoards.charityId, params.charityId));
  }

  const rows = await db
    .select({
      dreamBoardId: dreamBoards.id,
      charityId: dreamBoards.charityId,
      charityName: charities.name,
      splitType: dreamBoards.charitySplitType,
      contributionId: contributions.id,
      charityCents: contributions.charityCents,
    })
    .from(dreamBoards)
    .leftJoin(charities, eq(charities.id, dreamBoards.charityId))
    .leftJoin(
      contributions,
      and(
        eq(contributions.dreamBoardId, dreamBoards.id),
        eq(contributions.paymentStatus, 'completed')
      )
    )
    .where(and(...conditions))
    .orderBy(desc(dreamBoards.updatedAt));

  return aggregateBoardCharityBreakdown(rows);
};
