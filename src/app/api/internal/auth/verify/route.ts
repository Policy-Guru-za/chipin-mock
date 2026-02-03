import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { createSession } from '@/lib/auth/session';
import { verifyMagicLink } from '@/lib/auth/magic-link';
import { ensureHostForEmail } from '@/lib/db/queries';

const tokenSchema = z.object({ token: z.string().min(32) });

export async function GET() {
  return jsonInternalError({
    code: 'method_not_allowed',
    status: 405,
    message: 'Use POST with a JSON body containing { token }.',
    headers: { Allow: 'POST' },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = tokenSchema.safeParse(body);

  if (!parsed.success) {
    return jsonInternalError({ code: 'invalid_request', status: 400 });
  }

  const email = await verifyMagicLink(parsed.data.token, { consume: true });
  if (!email) {
    return jsonInternalError({ code: 'invalid_token', status: 400 });
  }

  const host = await ensureHostForEmail(email);
  await createSession(host.id, host.email);

  return NextResponse.json({ ok: true });
}
