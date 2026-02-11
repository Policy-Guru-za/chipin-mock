import type { DashboardCardViewModel } from '@/lib/host/dashboard-view-model';
import {
  TimelineBoltIcon,
  TimelineCheckIcon,
  TimelinePlusIcon,
} from '@/components/dashboard-timeline/dashboard-timeline-icons';
import { DashboardTimelineCreateNode } from '@/components/dashboard-timeline/DashboardTimelineCreateNode';
import { DashboardTimelineHeroCard } from '@/components/dashboard-timeline/DashboardTimelineHeroCard';
import { DashboardTimelinePastCard } from '@/components/dashboard-timeline/DashboardTimelinePastCard';

type DashboardTimelineProps = {
  cards: DashboardCardViewModel[];
};

const LIVE_VARIANTS = new Set<DashboardCardViewModel['statusVariant']>(['active', 'draft', 'funded']);

const timelineDate = (card: DashboardCardViewModel) => card.partyDate ?? card.campaignEndDate;

const formatTimelineLabel = (card: DashboardCardViewModel) => {
  const date = timelineDate(card);
  if (!date) return card.statusLabel;
  return date.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });
};

export function DashboardTimeline({ cards }: DashboardTimelineProps) {
  const liveCards = cards.filter((card) => LIVE_VARIANTS.has(card.statusVariant));
  const archivedCards = cards.filter((card) => !LIVE_VARIANTS.has(card.statusVariant));
  const heroCard = liveCards[0] ?? null;
  const extraLiveCards = heroCard ? liveCards.slice(1) : liveCards;

  return (
    <div className="relative pl-10">
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[13px] top-0 w-px bg-[linear-gradient(180deg,#4A7E66_0%,#E9F3ED_34%,#EDE7DE_66%,#F5F1EA_100%)]"
      />

      {heroCard ? (
        <section className="relative mb-8">
          <div
            aria-hidden="true"
            className="absolute -left-10 top-6 flex h-7 w-7 items-center justify-center rounded-full bg-sage text-white shadow-[0_0_0_4px_#E9F3ED,0_2px_8px_rgba(74,126,102,0.2)]"
          >
            <TimelineBoltIcon />
          </div>
          <p className="mb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage">Happening now</p>
          <DashboardTimelineHeroCard card={heroCard} />
        </section>
      ) : null}

      {extraLiveCards.map((card) => (
        <section key={card.boardId} className="relative mb-7">
          <div
            aria-hidden="true"
            className="absolute -left-10 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 border-sage-light bg-white text-sage"
          >
            <TimelinePlusIcon className="h-3 w-3" />
          </div>
          <p className="mb-2 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage">{card.statusLabel}</p>
          <DashboardTimelinePastCard card={card} mode="live" />
        </section>
      ))}

      {archivedCards.map((card) => (
        <section key={card.boardId} className="relative mb-7">
          <div
            aria-hidden="true"
            className="absolute -left-10 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 border-border bg-white text-ink-ghost"
          >
            <TimelineCheckIcon />
          </div>
          <p className="mb-2 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            {formatTimelineLabel(card)}
          </p>
          <DashboardTimelinePastCard card={card} />
        </section>
      ))}

      <DashboardTimelineCreateNode />
    </div>
  );
}
