import { NextRequest, NextResponse } from 'next/server';

import { createSession } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/demo';
import { ensureHostForEmail } from '@/lib/db/queries';

const DEMO_EMAIL = 'sarah@demo.chipin.co.za';

export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const host = await ensureHostForEmail(DEMO_EMAIL);
  await createSession(host.id, host.email);

  return NextResponse.redirect(new URL('/create/child', request.url));
}
