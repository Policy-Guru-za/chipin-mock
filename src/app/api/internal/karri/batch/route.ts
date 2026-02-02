import { NextRequest, NextResponse } from 'next/server';

import { jsonInternalError } from '@/lib/api/internal-response';
import { processDailyKarriBatch } from '@/lib/integrations/karri-batch';
import { log } from '@/lib/observability/logger';

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.INTERNAL_JOB_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
};

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? undefined;

  if (!process.env.INTERNAL_JOB_SECRET) {
    log('error', 'karri.batch_missing_secret', undefined, requestId);
    return jsonInternalError({ code: 'misconfigured', status: 503 });
  }

  if (!isAuthorized(request)) {
    return jsonInternalError({ code: 'unauthorized', status: 401 });
  }

  if (process.env.KARRI_BATCH_ENABLED !== 'true') {
    return jsonInternalError({ code: 'disabled', status: 503 });
  }

  const result = await processDailyKarriBatch();
  return NextResponse.json(result);
}
