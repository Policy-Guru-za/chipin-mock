import { and, asc, eq, gt, isNull, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { db } from '@/lib/db';
import { contributionReminders, dreamBoards } from '@/lib/db/schema';
import { normalizeWhatsAppPhoneNumber } from '@/lib/integrations/whatsapp';
import { parseDateOnly } from '@/lib/utils/date';
import { getClientIp } from '@/lib/utils/request';

const requestSchema = z.object({
  dreamBoardId: z.string().uuid(),
  email: z.string().email(),
  remindInDays: z.number().int().min(1).max(14).default(3),
  whatsappPhoneE164: z.string().trim().min(8).max(20).optional(),
  whatsappOptIn: z.boolean().optional().default(false),
  whatsappWaId: z.string().trim().min(5).max(32).optional(),
}).superRefine((value, ctx) => {
  if (value.whatsappPhoneE164 && !value.whatsappOptIn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'whatsappOptIn must be true when whatsappPhoneE164 is provided',
      path: ['whatsappOptIn'],
    });
  }

  if (value.whatsappOptIn && !value.whatsappPhoneE164) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'whatsappPhoneE164 is required when whatsappOptIn is true',
      path: ['whatsappPhoneE164'],
    });
  }
});

type ReminderRequest = z.infer<typeof requestSchema>;

const parseRequest = async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return { response: jsonInternalError({ code: 'invalid_request', status: 400 }) };
  }
  return { data: parsed.data };
};

const enforceReminderRateLimit = async (
  ip: string | null | undefined,
  request: ReminderRequest
) => {
  const rateLimitKey = `contribution:reminder:${ip ?? 'unknown'}:${request.dreamBoardId}`;
  const rateLimit = await enforceRateLimit(rateLimitKey, { limit: 20, windowSeconds: 60 * 60 });
  if (!rateLimit.allowed) {
    return jsonInternalError({
      code: 'rate_limited',
      status: 429,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
  }
  return null;
};

const fetchDreamBoard = async (dreamBoardId: string) => {
  const [board] = await db
    .select({
      id: dreamBoards.id,
      status: dreamBoards.status,
      campaignEndDate: dreamBoards.campaignEndDate,
      partyDate: dreamBoards.partyDate,
    })
    .from(dreamBoards)
    .where(eq(dreamBoards.id, dreamBoardId))
    .limit(1);
  return board ?? null;
};

const toDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  return parseDateOnly(value);
};

const resolveReminderAt = (board: Awaited<ReturnType<typeof fetchDreamBoard>>, remindInDays: number) => {
  if (!board) return null;

  const closingDate = toDate(board.campaignEndDate ?? board.partyDate);
  if (!closingDate) {
    return null;
  }

  const now = new Date();
  const requestedReminderAt = new Date(now.getTime() + remindInDays * 24 * 60 * 60 * 1000);
  const closeOfDay = new Date(
    closingDate.getFullYear(),
    closingDate.getMonth(),
    closingDate.getDate(),
    23,
    59,
    59,
    999
  );
  const reminderAt = requestedReminderAt > closeOfDay ? closeOfDay : requestedReminderAt;

  if (reminderAt.getTime() <= now.getTime()) {
    return null;
  }

  return reminderAt;
};

const scheduleReminder = async (request: ReminderRequest, reminderAt: Date) => {
  const normalizedEmail = request.email.trim().toLowerCase();
  const normalizedWhatsApp = request.whatsappPhoneE164
    ? normalizeWhatsAppPhoneNumber(request.whatsappPhoneE164)
    : null;
  if (request.whatsappPhoneE164 && !normalizedWhatsApp) {
    throw new Error('invalid_whatsapp_number');
  }
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`contribution-reminder:${request.dreamBoardId}:${normalizedEmail}`})::bigint)`
    );

    const [existing] = await tx
      .select({ id: contributionReminders.id, remindAt: contributionReminders.remindAt })
      .from(contributionReminders)
      .where(
        and(
          eq(contributionReminders.dreamBoardId, request.dreamBoardId),
          eq(contributionReminders.email, normalizedEmail),
          isNull(contributionReminders.sentAt),
          gt(contributionReminders.remindAt, now)
        )
      )
      .orderBy(asc(contributionReminders.remindAt))
      .limit(1);

    if (existing) {
      if (request.whatsappOptIn && normalizedWhatsApp) {
        await tx
          .update(contributionReminders)
          .set({
            whatsappPhoneE164: normalizedWhatsApp,
            whatsappWaId: request.whatsappWaId ?? null,
            whatsappOptInAt: now,
            whatsappOptOutAt: null,
          })
          .where(eq(contributionReminders.id, existing.id));
      }
      return { created: false as const, remindAt: existing.remindAt };
    }

    const [inserted] = await tx
      .insert(contributionReminders)
      .values({
        dreamBoardId: request.dreamBoardId,
        email: normalizedEmail,
        remindAt: reminderAt,
        nextAttemptAt: reminderAt,
        whatsappPhoneE164: normalizedWhatsApp,
        whatsappWaId: request.whatsappWaId ?? null,
        whatsappOptInAt: request.whatsappOptIn && normalizedWhatsApp ? now : null,
      })
      .returning({ id: contributionReminders.id, remindAt: contributionReminders.remindAt });

    return { created: true as const, remindAt: inserted?.remindAt ?? reminderAt };
  });
};

export async function POST(request: NextRequest) {
  const parsed = await parseRequest(request);
  if ('response' in parsed) {
    return parsed.response;
  }

  const ip = getClientIp(request);
  const rateLimitResponse = await enforceReminderRateLimit(ip, parsed.data);
  if (rateLimitResponse) return rateLimitResponse;

  const board = await fetchDreamBoard(parsed.data.dreamBoardId);
  if (!board) {
    return jsonInternalError({ code: 'not_found', status: 404 });
  }

  if (board.status !== 'active' && board.status !== 'funded') {
    return jsonInternalError({ code: 'board_closed', status: 400 });
  }

  const reminderAt = resolveReminderAt(board, parsed.data.remindInDays);
  if (!reminderAt) {
    return jsonInternalError({
      code: 'invalid_reminder_window',
      status: 400,
      message: 'Reminder must be scheduled before the campaign closes.',
    });
  }

  let result: Awaited<ReturnType<typeof scheduleReminder>>;
  try {
    result = await scheduleReminder(parsed.data, reminderAt);
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid_whatsapp_number') {
      return jsonInternalError({
        code: 'invalid_request',
        status: 400,
        message: 'Invalid WhatsApp phone number format.',
      });
    }
    throw error;
  }

  if (!result.created) {
    return NextResponse.json(
      {
        ok: true,
        idempotent: true,
        remindAt: result.remindAt.toISOString(),
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      remindAt: result.remindAt.toISOString(),
    },
    { status: 201 }
  );
}
