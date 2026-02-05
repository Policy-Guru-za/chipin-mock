import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { jsonInternalError } from '@/lib/api/internal-response';
import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { db } from '@/lib/db';
import { contributionReminders, dreamBoards } from '@/lib/db/schema';
import { parseDateOnly } from '@/lib/utils/date';
import { getClientIp } from '@/lib/utils/request';

const requestSchema = z.object({
  dreamBoardId: z.string().uuid(),
  email: z.string().email(),
  remindInDays: z.number().int().min(1).max(14).default(3),
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
  await db
    .insert(contributionReminders)
    .values({
      dreamBoardId: request.dreamBoardId,
      email: request.email.trim().toLowerCase(),
      remindAt: reminderAt,
    })
    .onConflictDoNothing({
      target: [
        contributionReminders.dreamBoardId,
        contributionReminders.email,
        contributionReminders.remindAt,
      ],
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

  await scheduleReminder(parsed.data, reminderAt);

  return NextResponse.json(
    {
      ok: true,
      remindAt: reminderAt.toISOString(),
    },
    { status: 201 }
  );
}
