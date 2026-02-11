import Link from 'next/link';

import { DashboardTimeline } from '@/components/dashboard-timeline/DashboardTimeline';
import { Button } from '@/components/ui/button';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { buildDashboardCardViewModel } from '@/lib/host/dashboard-view-model';
import { listDreamBoardsForHostExpanded } from '@/lib/host/queries';

export default async function HostDashboardPage() {
  const session = await requireHostAuth();
  const boards = await listDreamBoardsForHostExpanded(session.hostId);
  const cards = boards.map((board) => buildDashboardCardViewModel(board));

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-[28px] font-bold text-text">Your Dreamboards</h1>
        <Link href="/create/child" className="w-full md:w-auto">
          <Button className="w-full bg-primary-700 hover:bg-primary-800 md:w-auto">Create a Dreamboard +</Button>
        </Link>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center">
          <h2 className="text-lg text-gray-600">You haven&apos;t created a Dreamboard yet.</h2>
          <div className="mt-6">
            <Link href="/create/child">
              <Button size="lg">Create your first Dreamboard</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          <DashboardTimeline cards={cards} />
        </div>
      )}
    </section>
  );
}
