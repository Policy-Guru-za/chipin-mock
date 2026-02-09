import { notFound } from 'next/navigation';

import { ThankYouClient } from '@/app/(guest)/[slug]/thanks/ThankYouClient';
import { requestReceiptAction } from '@/app/(guest)/[slug]/thanks/actions';
import { getContributionByPaymentRef } from '@/lib/db/queries';
import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { buildThankYouViewModel } from '@/lib/dream-boards/view-model';
import type { PaymentProvider } from '@/lib/payments';

type ThanksPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ ref?: string; provider?: PaymentProvider }>;
};

export default async function ThankYouPage({ params, searchParams }: ThanksPageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const board = await getCachedDreamBoardBySlug(slug);
  if (!board) {
    notFound();
  }

  const ref = searchParamsResolved?.ref;
  const providerParam = searchParamsResolved?.provider;
  const provider: PaymentProvider =
    providerParam && ['payfast', 'ozow', 'snapscan'].includes(providerParam)
      ? providerParam
      : 'payfast';
  const contribution = ref ? await getContributionByPaymentRef(provider, ref) : null;
  const view = buildThankYouViewModel({ board, contribution });

  return <ThankYouClient view={view} slug={slug} requestReceiptAction={requestReceiptAction} />;
}
