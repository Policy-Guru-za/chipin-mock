import Link from 'next/link';

import { AdminFilterPanel } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { listAdminCharities, parseAdminCharityFilters } from '@/lib/admin';

import { buildHref, pickFilterValues, toPageNumber, toUrlSearchParams, type RouteSearchParams } from '../_lib/url';
import { CharitiesClient } from './CharitiesClient';

export default async function AdminCharitiesPage({
  searchParams,
}: {
  searchParams?: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseAdminCharityFilters(urlParams);
  const page = await listAdminCharities(filters);

  const exportParams = new URLSearchParams(urlParams.toString());
  exportParams.delete('cursor');
  exportParams.delete('cursor_stack');
  exportParams.delete('page');

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Charity management</h1>
          <p className="text-sm text-gray-500">Create, edit, and activate partner charities.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref('/admin/charities/export', exportParams)}>Export CSV</Link>
        </Button>
      </header>

      <AdminFilterPanel
        basePath="/admin/charities"
        fields={[
          { key: 'is_active', label: 'Active', type: 'boolean' },
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { value: '', label: 'Any' },
              { value: 'Education', label: 'Education' },
              { value: 'Health', label: 'Health' },
              { value: 'Environment', label: 'Environment' },
              { value: 'Community', label: 'Community' },
              { value: 'Other', label: 'Other' },
            ],
          },
          {
            key: 'search',
            label: 'Search',
            type: 'text',
            placeholder: 'Charity name',
          },
        ]}
        values={pickFilterValues(urlParams, ['is_active', 'category', 'search'])}
      />

      <CharitiesClient
        charities={page.items}
        totalCount={page.totalCount}
        nextCursor={page.nextCursor}
        currentPage={toPageNumber(urlParams)}
      />
    </section>
  );
}
