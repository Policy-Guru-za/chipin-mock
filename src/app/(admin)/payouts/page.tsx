import { redirect } from 'next/navigation';

import { toQueryString } from '../_lib/query-string';

export default async function LegacyPayoutsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  redirect(`/admin/payouts${toQueryString(resolvedSearchParams)}`);
}
