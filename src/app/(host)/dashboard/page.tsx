import Image from 'next/image';
import Link from 'next/link';

import { ProgressBar } from '@/components/dream-board/ProgressBar';
import { Button } from '@/components/ui/button';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { buildDashboardCardViewModel } from '@/lib/host/dashboard-view-model';
import { listDreamBoardsForHostExpanded } from '@/lib/host/queries';

const badgeStyles: Record<string, string> = {
  active: 'bg-teal-50 text-teal-700',
  draft: 'bg-teal-50 text-teal-700',
  funded: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  paid_out: 'bg-gray-100 text-gray-600',
  expired: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export default async function HostDashboardPage() {
  const session = await requireHostAuth();
  const boards = await listDreamBoardsForHostExpanded(session.hostId);
  const cards = boards.map((board) => buildDashboardCardViewModel(board));

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-[28px] font-bold text-text">Your Dream Boards</h1>
        <Link href="/create/child" className="w-full md:w-auto">
          <Button className="w-full bg-primary-700 hover:bg-primary-800 md:w-auto">Create a Dream Board +</Button>
        </Link>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center">
          <h2 className="text-lg text-gray-600">You haven&apos;t created a Dream Board yet.</h2>
          <div className="mt-6">
            <Link href="/create/child">
              <Button size="lg">Create your first Dream Board</Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const badgeClass = badgeStyles[card.statusVariant] ?? badgeStyles.active;
            return (
              <li key={card.boardId}>
                <Link
                  href={card.manageHref}
                  aria-label={`${card.displayTitle} — ${card.statusLabel}`}
                  className="flex min-h-[292px] flex-col rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {card.childPhotoUrl ? (
                        <Image
                          src={card.childPhotoUrl}
                          alt={`${card.displayTitle} child avatar`}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full border-2 border-teal-500 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-100 text-sm font-semibold text-teal-700">
                          {getInitials(card.boardTitle)}
                        </div>
                      )}
                      <p className="font-display text-lg font-bold text-text">{card.boardTitle}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
                      {card.statusLabel}
                    </span>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={card.percentage} max={100} size="sm" showMilestones={false} />
                  </div>

                  <div className="mt-4 space-y-1 text-sm">
                    <p className="font-semibold text-text">{card.raisedLabel} raised</p>
                    <p className="text-gray-500">from {card.contributionCount} contributors</p>
                  </div>

                  <p className="mt-3 text-sm text-gray-500">{card.timeLabel}</p>

                  <p className="mt-auto pt-6 text-right text-sm font-semibold text-primary-700">View →</p>
                </Link>
              </li>
            );
          })}

          <li>
            <Link
              href="/create/child"
              className="flex min-h-[292px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-5 text-center text-gray-500 transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="text-[32px] leading-none">+</span>
              <span className="mt-3 text-base font-medium">Create a Dream Board</span>
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}
