import { redirect } from 'next/navigation';

export default async function ContributionPaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/contribute`);
}
