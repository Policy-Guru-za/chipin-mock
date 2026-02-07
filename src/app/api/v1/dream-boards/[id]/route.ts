import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { serializeDreamBoard } from '@/lib/api/dream-boards';
import { parseBody, withApiAuth, validatePublicId } from '@/lib/api/route-utils';
import { jsonError, jsonSuccess } from '@/lib/api/response';
import { db } from '@/lib/db';
import { getActiveCharityById, getDreamBoardByPublicId } from '@/lib/db/queries';
import { dreamBoards } from '@/lib/db/schema';
import { isBankAccountNumberValid, isPartyDateWithinRange } from '@/lib/dream-boards/validation';
import { LOCKED_CHARITY_SPLIT_MODES, LOCKED_PAYOUT_METHODS } from '@/lib/ux-v2/decision-locks';
import { resolveWritePathBlockReason } from '@/lib/ux-v2/write-path-gates';
import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';
import { encryptSensitiveValue } from '@/lib/utils/encryption';

import { verifyKarriCardForApi } from '../karri';

type DreamBoardStatus = (typeof dreamBoards.$inferSelect)['status'];
type UpdatePayload = z.infer<typeof updateSchema>;
type DreamBoardRecord = NonNullable<Awaited<ReturnType<typeof getDreamBoardByPublicId>>>;

const updateSchema = z
  .object({
    message: z.string().min(1).max(280).nullable().optional(),
    party_date: z.string().min(1).optional(),
    status: z
      .enum(['draft', 'active', 'funded', 'closed', 'paid_out', 'expired', 'cancelled'])
      .optional(),
    payout_method: z.enum(LOCKED_PAYOUT_METHODS).optional(),
    karri_card_number: z.string().regex(/^\d{16}$/, 'Must be 16 digits').optional(),
    karri_card_holder_name: z.string().min(2).max(100).optional(),
    bank_name: z.string().min(2).max(120).optional(),
    bank_account_number: z.string().min(6).max(20).optional(),
    bank_branch_code: z.string().min(2).max(20).optional(),
    bank_account_holder: z.string().min(2).max(120).optional(),
    charity_enabled: z.boolean().optional(),
    charity_id: z.string().uuid().optional(),
    charity_split_type: z.enum(LOCKED_CHARITY_SPLIT_MODES).optional(),
    charity_percentage_bps: z.number().int().min(500).max(5000).optional(),
    charity_threshold_cents: z.number().int().min(5000).optional(),
  })
  .superRefine((value, ctx) => {
    const hasAnyUpdate =
      value.message !== undefined ||
      value.party_date !== undefined ||
      value.status !== undefined ||
      value.payout_method !== undefined ||
      value.karri_card_number !== undefined ||
      value.karri_card_holder_name !== undefined ||
      value.bank_name !== undefined ||
      value.bank_account_number !== undefined ||
      value.bank_branch_code !== undefined ||
      value.bank_account_holder !== undefined ||
      value.charity_enabled !== undefined ||
      value.charity_id !== undefined ||
      value.charity_split_type !== undefined ||
      value.charity_percentage_bps !== undefined ||
      value.charity_threshold_cents !== undefined;

    if (!hasAnyUpdate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'No updates provided',
      });
      return;
    }

    const hasAnyBankField =
      value.bank_name !== undefined ||
      value.bank_account_number !== undefined ||
      value.bank_branch_code !== undefined ||
      value.bank_account_holder !== undefined;
    const hasAnyKarriField =
      value.karri_card_number !== undefined || value.karri_card_holder_name !== undefined;

    if (value.payout_method === 'karri_card') {
      if (value.karri_card_number === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karri_card_number'],
          message: 'Karri card number is required when payout_method=karri_card',
        });
      }
      if (value.karri_card_holder_name === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karri_card_holder_name'],
          message: 'Karri card holder name is required when payout_method=karri_card',
        });
      }
      if (hasAnyBankField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payout_method'],
          message: 'Bank fields require payout_method=bank',
        });
      }
    }

    if (value.payout_method === 'bank') {
      if (value.bank_name === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_name'],
          message: 'Bank name is required when payout_method=bank',
        });
      }
      if (value.bank_account_number === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_account_number'],
          message: 'Bank account number is required when payout_method=bank',
        });
      }
      if (value.bank_branch_code === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_branch_code'],
          message: 'Bank branch code is required when payout_method=bank',
        });
      }
      if (value.bank_account_holder === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_account_holder'],
          message: 'Bank account holder is required when payout_method=bank',
        });
      }
      if (hasAnyKarriField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payout_method'],
          message: 'Karri card fields require payout_method=karri_card',
        });
      }
    }

    if (value.payout_method === undefined && hasAnyBankField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['payout_method'],
        message: 'payout_method is required when bank fields are provided',
      });
    }

    if (value.payout_method === undefined && hasAnyKarriField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['payout_method'],
        message: 'payout_method is required when karri card fields are provided',
      });
    }

    const charityEnabled = value.charity_enabled === true;
    const hasAnyCharityField =
      value.charity_id !== undefined ||
      value.charity_split_type !== undefined ||
      value.charity_percentage_bps !== undefined ||
      value.charity_threshold_cents !== undefined;

    if (!charityEnabled && hasAnyCharityField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_enabled'],
        message: 'Charity fields require charity_enabled=true',
      });
      return;
    }

    if (!charityEnabled) {
      return;
    }

    if (!value.charity_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_id'],
        message: 'Charity is required when charity is enabled',
      });
    }

    if (!value.charity_split_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_split_type'],
        message: 'Charity split type is required when charity is enabled',
      });
      return;
    }

    if (value.charity_split_type === 'percentage' && value.charity_percentage_bps === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_percentage_bps'],
        message: 'Charity percentage bps is required for percentage split',
      });
    }

    if (value.charity_split_type === 'percentage' && value.charity_threshold_cents !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_threshold_cents'],
        message: 'Charity threshold cents must be omitted for percentage split',
      });
    }

    if (value.charity_split_type === 'threshold' && value.charity_threshold_cents === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_threshold_cents'],
        message: 'Charity threshold cents is required for threshold split',
      });
    }

    if (value.charity_split_type === 'threshold' && value.charity_percentage_bps !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charity_percentage_bps'],
        message: 'Charity percentage bps must be omitted for threshold split',
      });
    }
  });

