import Image from 'next/image';
import Link from 'next/link';

import type { DashboardCardViewModel } from '@/lib/host/dashboard-view-model';
import { TimelineChevronRightIcon, TimelineShareIcon } from '@/components/dashboard-timeline/dashboard-timeline-icons';

type DashboardTimelineHeroCardProps = {
  card: DashboardCardViewModel;
};

const formatShortDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
      })
    : 'TBD';

const formatLongDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Date to be confirmed';

const formatRand = (cents: number) =>
  `R ${Math.max(0, Math.round(cents / 100)).toLocaleString('en-ZA')}`;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const getDaysStat = (card: DashboardCardViewModel) => {
  if (typeof card.daysRemaining === 'number' && card.daysRemaining >= 0) {
    return String(card.daysRemaining);
  }
  if (card.timeLabel.startsWith('Ended')) {
    return 'Ended';
  }
  return '--';
};

export function DashboardTimelineHeroCard({ card }: DashboardTimelineHeroCardProps) {
  const progress = Math.min(100, card.goalCents > 0 ? (card.raisedCents / card.goalCents) * 100 : 0);
  const contributorLabel = `from ${card.contributionCount} ${
    card.contributionCount === 1 ? 'contributor' : 'contributors'
  }`;
  const shareHint = card.contributionCount === 0 ? 'Share to start collecting' : 'Keep sharing your Dreamboard';

  return (
    <Link
      href={card.manageHref}
      aria-label={`${card.displayTitle} — ${card.statusLabel}`}
      className="group block overflow-hidden rounded-[28px] border border-border-warmth bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
    >
      <div className="flex flex-wrap items-center gap-4 bg-[linear-gradient(135deg,#F1F7F4_0%,#FBF8F3_50%,#F7EFE2_100%)] px-6 py-6 sm:flex-nowrap sm:px-8 sm:py-7">
        {card.childPhotoUrl ? (
          <Image
            src={card.childPhotoUrl}
            alt={`${card.boardTitle} child avatar`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover shadow-[0_0_0_3px_white,0_2px_12px_rgba(74,126,102,0.15)]"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-light text-base font-semibold text-sage shadow-[0_0_0_3px_white,0_2px_12px_rgba(74,126,102,0.15)]">
            {getInitials(card.boardTitle)}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="font-warmth-serif text-[21px] text-ink">{card.boardTitle}</h3>
          <p className="text-sm text-ink-soft">Party: {formatLongDate(card.partyDate)}</p>
        </div>

        <span className="inline-flex items-center rounded-full bg-plum-wash px-3 py-1 text-xs font-medium text-plum sm:ml-auto">
          {card.displayTitle}
        </span>
      </div>

      <div className="px-6 py-5 sm:px-8 sm:py-6">
        <div className="mb-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xl font-semibold text-ink">
              {card.raisedLabel}
              <span className="ml-1 text-xs font-normal text-ink-faint">raised</span>
            </p>
            <p className="text-xs text-ink-soft">{contributorLabel}</p>
          </div>
          <p className="mb-2 text-xs text-ink-faint">Goal: {formatRand(card.goalCents)}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-border-soft">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#4A7E66_0%,#3B6B55_100%)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border-soft bg-bg-warmth sm:grid-cols-3">
          <div className="border-b border-border-soft px-4 py-3 text-center sm:border-b-0 sm:border-r sm:border-border-soft">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Party</p>
            <p className="text-sm font-medium text-ink">{formatShortDate(card.partyDate)}</p>
          </div>
          <div className="border-b border-border-soft px-4 py-3 text-center sm:border-b-0 sm:border-r sm:border-border-soft">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Closes</p>
            <p className="text-sm font-medium text-ink">{formatShortDate(card.campaignEndDate)}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Days left</p>
            <p className="text-sm font-semibold text-sage">{getDaysStat(card)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-soft px-6 py-4 sm:px-8">
        <p className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <TimelineShareIcon className="text-ink-ghost" />
          {shareHint}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-sage transition-all group-hover:gap-2">
          View
          <TimelineChevronRightIcon />
        </span>
      </div>
    </Link>
  );
}
