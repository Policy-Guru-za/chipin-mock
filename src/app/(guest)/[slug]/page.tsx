import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';
import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';
import { DreamboardStatusBadge } from '@/components/dream-board/DreamboardStatusBadge';
import { getHostAuth } from '@/lib/auth/clerk-wrappers';
import { listRecentContributors } from '@/lib/db/queries';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildDreamBoardMetadata } from '@/lib/dream-boards/metadata';
import { formatPartyDateTime } from '@/lib/dream-boards/party-date-time';
import { buildGuestViewModel, type GuestViewModel } from '@/lib/dream-boards/view-model';
import { extractIconIdFromPath, getGiftIconById } from '@/lib/icons/gift-icons';
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

const getChildInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

function HeaderSection({
  view,
  ageLine,
  partyDateTimeLine,
}: {
  view: GuestViewModel;
  ageLine: string;
  partyDateTimeLine: string | null;
}) {
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
          {partyDateTimeLine ? (
            <p className="font-primary text-base text-gray-600">{partyDateTimeLine}</p>
          ) : null}
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
        </div>
      </div>
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

function GuestContributionBanner({
  slug,
  childName,
  disabled,
}: {
  slug: string;
  childName: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5 text-center">
        <p className="text-sm text-text-muted">This Dreamboard is closed to new contributions.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 text-center">
      <Link
        href={`/${slug}/contribute?source=dream-board`}
        className="inline-flex min-h-11 items-center rounded-lg border-2 border-primary-700 px-4 text-sm font-semibold text-text hover:bg-[#F0F7F4]"
      >
        Chip in for {childName} 💝
      </Link>
      <p className="mt-3 text-xs text-text-muted">Secure payments powered by PayFast.</p>
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
  const formattedPartyDateTime = formatPartyDateTime(view.partyDateTime);
  const partyDateTimeLine = formattedPartyDateTime
    ? `Birthday Party · ${formattedPartyDateTime}`
    : null;
  const ageLine = board.childAge
    ? `Turning ${board.childAge}${birthdayLabel ? ` on ${birthdayLabel}` : ''}`
    : birthdayLabel
      ? `Birthday celebration on ${birthdayLabel}`
      : 'Birthday celebration coming soon';

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="space-y-6">
        <HeaderSection view={view} ageLine={ageLine} partyDateTimeLine={partyDateTimeLine} />
        <OneWishSection view={view} />
        <DreamboardStatusBadge
          contributionCount={view.contributionCount}
          isActive={view.isActive}
          isClosed={view.isClosed}
          isExpired={view.isExpired}
          timeRemainingMessage={view.timeRemainingMessage}
          timeRemainingUrgency={view.timeRemainingUrgency}
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
          <GuestContributionBanner
            slug={view.slug}
            childName={view.childName}
            disabled={view.isExpired || view.isClosed}
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
