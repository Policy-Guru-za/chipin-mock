import { notFound } from 'next/navigation';

import { ThankYouClient } from '@/app/(guest)/[slug]/thanks/ThankYouClient';
import { requestReceiptAction } from '@/app/(guest)/[slug]/thanks/actions';
import { getContributionByPaymentRef } from '@/lib/db/queries';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildThankYouViewModel } from '@/lib/dream-boards/view-model';
import { PAYMENT_PROVIDER } from '@/lib/payments';

type ThanksPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ ref?: string }>;
};

export default async function ThankYouPage({ params, searchParams }: ThanksPageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const board = await getCachedDreamBoardBySlug(slug);
  if (!board) {
    notFound();
  }

  const ref = searchParamsResolved?.ref;
  const contribution = ref ? await getContributionByPaymentRef(PAYMENT_PROVIDER, ref) : null;
  const view = buildThankYouViewModel({ board, contribution });

  return <ThankYouClient view={view} slug={slug} requestReceiptAction={requestReceiptAction} />;
}
