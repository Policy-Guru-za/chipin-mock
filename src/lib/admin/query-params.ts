import { decodeCursor, type PaginationCursor } from '@/lib/api/pagination';

import type {
  AdminCharityFilters,
  AdminContributionFilters,
  AdminDreamBoardFilters,
  AdminHostFilters,
  AdminPayoutFilters,
} from './types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/;

const parseIntParam = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseDateParam = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined;

  const datePartsMatch = value.match(ISO_DATE_PREFIX);
  if (datePartsMatch) {
    const [, yearRaw, monthRaw, dayRaw] = datePartsMatch;
    const year = Number.parseInt(yearRaw, 10);
    const month = Number.parseInt(monthRaw, 10);
    const day = Number.parseInt(dayRaw, 10);
    const validated = new Date(Date.UTC(year, month - 1, day));

    if (
      validated.getUTCFullYear() !== year ||
      validated.getUTCMonth() + 1 !== month ||
      validated.getUTCDate() !== day
    ) {
      return undefined;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseBooleanParam = (value: string | null | undefined): boolean | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

const parseLimit = (value: string | null | undefined, fallback = DEFAULT_LIMIT) => {
  const parsed = parseIntParam(value);
  if (parsed === null) return fallback;
  if (parsed < 1) return 1;
  return Math.min(parsed, MAX_LIMIT);
};

const parseCursor = (value: string | null | undefined): PaginationCursor | null =>
  decodeCursor(value ?? null);

const splitCsv = (value: string | null | undefined) => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseAdminDreamBoardFilters = (
  params: URLSearchParams,
): AdminDreamBoardFilters => ({
  limit: parseLimit(params.get('limit')),
  cursor: parseCursor(params.get('cursor')),
  statuses: splitCsv(params.get('status')).filter((status) =>
    ['draft', 'active', 'funded', 'closed', 'paid_out', 'expired', 'cancelled'].includes(status),
  ) as AdminDreamBoardFilters['statuses'],
  createdFrom: parseDateParam(params.get('created_from')),
  createdTo: parseDateParam(params.get('created_to')),
  hostId: params.get('host_id') || undefined,
  charityEnabled: parseBooleanParam(params.get('charity_enabled')),
  search: params.get('search') || undefined,
});

export const parseAdminContributionFilters = (
  params: URLSearchParams,
): AdminContributionFilters => ({
  limit: parseLimit(params.get('limit')),
  cursor: parseCursor(params.get('cursor')),
  statuses: splitCsv(params.get('status')).filter((status) =>
    ['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status),
  ) as AdminContributionFilters['statuses'],
  paymentProviders: splitCsv(params.get('provider')).filter((provider) =>
    ['payfast', 'ozow', 'snapscan'].includes(provider),
  ) as AdminContributionFilters['paymentProviders'],
  createdFrom: parseDateParam(params.get('created_from')),
  createdTo: parseDateParam(params.get('created_to')),
  dreamBoardId: params.get('dream_board_id') || undefined,
  search: params.get('search') || undefined,
});

export const parseAdminPayoutFilters = (params: URLSearchParams): AdminPayoutFilters => ({
  limit: parseLimit(params.get('limit')),
  cursor: parseCursor(params.get('cursor')),
  statuses: splitCsv(params.get('status')).filter((status) =>
    ['pending', 'processing', 'completed', 'failed'].includes(status),
  ) as AdminPayoutFilters['statuses'],
  types: splitCsv(params.get('type')).filter((type) =>
    ['karri_card', 'bank', 'charity'].includes(type),
  ) as AdminPayoutFilters['types'],
  giftMethod:
    params.get('gift_method') === 'karri_card' || params.get('gift_method') === 'bank'
      ? (params.get('gift_method') as 'karri_card' | 'bank')
      : undefined,
  charityId: params.get('charity_id') || undefined,
  createdFrom: parseDateParam(params.get('created_from')),
  createdTo: parseDateParam(params.get('created_to')),
});

export const parseAdminCharityFilters = (params: URLSearchParams): AdminCharityFilters => ({
  limit: parseLimit(params.get('limit')),
  cursor: parseCursor(params.get('cursor')),
  isActive: parseBooleanParam(params.get('is_active')),
  category: params.get('category') || undefined,
  search: params.get('search') || undefined,
});

export const parseAdminHostFilters = (params: URLSearchParams): AdminHostFilters => ({
  limit: parseLimit(params.get('limit')),
  cursor: parseCursor(params.get('cursor')),
  createdFrom: parseDateParam(params.get('created_from')),
  createdTo: parseDateParam(params.get('created_to')),
  minBoardCount: parseIntParam(params.get('min_board_count')) ?? undefined,
  search: params.get('search') || undefined,
});

export const parseReportMonthYear = (params: URLSearchParams) => {
  const current = new Date();
  const month = parseIntParam(params.get('month')) ?? current.getUTCMonth() + 1;
  const year = parseIntParam(params.get('year')) ?? current.getUTCFullYear();
  return {
    month: Math.max(1, Math.min(month, 12)),
    year: Math.max(2020, year),
  };
};

export const parseAdminReportWindow = (params: URLSearchParams) => {
  const to = parseDateParam(params.get('to')) ?? new Date();
  const from = parseDateParam(params.get('from')) ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
};
