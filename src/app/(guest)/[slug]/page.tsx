import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';
import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';
import {
  buildDreamboardCtaStateMessage,
  DreamboardCtaCard,
} from '@/components/dream-board/DreamboardCtaCard';
import { DreamboardDetailsCard } from '@/components/dream-board/DreamboardDetailsCard';
import { GiftCard } from '@/components/dream-board/GiftCard';
import { HeroStrip } from '@/components/dream-board/HeroStrip';
import { getHostAuth } from '@/lib/auth/clerk-wrappers';
import { listRecentContributors } from '@/lib/db/queries';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildDreamBoardMetadata } from '@/lib/dream-boards/metadata';
import { formatBirthdayPartyLine, hasBirthdayParty } from '@/lib/dream-boards/party-visibility';
import { buildGuestViewModel } from '@/lib/dream-boards/view-model';
import { parseDateOnly } from '@/lib/utils/date';

const getBoard = cache(async (slug: string) => getCachedDreamBoardBySlug(slug));

const formatBoardDate = (value?: string | Date | null) => {
  const parsed = parseDateOnly(value ?? undefined);
  if (!parsed) return null;
  return parsed.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

function ParentBanner({ boardId }: { boardId: string }) {
  return (
    <section className="rounded-[20px] border border-border-warmth bg-sage-wash p-5 shadow-card sm:p-6">
      <p className="font-warmth-sans text-sm text-ink">👋 This is your Dreamboard. You&apos;re all set!</p>
      <Link
        href={`/dashboard/${boardId}`}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-sage px-4 py-2.5 font-warmth-sans text-sm font-semibold text-sage transition hover:bg-sage hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
      >
        View Dashboard
      </Link>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoard(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!board) {
    return {
      title: 'Dreamboard | Gifta',
      description: 'Chip in together for a dream gift.',
    };
  }

  return buildDreamBoardMetadata(board, { baseUrl, path: `/${board.slug}` });
}

export default async function DreamBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoard(slug);
  if (!board) {
    notFound();
  }

  const view = buildGuestViewModel(board);
  const contributorLimit = 6;
  const contributors = (await listRecentContributors(board.id, contributorLimit)).map((contributor) => ({
    name: contributor.contributorName,
    isAnonymous: contributor.isAnonymous,
  }));
  const hostAuth = await getHostAuth();
  const isHostViewingOwnBoard = hostAuth?.hostId === view.hostId;
  const birthdayLabel = formatBoardDate(board.birthdayDate ?? board.partyDate);
  const hasPartyOutput = hasBirthdayParty({
    birthdayDate: board.birthdayDate,
    partyDate: board.partyDate,
    partyDateTime: view.partyDateTime,
  });
  const partySummary = formatBirthdayPartyLine({
    birthdayDate: board.birthdayDate,
    partyDate: board.partyDate,
    partyDateTime: view.partyDateTime,
  });
  const partyDateTimeLine = partySummary ? `Birthday Party · ${partySummary}` : null;
  const ageLine = board.childAge
    ? `Turning ${board.childAge}${birthdayLabel ? ` on ${birthdayLabel}` : ''}`
    : birthdayLabel
      ? `Birthday celebration on ${birthdayLabel}`
      : 'Birthday celebration coming soon';
  const ctaDisabled = view.isExpired || view.isClosed;
  const ctaStateMessage = buildDreamboardCtaStateMessage({
    contributionCount: view.contributionCount,
    isFunded: view.isFunded,
    isExpired: view.isExpired,
    isClosed: view.isClosed,
    timeRemainingMessage: view.timeRemainingMessage,
  });

  return (
    <section className="w-full pb-10 pt-6 sm:pb-14 sm:pt-8">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <HeroStrip view={view} ageLine={ageLine} partyDateTimeLine={partyDateTimeLine} />
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-[1040px] grid-cols-1 gap-6 px-4 sm:px-6 min-[840px]:grid-cols-[minmax(0,1fr)_360px] min-[840px]:items-start">
        <div className="space-y-6">
          <GiftCard view={view} />
          {view.charityEnabled && view.charityName && view.charityAllocationLabel ? (
            <CharitableGivingCard
              charityName={view.charityName}
              charityDescription={view.charityDescription}
              charityLogoUrl={view.charityLogoUrl}
              allocationLabel={view.charityAllocationLabel}
            />
          ) : null}
        </div>

        <div className="space-y-6 min-[840px]:sticky min-[840px]:top-8">
          {isHostViewingOwnBoard ? (
            <ParentBanner boardId={board.id} />
          ) : (
            <DreamboardCtaCard
              slug={view.slug}
              childName={view.childName}
              stateMessage={ctaStateMessage}
              disabled={ctaDisabled}
            />
          )}
          <ContributorDisplay contributors={contributors} totalCount={view.contributionCount} />
          <DreamboardDetailsCard
            partyDateTimeLine={partyDateTimeLine}
            hasBirthdayParty={hasPartyOutput}
          />
        </div>
      </div>
    </section>
  );
}
