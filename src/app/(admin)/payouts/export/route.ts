import { NextRequest, NextResponse } from 'next/server';

import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

export async function GET(request: NextRequest) {
  await requireAdminAuth();

  const query = request.nextUrl.searchParams.toString();
  const suffix = query ? `?${query}` : '';
  return NextResponse.redirect(new URL(`/admin/payouts/export${suffix}`, request.url));
}
