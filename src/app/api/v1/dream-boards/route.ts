import { NextRequest } from 'next/server';
import { z } from 'zod';

import { serializeDreamBoard } from '@/lib/api/dream-boards';
import { encodeCursor } from '@/lib/api/pagination';
import { parseBody, parseCursor, parseQuery, withApiAuth } from '@/lib/api/route-utils';
import { jsonError, jsonPaginated, jsonSuccess } from '@/lib/api/response';
import { listDreamBoardsForApi } from '@/lib/db/api-queries';
import { ensureHostForEmail } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { dreamBoards } from '@/lib/db/schema';
import {
  isBankAccountNumberValid,
  isPartyDateWithinRange,
  SA_MOBILE_REGEX,
} from '@/lib/dream-boards/validation';
import { encryptSensitiveValue } from '@/lib/utils/encryption';
import { generateSlug } from '@/lib/utils/slug';
import { parseDateOnly } from '@/lib/utils/date';

import { verifyKarriCardForApi } from './karri';

const listQuerySchema = z.object({
  status: z
    .enum(['draft', 'active', 'funded', 'closed', 'paid_out', 'expired', 'cancelled'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  after: z.string().optional(),
});

const createSchema = z
  .object({
    child_name: z.string().min(2).max(50),
    child_age: z.number().int().min(1).max(18).optional(),
    child_photo_url: z.string().url(),
    birthday_date: z.string().min(1).optional(),
    party_date: z.string().min(1),
    campaign_end_date: z.string().min(1).optional(),
    gift_name: z.string().min(2).max(200),
    gift_description: z.string().min(10).max(500).optional(),
    gift_image_url: z.string().url(),
    gift_image_prompt: z.string().min(1).optional(),
    goal_cents: z.number().int().min(2000),
    payout_method: z.enum(['karri_card', 'bank']).optional(),
    payout_email: z.string().email(),
    host_whatsapp_number: z
      .string()
      .regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    karri_card_number: z.string().regex(/^\d{16}$/, 'Must be 16 digits').optional(),
    karri_card_holder_name: z.string().min(2).max(100).optional(),
    bank_name: z.string().min(2).max(120).optional(),
    bank_account_number: z.string().min(6).max(20).optional(),
    bank_branch_code: z.string().min(2).max(20).optional(),
    bank_account_holder: z.string().min(2).max(120).optional(),
    charity_enabled: z.boolean().optional(),
    charity_id: z.string().uuid().optional(),
    charity_split_type: z.enum(['percentage', 'threshold']).optional(),
    charity_percentage_bps: z.number().int().min(500).max(5000).optional(),
    charity_threshold_cents: z.number().int().min(5000).optional(),
    message: z.string().max(280).optional(),
  })
  .superRefine((value, ctx) => {
    ensureDateRanges(value, ctx);
    const payoutMethod = value.payout_method ?? 'karri_card';

    if (payoutMethod === 'karri_card') {
      if (!value.karri_card_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karri_card_number'],
          message: 'Karri card number is required',
        });
      }
      if (!value.karri_card_holder_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['karri_card_holder_name'],
          message: 'Karri card holder name is required',
        });
      }
    }

    if (payoutMethod === 'bank') {
      if (!value.bank_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_name'],
          message: 'Bank name is required',
        });
      }
      if (!value.bank_account_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_account_number'],
          message: 'Bank account number is required',
        });
      }
      if (!value.bank_branch_code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_branch_code'],
          message: 'Bank branch code is required',
        });
      }
      if (!value.bank_account_holder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bank_account_holder'],
          message: 'Bank account holder is required',
        });
      }
    }

    const charityEnabled = value.charity_enabled === true;
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

