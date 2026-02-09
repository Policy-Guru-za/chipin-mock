import Link from 'next/link';

import {
  AdminDataTable,
  AdminFilterPanel,
  AdminPagination,
  StatusBadge,
  type AdminDataColumn,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { listAdminPayouts, parseAdminPayoutFilters, type AdminPayoutDataset } from '@/lib/admin';
import { formatZar } from '@/lib/utils/money';

import {
  buildHref,
  pickFilterValues,
  toPageNumber,
  toUrlSearchParams,
  type RouteSearchParams,
} from '../_lib/url';
import { formatAdminDateOrDash } from '../_lib/format';

const payoutTypeLabel = (type: AdminPayoutDataset['type']) =>
  ({
    karri_card: 'Karri card',
    bank: 'Bank transfer',
    charity: 'Charity',
  })[type] ?? type;

const columns: AdminDataColumn<AdminPayoutDataset>[] = [
  {
    key: 'dream-board',
    header: 'Dream board',
    render: (item) => (
      <Link
        href={`/${item.dreamBoardSlug}`}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-teal-700 hover:underline"
      >
        {item.childName}
      </Link>
    ),
  },
  {
    key: 'host',
    header: 'Host',
    render: (item) => <span>{item.hostEmail}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (item) => <span>{payoutTypeLabel(item.type)}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (item) => <span>{formatZar(item.netCents)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'created',
    header: 'Created',
    render: (item) => <span>{formatAdminDateOrDash(item.createdAt)}</span>,
  },
  {
    key: 'completed',
    header: 'Completed',
    render: (item) => <span>{formatAdminDateOrDash(item.completedAt)}</span>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item) => (
      <Link href={`/admin/payouts/${item.id}`} className="text-sm font-semibold text-teal-700 hover:underline">
        Review
      </Link>
    ),
  },
];

export default async function AdminPayoutQueuePage({
  searchParams,
}: {
  searchParams?: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseAdminPayoutFilters(urlParams);
  const page = await listAdminPayouts(filters);

  const exportParams = new URLSearchParams(urlParams.toString());
  exportParams.delete('cursor');
  exportParams.delete('cursor_stack');
  exportParams.delete('page');

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Payout queue</h1>
          <p className="text-sm text-gray-500">Review and manage payout records.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref('/admin/payouts/export', exportParams)}>Export CSV</Link>
        </Button>
      </header>

      <AdminFilterPanel
        basePath="/admin/payouts"
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: '', label: 'Any' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
            ],
          },
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { value: '', label: 'Any' },
              { value: 'karri_card', label: 'Karri card' },
              { value: 'bank', label: 'Bank transfer' },
              { value: 'charity', label: 'Charity' },
            ],
          },
          { key: 'created_from', label: 'From', type: 'date' },
          { key: 'created_to', label: 'To', type: 'date' },
        ]}
        values={pickFilterValues(urlParams, ['status', 'type', 'created_from', 'created_to'])}
      />

      <AdminDataTable
        columns={columns}
        data={page.items}
        keyExtractor={(item) => item.id}
        caption="Payout queue admin table"
        emptyMessage="No payouts match the current filters."
      />

      <AdminPagination
        basePath="/admin/payouts"
        hasMore={Boolean(page.nextCursor)}
        nextCursor={page.nextCursor}
        totalCount={page.totalCount}
        currentPage={toPageNumber(urlParams)}
      />
    </section>
  );
}
