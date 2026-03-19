import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { ContributeDetailsClient } from '@/app/(guest)/[slug]/contribute/ContributeDetailsClient';
import { DreamBoardCard } from '@/components/dream-board/DreamBoardCard';
import { StateCard } from '@/components/ui/state-card';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildDreamBoardMetadata } from '@/lib/dream-boards/metadata';
import { buildContributionViewModel } from '@/lib/dream-boards/view-model';
import { uiCopy } from '@/lib/ui/copy';
import { resolveRuntimeBaseUrl } from '@/lib/utils/request';

const getBoard = cache(async (slug: string) => getCachedDreamBoardBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoard(slug);
  const baseUrl = resolveRuntimeBaseUrl({ headers: await headers() });

  if (!board) {
    return {
      title: 'Stitch Coming Soon | Gifta',
      description: 'Stitch-powered contributions are coming soon to Gifta.',
    };
  }

  return buildDreamBoardMetadata(board, { baseUrl, path: `/${board.slug}/contribute` });
}

export default async function ContributionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoard(slug);
  if (!board) {
    notFound();
  }

  const view = buildContributionViewModel(board);

  if (view.isClosed || view.isExpired) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <DreamBoardCard
          imageUrl={view.displayImage}
          title={view.displayTitle}
          subtitle={view.displaySubtitle}
          imagePriority
        />
        <StateCard
          variant="closed"
          body={uiCopy.guest.closed.body}
          ctaLabel={uiCopy.guest.closed.ctaLabel}
          ctaHref={`/${board.slug}`}
          ctaVariant="outline"
          className="text-center"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <DreamBoardCard
        imageUrl={view.displayImage}
        title={view.displayTitle}
        subtitle={view.displaySubtitle}
        imagePriority
      />
      <ContributeDetailsClient slug={board.slug} childName={board.childName} />
    </section>
  );
}
