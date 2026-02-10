import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';
import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';
import { ProgressBar } from '@/components/dream-board/ProgressBar';
import { ReturnVisitBanner } from '@/components/dream-board/ReturnVisitBanner';
import { TimeRemaining } from '@/components/dream-board/TimeRemaining';
import { getHostAuth } from '@/lib/auth/clerk-wrappers';
import { listRecentContributors } from '@/lib/db/queries';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildDreamBoardMetadata } from '@/lib/dream-boards/metadata';
import { buildGuestViewModel, type GuestViewModel } from '@/lib/dream-boards/view-model';
import { extractIconIdFromPath, getGiftIconById } from '@/lib/icons/gift-icons';
import { parseDateOnly } from '@/lib/utils/date';
import { formatZar } from '@/lib/utils/money';

const getBoard = cache(async (slug: string) => getCachedDreamBoardBySlug(slug));

const formatBoardDate = (value?: string | null) => {
  const parsed = parseDateOnly(value ?? undefined);
  if (!parsed) return null;
  return parsed.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getChildInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

function HeaderSection({ view, ageLine }: { view: GuestViewModel; ageLine: string }) {
  return (
    <header className="rounded-3xl bg-gradient-to-b from-[#E4F0E8] to-[#D5E8DC] p-6 sm:p-8">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-white shadow-lifted">
          {view.childPhotoUrl ? (
            <Image
              src={view.childPhotoUrl}
              alt={`${view.childName}'s photo`}
              fill
              sizes="120px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#CFE4D6] text-3xl font-display text-gray-800">
              {getChildInitials(view.childName)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-600">
            {view.childName}&apos;s Dreamboard
          </p>
          <h1 className="font-display text-4xl text-gray-900 sm:text-5xl [overflow-wrap:anywhere]">{view.childName}</h1>
          <p className="font-primary text-base text-gray-600">{ageLine}</p>
        </div>
      </div>
    </header>
  );
}

function OneWishSection({ view }: { view: GuestViewModel }) {
  const description = view.giftSubtitle?.slice(0, 100) ?? '';
  const iconMeta = getGiftIconById(extractIconIdFromPath(view.giftImage ?? '') ?? '');
  const bgColor = iconMeta?.bgColor ?? '#F5F5F5';

  return (
    <section className="rounded-2xl bg-[#FDF8F3] p-5 shadow-soft sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C4956A]">
        ✨ {view.childName.toUpperCase()}&apos;S ONE BIG WISH
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative h-16 w-16 overflow-hidden rounded-xl sm:h-20 sm:w-20"
          style={{ backgroundColor: bgColor }}
        >
          <Image
            src={view.giftImage}
            alt={view.giftTitle}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-[20px] font-bold text-gray-900 [overflow-wrap:anywhere]">{view.giftTitle}</h2>
          <p className="text-sm text-gray-500 [overflow-wrap:anywhere]">{description}</p>
          <p className="text-sm font-semibold text-gray-700">Goal: {formatZar(view.goalCents)}</p>
        </div>
      </div>
    </section>
  );
}

function GoalProgressSection({ view }: { view: GuestViewModel }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-text-muted">
        Progress
      </h2>
      <ProgressBar value={view.raisedCents} max={view.goalCents} />
      <div className="mt-4 flex items-center justify-between text-sm text-text">
        <span>{view.percentage}% funded</span>
        <span>
          {formatZar(view.raisedCents)} of {formatZar(view.goalCents)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-text-muted">
        <span>{view.contributionCount} contributions</span>
        <span>{view.daysLeft} days left</span>
      </div>
      {view.message ? (
        <p className="mt-4 rounded-2xl bg-subtle px-4 py-3 text-sm text-text [overflow-wrap:anywhere]">“{view.message}”</p>
      ) : null}
      {view.isFunded ? (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-text">
          Goal reached! Extra contributions still help.
        </div>
      ) : null}
    </section>
  );
}

function ParentBanner({ boardId }: { boardId: string }) {
  return (
    <section className="rounded-2xl border border-[#E7D7C8] bg-[#FDF8F3] p-5">
      <p className="text-sm text-gray-800">👋 This is your Dreamboard. You&apos;re all set!</p>
      <Link
        href={`/dashboard/${boardId}`}
        className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-gray-800 hover:bg-white"
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
  const contributorLimit = Math.max(20, board.contributionCount);
  const contributors = (await listRecentContributors(board.id, contributorLimit)).map((contributor) => ({
    name: contributor.contributorName,
    isAnonymous: contributor.isAnonymous,
    avatarColorIndex: contributor.avatarColorIndex,
  }));
  const hostAuth = await getHostAuth();
  const isHostViewingOwnBoard = hostAuth?.hostId === view.hostId;
  const birthdayLabel = formatBoardDate(board.birthdayDate ?? board.partyDate);
  const ageLine = board.childAge
    ? `Turning ${board.childAge}${birthdayLabel ? ` on ${birthdayLabel}` : ''}`
    : birthdayLabel
      ? `Birthday celebration on ${birthdayLabel}`
      : 'Birthday celebration coming soon';

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="space-y-6">
        <HeaderSection view={view} ageLine={ageLine} />
        <OneWishSection view={view} />
        <GoalProgressSection view={view} />
        <TimeRemaining
          message={view.timeRemainingMessage}
          urgency={view.timeRemainingUrgency}
          daysLeft={view.daysLeft}
        />
        <ContributorDisplay contributors={contributors} totalCount={view.contributionCount} />
        {view.charityEnabled && view.charityName && view.charityAllocationLabel ? (
          <CharitableGivingCard
            charityName={view.charityName}
            charityDescription={view.charityDescription}
            charityLogoUrl={view.charityLogoUrl}
            allocationLabel={view.charityAllocationLabel}
          />
        ) : null}
        {isHostViewingOwnBoard ? (
          <ParentBanner boardId={board.id} />
        ) : (
          <ReturnVisitBanner
            slug={view.slug}
            childName={view.childName}
            href={`/${view.slug}/contribute?source=dream-board`}
            isExpired={view.isExpired || view.isClosed}
          />
        )}
      </section>

      <footer className="mt-8 flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <Link href="/" className="hover:text-text">
          Home
        </Link>
        <a href="mailto:support@gifta.co" className="hover:text-text">
          Need help?
        </a>
      </footer>
    </section>
  );
}
