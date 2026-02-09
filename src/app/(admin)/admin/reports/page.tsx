import { getAdminMonthlyCharityReconciliationDataset, getAdminPlatformSummaryDataset, parseAdminReportWindow, parseReportMonthYear } from '@/lib/admin';

import { toUrlSearchParams, type RouteSearchParams } from '../_lib/url';
import { ReportsClient } from './ReportsClient';

const toDateInputValue = (value: Date) => value.toISOString().slice(0, 10);

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const urlParams = toUrlSearchParams(resolvedSearchParams);

  const reportWindow = parseAdminReportWindow(urlParams);
  const monthYear = parseReportMonthYear(urlParams);

  const [summary, reconciliation] = await Promise.all([
    getAdminPlatformSummaryDataset(reportWindow),
    getAdminMonthlyCharityReconciliationDataset(monthYear),
  ]);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-text">Financial reports</h1>
        <p className="text-sm text-gray-500">Downloadable finance and charity reconciliation views.</p>
      </header>

      <ReportsClient
        summary={summary}
        reconciliation={reconciliation}
        fromValue={toDateInputValue(reportWindow.from)}
        toValue={toDateInputValue(reportWindow.to)}
      />
    </section>
  );
}
