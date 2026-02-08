import { notFound } from 'next/navigation';

import { PaymentFailedClient } from '@/app/(guest)/[slug]/payment-failed/PaymentFailedClient';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { getFailureDisplay } from '@/lib/payments/failure-display';

type PaymentFailedPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ reason?: string }>;
};

export default async function PaymentFailedPage({ params, searchParams }: PaymentFailedPageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const board = await getCachedDreamBoardBySlug(slug);
  if (!board) {
    notFound();
  }

  const display = getFailureDisplay(searchParamsResolved?.reason);
  const isClosed = board.status !== 'active' && board.status !== 'funded';

  return (
    <PaymentFailedClient slug={board.slug} childName={board.childName} display={display} isClosed={isClosed} />
  );
}