type CreatePayload = z.infer<typeof createSchema>;
const ensureDateRanges = (value: CreatePayload, ctx: z.RefinementCtx) => {
  if (!isPartyDateWithinRange(value.party_date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['party_date'],
      message: 'Party date must be within the next 6 months',
    });
  }

  const birthdayDate = value.birthday_date ? parseDateOnly(value.birthday_date) : null;
  const partyDate = parseDateOnly(value.party_date);
  const campaignEndDate = parseDateOnly(value.campaign_end_date ?? value.party_date);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (value.birthday_date && !birthdayDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['birthday_date'],
      message: 'Birthday date is invalid',
    });
  }

  if (birthdayDate && birthdayDate <= todayDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['birthday_date'],
      message: 'Birthday date must be in the future',
    });
  }

  if (birthdayDate && partyDate && partyDate < birthdayDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['party_date'],
      message: 'Party date must be on or after birthday date',
    });
  }

  if (!campaignEndDate || campaignEndDate <= todayDate || (partyDate && campaignEndDate > partyDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['campaign_end_date'],
      message: 'Campaign end date must be in the future and on/before party date',
    });
  }
};

const parseCreatePayload = async (request: NextRequest, requestId: string, headers: Headers) => {
  return parseBody(request, createSchema, {
    requestId,
    headers,
    message: 'Invalid dream board payload',
  });
};

const insertDreamBoard = async (params: {
  payload: CreatePayload;
  hostId: string;
  payoutMethod: 'karri_card' | 'bank';
  karriCardNumberEncrypted?: string | null;
  bankAccountNumberEncrypted?: string | null;
  bankAccountLast4?: string | null;
  partnerId: string;
}) => {
  let created: null | { id: string; slug: string; createdAt: Date; updatedAt: Date } = null;
  for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
    const slug = generateSlug(params.payload.child_name);
    const [result] = await db
      .insert(dreamBoards)
      .values({
        partnerId: params.partnerId,
        hostId: params.hostId,
        slug,
        childName: params.payload.child_name,
        childPhotoUrl: params.payload.child_photo_url,
        partyDate: params.payload.party_date,
        childAge: params.payload.child_age ?? null,
        birthdayDate: params.payload.birthday_date ?? null,
        campaignEndDate: params.payload.campaign_end_date ?? params.payload.party_date,
        giftName: params.payload.gift_name,
        giftDescription: params.payload.gift_description ?? null,
        giftImageUrl: params.payload.gift_image_url,
        giftImagePrompt: params.payload.gift_image_prompt ?? null,
        goalCents: params.payload.goal_cents,
        payoutMethod: params.payoutMethod,
        karriCardNumber: params.payoutMethod === 'karri_card' ? params.karriCardNumberEncrypted : null,
        karriCardHolderName:
          params.payoutMethod === 'karri_card' ? (params.payload.karri_card_holder_name ?? null) : null,
        bankName: params.payoutMethod === 'bank' ? (params.payload.bank_name ?? null) : null,
        bankAccountNumberEncrypted:
          params.payoutMethod === 'bank' ? (params.bankAccountNumberEncrypted ?? null) : null,
        bankAccountLast4: params.payoutMethod === 'bank' ? (params.bankAccountLast4 ?? null) : null,
        bankBranchCode:
          params.payoutMethod === 'bank' ? (params.payload.bank_branch_code ?? null) : null,
        bankAccountHolder:
          params.payoutMethod === 'bank' ? (params.payload.bank_account_holder ?? null) : null,
        charityEnabled: params.payload.charity_enabled === true,
        charityId: params.payload.charity_enabled === true ? (params.payload.charity_id ?? null) : null,
        charitySplitType:
          params.payload.charity_enabled === true ? (params.payload.charity_split_type ?? null) : null,
        charityPercentageBps:
          params.payload.charity_enabled === true ? (params.payload.charity_percentage_bps ?? null) : null,
        charityThresholdCents:
          params.payload.charity_enabled === true ? (params.payload.charity_threshold_cents ?? null) : null,
        hostWhatsAppNumber: params.payload.host_whatsapp_number,
        message: params.payload.message ?? null,
        status: 'active',
        payoutEmail: params.payload.payout_email,
      })
      .onConflictDoNothing({ target: dreamBoards.slug })
      .returning({
        id: dreamBoards.id,
        slug: dreamBoards.slug,
        createdAt: dreamBoards.createdAt,
        updatedAt: dreamBoards.updatedAt,
      });

    if (result) {
      created = result;
    }
  }

  return created;
};

