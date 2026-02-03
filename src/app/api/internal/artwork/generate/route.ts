import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { getInternalHostAuth } from '@/lib/auth/clerk-wrappers';
import { jsonInternalError } from '@/lib/api/internal-response';
import { generateGiftArtwork } from '@/lib/integrations/image-generation';
import { log } from '@/lib/observability/logger';

const requestSchema = z.object({
  description: z.string().min(10).max(500),
});

const enforceArtworkRateLimit = async (hostId: string) => {
  const key = `artwork:generate:${hostId}`;
  const rateLimit = await enforceRateLimit(key, { limit: 5, windowSeconds: 60 * 60 });
  if (!rateLimit.allowed) {
    return jsonInternalError({
      code: 'rate_limited',
      status: 429,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
  }
  return null;
};

export async function POST(request: NextRequest) {
  const session = await getInternalHostAuth();
  if (!session) {
    return jsonInternalError({ code: 'unauthorized', status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonInternalError({ code: 'invalid_request', status: 400 });
  }

  const rateLimitResponse = await enforceArtworkRateLimit(session.hostId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const result = await generateGiftArtwork(parsed.data.description.trim());
    return NextResponse.json({ imageUrl: result.imageUrl, prompt: result.prompt });
  } catch (error) {
    log('error', 'artwork.generate_failed', {
      hostId: session.hostId,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return jsonInternalError({ code: 'generation_failed', status: 500 });
  }
}