const allowedStatusTransitions: Record<DreamBoardStatus, DreamBoardStatus[]> = {
  draft: ['active', 'cancelled'],
  active: ['cancelled', 'expired'],
  funded: ['cancelled', 'expired'],
  closed: [],
  paid_out: [],
  expired: [],
  cancelled: [],
};

const isImmutableStatus = (status: DreamBoardStatus) =>
  ['closed', 'paid_out', 'expired', 'cancelled'].includes(status);

const buildConflict = (message: string, requestId: string, headers: HeadersInit) =>
  jsonError({
    error: { code: 'conflict', message },
    status: 409,
    requestId,
    headers,
  });

const buildValidationError = (message: string, requestId: string, headers: HeadersInit) =>
  jsonError({
    error: { code: 'validation_error', message },
    status: 400,
    requestId,
    headers,
  });

const resolvePartyDateUpdate = (params: {
  value: string;
  currentPartyDate: Date | null;
  requestId: string;
  headers: HeadersInit;
}) => {
  if (!isPartyDateWithinRange(params.value)) {
    return {
      ok: false as const,
      response: buildValidationError(
        'Party date must be within the next 6 months',
        params.requestId,
        params.headers
      ),
    };
  }

  const partyDate = parseDateOnly(params.value);
  if (!partyDate) {
    return {
      ok: false as const,
      response: buildValidationError('Invalid party date', params.requestId, params.headers),
    };
  }

  if (params.currentPartyDate && partyDate.getTime() <= params.currentPartyDate.getTime()) {
    return {
      ok: false as const,
      response: buildConflict('Party date can only be extended', params.requestId, params.headers),
    };
  }

  return { ok: true as const, partyDate: formatDateOnly(partyDate) };
};

