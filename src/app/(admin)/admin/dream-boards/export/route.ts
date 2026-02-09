import { NextRequest } from 'next/server';

import { decodeCursor } from '@/lib/api/pagination';
import {
  listAdminDreamBoards,
  parseAdminDreamBoardFilters,
  toAdminDreamBoardCsvRows,
  type AdminDreamBoardDataset,
} from '@/lib/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

import { csvAttachment, toCsv } from '../../_lib/csv';

const headers = [
  'id',
  'slug',
  'child_name',
  'gift_name',
  'status',
  'host_email',
  'goal_cents',
  'raised_cents',
  'contributor_count',
  'payout_pending_count',
  'payout_processing_count',
  'payout_completed_count',
  'payout_failed_count',
  'created_at_iso',
];

const listAll = async (searchParams: URLSearchParams): Promise<AdminDreamBoardDataset[]> => {
  const baseFilters = parseAdminDreamBoardFilters(searchParams);
  const items: AdminDreamBoardDataset[] = [];
  let cursor = baseFilters.cursor;

  do {
    const page = await listAdminDreamBoards({
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
  const csvRows = toAdminDreamBoardCsvRows(items);
  const csv = toCsv(headers, csvRows);

  return csvAttachment(csv, 'gifta-admin-dream-boards.csv');
}
