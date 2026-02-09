import { redirect } from 'next/navigation';

import { toQueryString } from '../../_lib/query-string';

export default async function LegacyPayoutDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  redirect(`/admin/payouts/${id}${toQueryString(resolvedSearchParams)}`);
}
