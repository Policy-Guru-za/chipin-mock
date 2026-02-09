import Link from 'next/link';

import {
  AdminDataTable,
  AdminFilterPanel,
  AdminPagination,
  StatusBadge,
  type AdminDataColumn,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import {
  listAdminContributions,
  parseAdminContributionFilters,
  type AdminContributionDataset,
} from '@/lib/admin';
import { formatZar } from '@/lib/utils/money';

import {
  buildHref,
  pickFilterValues,
  toPageNumber,
  toUrlSearchParams,
  type RouteSearchParams,
} from '../_lib/url';
import { formatAdminDate } from '../_lib/format';

const columns: AdminDataColumn<AdminContributionDataset>[] = [
  {
    key: 'contributor',
    header: 'Contributor',
    render: (item) => <p>{item.contributorName?.trim() ? item.contributorName : 'Anonymous'}</p>,
  },
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
    key: 'amount',
    header: 'Amount',
    render: (item) => <span>{formatZar(item.amountCents)}</span>,
  },
  {
    key: 'fee',
    header: 'Fee',
    render: (item) => <span className="text-gray-500">{formatZar(item.feeCents)}</span>,
  },
  {
    key: 'net',
    header: 'Net',
    render: (item) => <span>{formatZar(item.netCents)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <StatusBadge status={item.paymentStatus} />,
  },
  {
    key: 'method',
    header: 'Method',
    render: (item) => <span className="capitalize">{item.paymentProvider}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    render: (item) => <span>{formatAdminDate(item.createdAt)}</span>,
  },
];

export default async function AdminContributionsPage({
  searchParams,
}: {
  searchParams?: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseAdminContributionFilters(urlParams);
  const page = await listAdminContributions(filters);

  const exportParams = new URLSearchParams(urlParams.toString());
  exportParams.delete('cursor');
  exportParams.delete('cursor_stack');
  exportParams.delete('page');

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Contributions</h1>
          <p className="text-sm text-gray-500">Contribution ledger across all dream boards.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref('/admin/contributions/export', exportParams)}>Export CSV</Link>
        </Button>
      </header>

      <AdminFilterPanel
        basePath="/admin/contributions"
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
              { value: 'refunded', label: 'Refunded' },
            ],
          },
          {
            key: 'provider',
            label: 'Payment method',
            type: 'select',
            options: [
              { value: '', label: 'Any' },
              { value: 'payfast', label: 'PayFast' },
              { value: 'ozow', label: 'Ozow' },
              { value: 'snapscan', label: 'SnapScan' },
            ],
          },
          { key: 'created_from', label: 'From', type: 'date' },
          { key: 'created_to', label: 'To', type: 'date' },
          {
            key: 'search',
            label: 'Search',
            type: 'text',
            placeholder: 'Contributor or board',
          },
        ]}
        values={pickFilterValues(urlParams, [
          'status',
          'provider',
          'created_from',
          'created_to',
          'search',
        ])}
      />

      <AdminDataTable
        columns={columns}
        data={page.items}
        keyExtractor={(item) => item.id}
        caption="Contributions admin table"
        emptyMessage="No contributions match the current filters."
      />

      <AdminPagination
        basePath="/admin/contributions"
        hasMore={Boolean(page.nextCursor)}
        nextCursor={page.nextCursor}
        totalCount={page.totalCount}
        currentPage={toPageNumber(urlParams)}
      />
    </section>
  );
}
