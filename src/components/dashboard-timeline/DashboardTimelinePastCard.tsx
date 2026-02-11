import Image from 'next/image';
import Link from 'next/link';

import type { DashboardCardViewModel } from '@/lib/host/dashboard-view-model';
import { TimelineChevronRightIcon } from '@/components/dashboard-timeline/dashboard-timeline-icons';

type DashboardTimelinePastCardProps = {
  card: DashboardCardViewModel;
  mode?: 'past' | 'live';
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const statusClasses: Record<'past' | 'live', string> = {
  live: 'text-sage',
  past: 'text-ink-soft',
};

export function DashboardTimelinePastCard({ card, mode = 'past' }: DashboardTimelinePastCardProps) {
  return (
    <Link
      href={card.manageHref}
      aria-label={`${card.displayTitle} — ${card.statusLabel}`}
      className="group flex items-center gap-4 rounded-2xl border border-border-soft bg-white px-5 py-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
    >
      {card.childPhotoUrl ? (
        <Image
          src={card.childPhotoUrl}
          alt={`${card.boardTitle} child avatar`}
          width={46}
          height={46}
          className="h-[46px] w-[46px] rounded-full object-cover"
        />
      ) : (
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-plum-wash text-sm font-semibold text-plum">
          {getInitials(card.boardTitle)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-warmth-serif text-[17px] text-ink">{card.boardTitle}</h4>
        <p className="truncate text-xs text-ink-soft">
          {card.displayTitle} · {card.contributionCount} {card.contributionCount === 1 ? 'contributor' : 'contributors'}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="text-sm font-semibold text-ink">{card.raisedLabel}</p>
        <p className={`text-[11px] font-medium ${statusClasses[mode]}`}>{card.statusLabel}</p>
      </div>

      <TimelineChevronRightIcon className="text-ink-ghost transition group-hover:translate-x-0.5 group-hover:text-ink-soft" />
    </Link>
  );
}