const resolveStatusUpdate = (params: {
  nextStatus: DreamBoardStatus | undefined;
  currentStatus: DreamBoardStatus;
  requestId: string;
  headers: HeadersInit;
}) => {
  if (!params.nextStatus || params.nextStatus === params.currentStatus) {
    return { ok: true as const, status: null };
  }

  if (params.nextStatus === 'closed') {
    return {
      ok: false as const,
      response: buildConflict(
        'Use the close endpoint to close a dream board',
        params.requestId,
        params.headers
      ),
    };
  }

  const allowed = allowedStatusTransitions[params.currentStatus] ?? [];
  if (!allowed.includes(params.nextStatus)) {
    return {
      ok: false as const,
      response: buildConflict('Status transition not allowed', params.requestId, params.headers),
    };
  }

  return { ok: true as const, status: params.nextStatus };
};

const buildUpdatePayload = (params: {
  data: UpdatePayload;
  board: DreamBoardRecord;
  requestId: string;
  headers: HeadersInit;
}) => {
  const updates: Partial<typeof dreamBoards.$inferInsert> = {};

  if (params.data.message !== undefined) {
    updates.message = params.data.message ?? null;
  }

  if (params.data.party_date) {
    const partyDateResult = resolvePartyDateUpdate({
      value: params.data.party_date,
      currentPartyDate: parseDateOnly(params.board.partyDate ?? undefined),
      requestId: params.requestId,
      headers: params.headers,
    });

    if (!partyDateResult.ok) {
      return { ok: false as const, response: partyDateResult.response };
    }

    updates.partyDate = partyDateResult.partyDate;
  }

  const statusResult = resolveStatusUpdate({
    nextStatus: params.data.status,
    currentStatus: params.board.status,
    requestId: params.requestId,
    headers: params.headers,
  });

  if (!statusResult.ok) {
    return { ok: false as const, response: statusResult.response };
  }

  if (statusResult.status) {
    updates.status = statusResult.status;
  }

  return { ok: true as const, updates };
};

const normalizeBankAccountNumber = (value: string) =>
  value.replace(/\s+/g, '').replace(/-/g, '');

