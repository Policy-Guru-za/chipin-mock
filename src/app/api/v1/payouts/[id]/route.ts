import { NextRequest } from 'next/server';

import { validateUuid, withApiAuth } from '@/lib/api/route-utils';
import { jsonError, jsonSuccess } from '@/lib/api/response';
import { serializePublicPayout } from '@/lib/api/payouts';
import { getPayoutForApi } from '@/lib/db/api-queries';

export const GET = withApiAuth(
  'payouts:read',
  async (_request: NextRequest, context, params: { id: string }) => {
    const { requestId, rateLimitHeaders } = context;

    const idCheck = validateUuid(params.id, {
      requestId,
      headers: rateLimitHeaders,
      message: 'Invalid payout identifier',
    });
    if (!idCheck.ok) return idCheck.response;

    const payout = await getPayoutForApi({ id: params.id, partnerId: context.apiKey.partnerId });
    if (!payout) {
      return jsonError({
        error: { code: 'not_found', message: 'Payout not found' },
        status: 404,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    const serialized = serializePublicPayout(payout);
    if (!serialized) {
      return jsonError({
        error: { code: 'not_found', message: 'Payout not found' },
        status: 404,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    return jsonSuccess({ data: serialized, requestId, headers: rateLimitHeaders });
  }
);
