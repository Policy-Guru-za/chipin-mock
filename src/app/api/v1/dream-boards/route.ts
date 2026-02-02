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
import { isPartyDateWithinRange, SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';
import { encryptSensitiveValue } from '@/lib/utils/encryption';
import { generateSlug } from '@/lib/utils/slug';

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
    child_photo_url: z.string().url(),
    party_date: z.string().min(1),
    gift_name: z.string().min(2).max(200),
    gift_image_url: z.string().url(),
    gift_image_prompt: z.string().min(1).optional(),
    goal_cents: z.number().int().min(2000),
    payout_email: z.string().email(),
    host_whatsapp_number: z
      .string()
      .regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    karri_card_number: z.string().regex(/^\d{16}$/, 'Must be 16 digits'),
    karri_card_holder_name: z.string().min(2).max(100),
    message: z.string().max(280).optional(),
  })
  .superRefine((value, ctx) => {
    ensureDateRanges(value, ctx);
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
  karriCardNumber: string;
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
        giftName: params.payload.gift_name,
        giftImageUrl: params.payload.gift_image_url,
        giftImagePrompt: params.payload.gift_image_prompt ?? null,
        goalCents: params.payload.goal_cents,
        payoutMethod: 'karri_card',
        karriCardNumber: params.karriCardNumber,
        karriCardHolderName: params.payload.karri_card_holder_name,
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

  const karriVerification = await verifyKarriCardForApi({
    cardNumber: parsed.data.karri_card_number,
    requestId,
    headers: rateLimitHeaders,
  });

  if (!karriVerification.ok) {
    return karriVerification.response;
  }

  const host = await ensureHostForEmail(parsed.data.payout_email);
  const karriCardNumber = encryptSensitiveValue(karriVerification.cardNumber);

  const created = await insertDreamBoard({
    payload: parsed.data,
    hostId: host.id,
    karriCardNumber,
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
      payoutMethod: 'karri_card',
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
