import { NextRequest } from 'next/server';

import { decodeCursor } from '@/lib/api/pagination';
import {
  listAdminCharities,
  parseAdminCharityFilters,
  toAdminCharityCsvRows,
  type AdminCharityDataset,
} from '@/lib/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

import { csvAttachment, toCsv } from '../../_lib/csv';

const headers = [
  'id',
  'name',
  'category',
  'is_active',
  'total_raised_cents',
  'total_boards',
  'total_payouts_cents',
  'created_at_iso',
];

const listAll = async (searchParams: URLSearchParams): Promise<AdminCharityDataset[]> => {
  const baseFilters = parseAdminCharityFilters(searchParams);
  const items: AdminCharityDataset[] = [];
  let cursor = baseFilters.cursor;

  do {
    const page = await listAdminCharities({
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
  const csvRows = toAdminCharityCsvRows(items);
  const csv = toCsv(headers, csvRows);

  return csvAttachment(csv, 'gifta-admin-charities.csv');
}
