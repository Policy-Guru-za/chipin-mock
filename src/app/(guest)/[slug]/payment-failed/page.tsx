import { redirect } from 'next/navigation';

type PaymentFailedPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PaymentFailedPage({ params }: PaymentFailedPageProps) {
  const { slug } = await params;
  redirect(`/${slug}/contribute`);
}
