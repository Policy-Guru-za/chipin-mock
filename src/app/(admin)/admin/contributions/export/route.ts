import { NextRequest } from 'next/server';

import { decodeCursor } from '@/lib/api/pagination';
import {
  listAdminContributions,
  parseAdminContributionFilters,
  toAdminContributionCsvRows,
  type AdminContributionDataset,
} from '@/lib/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

import { csvAttachment, toCsv } from '../../_lib/csv';

const headers = [
  'id',
  'dream_board_id',
  'dream_board_slug',
  'child_name',
  'contributor_name',
  'payment_provider',
  'payment_status',
  'amount_cents',
  'fee_cents',
  'net_cents',
  'charity_cents',
  'payment_ref',
  'created_at_iso',
];

const listAll = async (searchParams: URLSearchParams): Promise<AdminContributionDataset[]> => {
  const baseFilters = parseAdminContributionFilters(searchParams);
  const items: AdminContributionDataset[] = [];
  let cursor = baseFilters.cursor;

  do {
    const page = await listAdminContributions({
      ...baseFilters,
      limit: 200,
      cursor,
    });
    items.push(...page.items);
    cursor = decodeCursor(page.nextCursor);
  } while (cursor);

  return items;
};

export async function GET(request: NextRequest) {
  await requireAdminAuth();

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  searchParams.delete('cursor');
  searchParams.delete('cursor_stack');
  searchParams.delete('page');

  const items = await listAll(searchParams);
  const csvRows = toAdminContributionCsvRows(items);
  const csv = toCsv(headers, csvRows);

  return csvAttachment(csv, 'gifta-admin-contributions.csv');
}
