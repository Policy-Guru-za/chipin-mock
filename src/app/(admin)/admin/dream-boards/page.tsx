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
  listAdminDreamBoards,
  parseAdminDreamBoardFilters,
  type AdminDreamBoardDataset,
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

const columns: AdminDataColumn<AdminDreamBoardDataset>[] = [
  {
    key: 'child',
    header: 'Child',
    render: (item) => <p className="font-semibold text-text">{item.childName}</p>,
  },
  {
    key: 'host',
    header: 'Host',
    render: (item) => (
      <div>
        <p className="font-medium text-text">{item.hostName ?? 'Unknown host'}</p>
        <p className="text-xs text-gray-400">{item.hostEmail}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'goal',
    header: 'Goal',
    render: (item) => <span>{formatZar(item.goalCents)}</span>,
  },
  {
    key: 'raised',
    header: 'Raised',
    render: (item) => <span>{formatZar(item.raisedCents)}</span>,
  },
  {
    key: 'contributors',
    header: 'Contributors',
    render: (item) => <span>{item.contributorCount}</span>,
    className: 'text-right',
  },
  {
    key: 'created',
    header: 'Created',
    render: (item) => <span>{formatAdminDate(item.createdAt)}</span>,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item) => (
      <Link
        href={`/${item.slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-teal-700 hover:underline"
      >
        View
      </Link>
    ),
  },
];

export default async function AdminDreamBoardsPage({
  searchParams,
}: {
  searchParams?: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseAdminDreamBoardFilters(urlParams);
  const page = await listAdminDreamBoards(filters);

  const exportParams = new URLSearchParams(urlParams.toString());
  exportParams.delete('cursor');
  exportParams.delete('cursor_stack');
  exportParams.delete('page');

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Dream Boards</h1>
          <p className="text-sm text-gray-500">Read-only view of host campaigns and progress.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref('/admin/dream-boards/export', exportParams)}>Export CSV</Link>
        </Button>
      </header>

      <AdminFilterPanel
        basePath="/admin/dream-boards"
        fields={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: '', label: 'Any' },
              { value: 'active', label: 'Active' },
              { value: 'funded', label: 'Funded' },
              { value: 'closed', label: 'Closed' },
              { value: 'paid_out', label: 'Paid out' },
              { value: 'expired', label: 'Expired' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          { key: 'created_from', label: 'From', type: 'date' },
          { key: 'created_to', label: 'To', type: 'date' },
          {
            key: 'search',
            label: 'Search',
            type: 'text',
            placeholder: 'Child or gift name',
          },
          {
            key: 'charity_enabled',
            label: 'Charity enabled',
            type: 'boolean',
          },
        ]}
        values={pickFilterValues(urlParams, [
          'status',
          'created_from',
          'created_to',
          'search',
          'charity_enabled',
        ])}
      />

      <AdminDataTable
        columns={columns}
        data={page.items}
        keyExtractor={(item) => item.id}
        caption="Dream boards admin table"
        emptyMessage="No dream boards match the current filters."
      />

      <AdminPagination
        basePath="/admin/dream-boards"
        hasMore={Boolean(page.nextCursor)}
        nextCursor={page.nextCursor}
        totalCount={page.totalCount}
        currentPage={toPageNumber(urlParams)}
      />
    </section>
  );
}
