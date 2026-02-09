import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { PaymentClient } from '@/app/(guest)/[slug]/contribute/payment/PaymentClient';
import { DreamBoardCard } from '@/components/dream-board/DreamBoardCard';
import { StateCard } from '@/components/ui/state-card';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildContributionViewModel } from '@/lib/dream-boards/view-model';
import { getAvailablePaymentProviders } from '@/lib/payments';
import { uiCopy } from '@/lib/ui/copy';

const getBoard = cache(async (slug: string) => getCachedDreamBoardBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoard(slug);

  if (!board) {
    return {
      title: 'Complete Payment | Gifta',
      description: 'Complete your contribution.',
    };
  }

  return {
    title: 'Complete Payment | Gifta',
    description: `Complete your contribution to ${board.childName}'s Dream Board`,
  };
}

export default async function ContributionPaymentPage({
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
  const availableProviders = getAvailablePaymentProviders();

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
      <PaymentClient
        slug={board.slug}
        dreamBoardId={board.id}
        childName={board.childName}
        availableProviders={availableProviders}
      />
    </section>
  );
}
