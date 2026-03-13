import { jsonError } from '@/lib/api/response';
import { verifyKarriCard } from '@/lib/integrations/karri';
import { log } from '@/lib/observability/logger';
import {
  isKarriAutomationEnabled,
  isKarriWritePathEnabled,
} from '@/lib/ux-v2/write-path-gates';

const normalizeCardNumber = (value?: string | null) =>
  value ? value.replace(/\s+/g, '').replace(/-/g, '') : null;

export const verifyKarriCardForApi = async (params: {
  cardNumber?: string | null;
  requestId: string;
  headers: Headers;
}) => {
  if (!isKarriWritePathEnabled()) {
    return {
      ok: false as const,
      response: jsonError({
        error: { code: 'unsupported_operation', message: 'Karri payout method is not enabled' },
        status: 422,
        requestId: params.requestId,
        headers: params.headers,
      }),
    };
  }

  const normalizedCardNumber = normalizeCardNumber(params.cardNumber);
  if (!normalizedCardNumber) {
    return {
      ok: false as const,
      response: jsonError({
        error: { code: 'validation_error', message: 'Karri card number is required' },
        status: 400,
        requestId: params.requestId,
        headers: params.headers,
      }),
    };
  }

  if (!isKarriAutomationEnabled()) {
    return { ok: true as const, cardNumber: normalizedCardNumber };
  }

  try {
    const verification = await verifyKarriCard(normalizedCardNumber);
    if (!verification.valid) {
      return {
        ok: false as const,
        response: jsonError({
          error: { code: 'validation_error', message: 'Karri card number could not be verified' },
          status: 400,
          requestId: params.requestId,
          headers: params.headers,
        }),
      };
    }
  } catch (error) {
    log('error', 'karri_card_verify_failed', {
      requestId: params.requestId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return {
      ok: false as const,
      response: jsonError({
        error: { code: 'internal_error', message: 'Karri verification is unavailable' },
        status: 502,
        requestId: params.requestId,
        headers: params.headers,
      }),
    };
  }

  return { ok: true as const, cardNumber: normalizedCardNumber };
};
