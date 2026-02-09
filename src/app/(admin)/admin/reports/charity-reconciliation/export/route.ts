import { NextRequest } from 'next/server';

import { getAdminMonthlyCharityReconciliationDataset, parseReportMonthYear } from '@/lib/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

import { csvAttachment, toCsv } from '../../../_lib/csv';

const headers = [
  'year',
  'month',
  'charity_id',
  'charity_name',
  'total_charity_cents',
  'payout_count',
  'board_count',
];

export async function GET(request: NextRequest) {
  await requireAdminAuth();

  const monthYear = parseReportMonthYear(request.nextUrl.searchParams);
  const reconciliation = await getAdminMonthlyCharityReconciliationDataset(monthYear);

  const rows = reconciliation.items.map((item) => ({
    year: reconciliation.year,
    month: reconciliation.month,
    charity_id: item.charityId,
    charity_name: item.charityName,
    total_charity_cents: item.totalCharityCents,
    payout_count: item.payoutCount,
    board_count: item.boardCount,
  }));

  const csv = toCsv(headers, rows);
  return csvAttachment(
    csv,
    `gifta-admin-charity-reconciliation-${reconciliation.year}-${String(reconciliation.month).padStart(2, '0')}.csv`,
  );
}
