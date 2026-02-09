'use client';

import Link from 'next/link';

import { AdminDataTable, AdminStatsCard, type AdminDataColumn } from '@/components/admin';
import { Button } from '@/components/ui/button';
import type { AdminMonthlyCharityReconciliationDataset, AdminPlatformSummaryDataset } from '@/lib/admin';
import { formatZar } from '@/lib/utils/money';

interface ReportsClientProps {
  summary: AdminPlatformSummaryDataset;
  reconciliation: AdminMonthlyCharityReconciliationDataset;
  fromValue: string;
  toValue: string;
}

const currency = (value: number) => formatZar(value);

export function ReportsClient({
  summary,
  reconciliation,
  fromValue,
  toValue,
}: ReportsClientProps) {
  const monthValue = String(reconciliation.month).padStart(2, '0');

  const columns: AdminDataColumn<AdminMonthlyCharityReconciliationDataset['items'][number]>[] = [
    {
      key: 'charity',
      header: 'Charity',
      render: (item) => <span className="font-semibold text-text">{item.charityName}</span>,
    },
    {
      key: 'amount',
      header: 'Total charity',
      render: (item) => <span>{currency(item.totalCharityCents)}</span>,
    },
    {
      key: 'boards',
      header: 'Boards',
      render: (item) => <span>{item.boardCount}</span>,
      className: 'text-right',
    },
    {
      key: 'payouts',
      header: 'Payouts',
      render: (item) => <span>{item.payoutCount}</span>,
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard label="Raised" value={currency(summary.totalRaisedCents)} />
        <AdminStatsCard label="Paid out" value={currency(summary.totalPaidOutCents)} />
        <AdminStatsCard label="Fees retained" value={currency(summary.totalFeesRetainedCents)} />
        <AdminStatsCard label="Contributions" value={String(summary.totalContributions)} />
      </div>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Platform summary window</h2>
        <form action="/admin/reports" method="get" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label htmlFor="from" className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={fromValue}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={toValue}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="self-end">
            <Button type="submit" size="sm" variant="outline">
              Refresh summary
            </Button>
          </div>
          <div className="self-end">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/contributions/export">Export contributions</Link>
            </Button>
          </div>
        </form>
      </article>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-text">Monthly charity reconciliation</h2>
            <p className="text-sm text-gray-500">
              Generated totals for {monthValue}/{reconciliation.year}.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/admin/reports/charity-reconciliation/export?month=${reconciliation.month}&year=${reconciliation.year}`}
            >
              Export reconciliation CSV
            </Link>
          </Button>
        </div>

        <form action="/admin/reports" method="get" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label htmlFor="month" className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              Month
            </label>
            <input
              id="month"
              name="month"
              type="number"
              min={1}
              max={12}
              defaultValue={reconciliation.month}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="year" className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min={2020}
              defaultValue={reconciliation.year}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <input type="hidden" name="from" value={fromValue} />
          <input type="hidden" name="to" value={toValue} />
          <div className="self-end">
            <Button type="submit" size="sm" variant="outline">
              Refresh month
            </Button>
          </div>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <AdminStatsCard
            label="Charity total"
            value={currency(reconciliation.totals.totalCharityCents)}
          />
          <AdminStatsCard label="Board count" value={String(reconciliation.totals.totalBoardCount)} />
          <AdminStatsCard label="Payout count" value={String(reconciliation.totals.totalPayoutCount)} />
        </div>

        <div className="mt-4">
          <AdminDataTable
            columns={columns}
            data={reconciliation.items}
            keyExtractor={(item) => item.charityId}
            caption="Monthly charity reconciliation table"
            emptyMessage="No charity payouts recorded for this period."
          />
        </div>
      </article>
    </div>
  );
}
