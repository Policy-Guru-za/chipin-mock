import { NextRequest } from 'next/server';

import { decodeCursor } from '@/lib/api/pagination';
import {
  listAdminPayouts,
  parseAdminPayoutFilters,
  toAdminPayoutCsvRows,
  type AdminPayoutCsvRow,
} from '@/lib/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

const headers = [
  'id',
  'dream_board_id',
  'dream_board_slug',
  'child_name',
  'type',
  'status',
  'gross_cents',
  'fee_cents',
  'charity_cents',
  'net_cents',
  'payout_email',
  'host_email',
  'charity_id',
  'charity_name',
  'created_at_iso',
  'completed_at_iso',
] as const;

type PayoutCsvHeader = (typeof headers)[number];
type CsvCell = string | number | boolean | null | undefined;

const escapeCsv = (value: CsvCell) => {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const serializeRows = (rows: AdminPayoutCsvRow[]) =>
  rows.map((row) => headers.map((header) => escapeCsv(row[header as PayoutCsvHeader])).join(',')).join('\n');

const streamPayoutCsv = (searchParams: URLSearchParams) => {
  const encoder = new TextEncoder();
  const baseFilters = parseAdminPayoutFilters(searchParams);
  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`${headers.join(',')}\n`));

        let cursor = baseFilters.cursor;

        while (true) {
          const page = await listAdminPayouts({
            ...baseFilters,
            limit: 200,
            cursor,
          });

          if (page.items.length === 0) {
            break;
          }

          const csvRows = toAdminPayoutCsvRows(page.items);
          const chunk = serializeRows(csvRows);
          controller.enqueue(encoder.encode(`${chunk}\n`));

          cursor = decodeCursor(page.nextCursor);
          if (!cursor) {
            break;
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
};

export async function GET(request: NextRequest) {
  await requireAdminAuth();

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  searchParams.delete('cursor');
  searchParams.delete('cursor_stack');
  searchParams.delete('page');

  const stream = streamPayoutCsv(searchParams);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="gifta-admin-payouts.csv"',
    },
  });
}
