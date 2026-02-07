import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { isMockPayments } from '@/lib/config/feature-flags';
import { completeContributionWithResolvedCharity } from '@/lib/charities/allocation';
import { db } from '@/lib/db';
import { contributions } from '@/lib/db/schema';
import { markDreamBoardFundedIfNeeded } from '@/lib/db/queries';
import { invalidateDreamBoardCacheById } from '@/lib/dream-boards/cache';

const requestSchema = z.object({
  contributionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  if (!isMockPayments()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const [contribution] = await db
    .select({
      id: contributions.id,
      dreamBoardId: contributions.dreamBoardId,
      paymentStatus: contributions.paymentStatus,
    })
    .from(contributions)
    .where(eq(contributions.id, parsed.data.contributionId))
    .limit(1);

  if (!contribution) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (contribution.paymentStatus !== 'completed') {
    await completeContributionWithResolvedCharity(contribution.id);
    await invalidateDreamBoardCacheById(contribution.dreamBoardId);
    await markDreamBoardFundedIfNeeded(contribution.dreamBoardId);
  }

  return NextResponse.json({ ok: true, mocked: true });
}