export const GET = withApiAuth('dreamboards:read', async (request: NextRequest, context) => {
  const { requestId, rateLimitHeaders } = context;

  const parsed = parseQuery(request, listQuerySchema, {
    requestId,
    headers: rateLimitHeaders,
    message: 'Invalid query parameters',
  });
  if (!parsed.ok) return parsed.response;

  const cursorResult = parseCursor(parsed.data.after, {
    requestId,
    headers: rateLimitHeaders,
  });
  if (!cursorResult.ok) return cursorResult.response;

  const limit = parsed.data.limit ?? 20;
  const rows = await listDreamBoardsForApi({
    partnerId: context.apiKey.partnerId,
    status: parsed.data.status,
    limit: limit + 1,
    cursor: cursorResult.cursor,
  });

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const serialized = items
    .map((board) => serializeDreamBoard(board, baseUrl))
    .filter((board): board is NonNullable<ReturnType<typeof serializeDreamBoard>> =>
      Boolean(board)
    );

  if (serialized.length !== items.length) {
    return jsonError({
      error: { code: 'internal_error', message: 'Unable to serialize dream board list' },
      status: 500,
      requestId,
      headers: rateLimitHeaders,
    });
  }

  const nextCursor =
    hasMore && items.length
      ? encodeCursor({
          createdAt: items[items.length - 1].createdAt,
          id: items[items.length - 1].id,
        })
      : null;

  return jsonPaginated({
    data: serialized,
    pagination: { has_more: hasMore, next_cursor: nextCursor },
    requestId,
    headers: rateLimitHeaders,
  });
});

export const POST = withApiAuth('dreamboards:write', async (request: NextRequest, context) => {
  const { requestId, rateLimitHeaders } = context;
  const parsed = await parseCreatePayload(request, requestId, rateLimitHeaders);
  if (!parsed.ok) return parsed.response;

  const payoutMethod = parsed.data.payout_method ?? 'karri_card';
  let karriCardNumberEncrypted: string | null = null;
  let bankAccountNumberEncrypted: string | null = null;
  let bankAccountLast4: string | null = null;

  if (payoutMethod === 'karri_card') {
    const karriVerification = await verifyKarriCardForApi({
      cardNumber: parsed.data.karri_card_number,
      requestId,
      headers: rateLimitHeaders,
    });

    if (!karriVerification.ok) {
      return karriVerification.response;
    }
    karriCardNumberEncrypted = encryptSensitiveValue(karriVerification.cardNumber);
  } else {
    const bankAccountNumber = (parsed.data.bank_account_number ?? '').replace(/\D+/g, '');
    if (!isBankAccountNumberValid(bankAccountNumber)) {
      return jsonError({
        error: { code: 'validation_error', message: 'Bank account number is invalid' },
        status: 400,
        requestId,
        headers: rateLimitHeaders,
      });
    }
    bankAccountNumberEncrypted = encryptSensitiveValue(bankAccountNumber);
    bankAccountLast4 = bankAccountNumber.slice(-4);
  }

  const host = await ensureHostForEmail(parsed.data.payout_email);

  const created = await insertDreamBoard({
    payload: parsed.data,
    hostId: host.id,
    payoutMethod,
    karriCardNumberEncrypted,
    bankAccountNumberEncrypted,
    bankAccountLast4,
    partnerId: context.apiKey.partnerId,
  });

  if (!created) {
    return jsonError({
      error: { code: 'conflict', message: 'Unable to generate a unique slug' },
      status: 409,
      requestId,
      headers: rateLimitHeaders,
    });
  }

  const responsePayload = serializeDreamBoard(
    {
      id: created.id,
      slug: created.slug,
      childName: parsed.data.child_name,
      childPhotoUrl: parsed.data.child_photo_url,
      partyDate: parsed.data.party_date,
      giftName: parsed.data.gift_name,
      giftImageUrl: parsed.data.gift_image_url,
      giftImagePrompt: parsed.data.gift_image_prompt ?? null,
      payoutMethod,
      goalCents: parsed.data.goal_cents,
      raisedCents: 0,
      message: parsed.data.message ?? null,
      status: 'active',
      contributionCount: 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    },
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  );

  if (!responsePayload) {
    return jsonError({
      error: { code: 'internal_error', message: 'Unable to serialize dream board' },
      status: 500,
      requestId,
      headers: rateLimitHeaders,
    });
  }

  return jsonSuccess({
    data: responsePayload,
    requestId,
    status: 201,
    headers: rateLimitHeaders,
  });
});