export const GET = withApiAuth(
  'dreamboards:read',
  async (_request: NextRequest, context, params: { id: string }) => {
    const { requestId, rateLimitHeaders } = context;

    const idCheck = validatePublicId(params.id, {
      requestId,
      headers: rateLimitHeaders,
      message: 'Invalid dream board identifier',
    });
    if (!idCheck.ok) return idCheck.response;

    const board = await getDreamBoardByPublicId(params.id, context.apiKey.partnerId);
    if (!board) {
      return jsonError({
        error: { code: 'not_found', message: 'Dream board not found' },
        status: 404,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const payload = serializeDreamBoard(board, baseUrl);
    if (!payload) {
      return jsonError({
        error: { code: 'internal_error', message: 'Unable to serialize dream board' },
        status: 500,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    return jsonSuccess({ data: payload, requestId, headers: rateLimitHeaders });
  }
);

export const PATCH = withApiAuth(
  'dreamboards:write',
  async (request: NextRequest, context, params: { id: string }) => {
    const { requestId, rateLimitHeaders } = context;

    const idCheck = validatePublicId(params.id, {
      requestId,
      headers: rateLimitHeaders,
      message: 'Invalid dream board identifier',
    });
    if (!idCheck.ok) return idCheck.response;

    const parsed = await parseBody(request, updateSchema, {
      requestId,
      headers: rateLimitHeaders,
      message: 'Invalid dream board update payload',
    });
    if (!parsed.ok) return parsed.response;

    const hasAnyBankField =
      parsed.data.bank_name !== undefined ||
      parsed.data.bank_account_number !== undefined ||
      parsed.data.bank_branch_code !== undefined ||
      parsed.data.bank_account_holder !== undefined;
    const hasAnyCharityField =
      parsed.data.charity_id !== undefined ||
      parsed.data.charity_split_type !== undefined ||
      parsed.data.charity_percentage_bps !== undefined ||
      parsed.data.charity_threshold_cents !== undefined;

    if (parsed.data.charity_enabled === true && parsed.data.charity_id) {
      const charity = await getActiveCharityById(parsed.data.charity_id);
      if (!charity) {
        return jsonError({
          error: {
            code: 'validation_error',
            message: 'charity_id must reference an active charity',
          },
          status: 400,
          requestId,
          headers: rateLimitHeaders,
        });
      }
    }

    const blockReason = resolveWritePathBlockReason({
      bankRequested: parsed.data.payout_method === 'bank' || hasAnyBankField,
      charityRequested: parsed.data.charity_enabled !== undefined || hasAnyCharityField,
    });

    if (blockReason) {
      return jsonError({
        error: {
          code: 'unsupported_operation',
          message: blockReason,
        },
        status: 422,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    const board = await getDreamBoardByPublicId(params.id, context.apiKey.partnerId);
    if (!board) {
      return jsonError({
        error: { code: 'not_found', message: 'Dream board not found' },
        status: 404,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    if (isImmutableStatus(board.status)) {
      return buildConflict('Dream board can no longer be updated', requestId, rateLimitHeaders);
    }

    const updateResult = buildUpdatePayload({
      data: parsed.data,
      board,
      requestId,
      headers: rateLimitHeaders,
    });

    if (!updateResult.ok) {
      return updateResult.response;
    }

    const updates = updateResult.updates;

    if (parsed.data.payout_method === 'karri_card') {
      const karriVerification = await verifyKarriCardForApi({
        cardNumber: parsed.data.karri_card_number,
        requestId,
        headers: rateLimitHeaders,
      });
      if (!karriVerification.ok) {
        return karriVerification.response;
      }

      updates.payoutMethod = 'karri_card';
      updates.karriCardNumber = encryptSensitiveValue(karriVerification.cardNumber);
      updates.karriCardHolderName = parsed.data.karri_card_holder_name ?? null;
      updates.bankName = null;
      updates.bankAccountNumberEncrypted = null;
      updates.bankAccountLast4 = null;
      updates.bankBranchCode = null;
      updates.bankAccountHolder = null;
    }

    if (parsed.data.payout_method === 'bank') {
      const normalizedBankAccountNumber = normalizeBankAccountNumber(
        parsed.data.bank_account_number ?? ''
      );
      if (!isBankAccountNumberValid(normalizedBankAccountNumber)) {
        return jsonError({
          error: {
            code: 'validation_error',
            message: 'Bank account number must contain 6-20 digits',
          },
          status: 400,
          requestId,
          headers: rateLimitHeaders,
        });
      }

      updates.payoutMethod = 'bank';
      updates.karriCardNumber = null;
      updates.karriCardHolderName = null;
      updates.bankName = parsed.data.bank_name ?? null;
      updates.bankAccountNumberEncrypted = encryptSensitiveValue(normalizedBankAccountNumber);
      updates.bankAccountLast4 = normalizedBankAccountNumber.slice(-4);
      updates.bankBranchCode = parsed.data.bank_branch_code ?? null;
      updates.bankAccountHolder = parsed.data.bank_account_holder ?? null;
    }

    if (parsed.data.charity_enabled === true) {
      updates.charityEnabled = true;
      updates.charityId = parsed.data.charity_id ?? null;
      updates.charitySplitType = parsed.data.charity_split_type ?? null;
      updates.charityPercentageBps = parsed.data.charity_percentage_bps ?? null;
      updates.charityThresholdCents = parsed.data.charity_threshold_cents ?? null;
    }

    if (parsed.data.charity_enabled === false) {
      updates.charityEnabled = false;
      updates.charityId = null;
      updates.charitySplitType = null;
      updates.charityPercentageBps = null;
      updates.charityThresholdCents = null;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(dreamBoards)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(eq(dreamBoards.id, board.id), eq(dreamBoards.partnerId, context.apiKey.partnerId))
        );
    }

    const updated = await getDreamBoardByPublicId(params.id, context.apiKey.partnerId);
    if (!updated) {
      return jsonError({
        error: { code: 'internal_error', message: 'Unable to load updated dream board' },
        status: 500,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const payload = serializeDreamBoard(updated, baseUrl);
    if (!payload) {
      return jsonError({
        error: { code: 'internal_error', message: 'Unable to serialize dream board' },
        status: 500,
        requestId,
        headers: rateLimitHeaders,
      });
    }

    return jsonSuccess({ data: payload, requestId, headers: rateLimitHeaders });
  }
);
