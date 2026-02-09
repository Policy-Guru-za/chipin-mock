import Link from 'next/link';

import { AdminStatsCard } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { getAdminDashboardDataset } from '@/lib/admin';
import { formatZar } from '@/lib/utils/money';

export default async function AdminDashboardPage() {
  const dataset = await getAdminDashboardDataset();

  const attentionItems = [
    {
      key: 'pending',
      label: 'Pending payouts',
      value: dataset.pendingPayoutsCount,
      href: '/admin/payouts?status=pending',
      danger: false,
    },
    {
      key: 'failed',
      label: 'Failed payouts',
      value: dataset.failedPayoutsCount,
      href: '/admin/payouts?status=failed',
      danger: dataset.failedPayoutsCount > 0,
    },
  ];
  const hasAttention = attentionItems.some((item) => item.value > 0);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-[28px] font-bold text-text">Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview for the last 30 days.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard label="Total GMV" value={formatZar(dataset.grossMerchandiseValueCents)} />
        <AdminStatsCard
          label="Dream boards"
          value={String(dataset.totalBoards)}
          subtitle={`${dataset.activeBoards} active`}
        />
        <AdminStatsCard label="Contributors" value={String(dataset.totalContributors)} />
        <AdminStatsCard
          label="Fees retained"
          value={formatZar(dataset.totalFeesRetainedCents)}
          variant="success"
        />
      </div>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Requires attention</h2>
        {hasAttention ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {attentionItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-lg border px-4 py-3 text-sm hover:bg-gray-50 ${
                  item.danger ? 'border-red-200 text-red-700' : 'border-gray-200 text-gray-700'
                }`}
              >
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1">{item.value}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-400">Nothing needs attention right now.</p>
        )}
      </article>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/payouts">View payouts</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dream-boards">View dream boards</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reports">Export reports</Link>
          </Button>
        </div>
      </article>
    </section>
  );
}
