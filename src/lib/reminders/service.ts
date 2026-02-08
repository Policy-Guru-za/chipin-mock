import { and, asc, eq, isNull, lte, sql } from 'drizzle-orm';

import { isWhatsAppReminderDispatchEnabled } from '@/lib/config/feature-flags';
import { db } from '@/lib/db';
import { contributionReminders, dreamBoards } from '@/lib/db/schema';
import type { EmailPayload } from '@/lib/integrations/email';
import { sendEmail } from '@/lib/integrations/email';
import { sendWhatsAppTemplateMessage } from '@/lib/integrations/whatsapp';
import { log } from '@/lib/observability/logger';
import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';
import {
  buildReminderEmailPayload,
  buildReminderWhatsAppTemplatePayload,
  ReminderTemplateValidationError,
  type ReminderWhatsAppTemplatePayload,
} from '@/lib/reminders/templates';

const RETRY_WINDOW_HOURS = 48;
const RETRY_WINDOW_MS = RETRY_WINDOW_HOURS * 60 * 60 * 1000;
const DEFAULT_BATCH_LIMIT = 100;
const RETRY_BASE_DELAY_MS = 5 * 60 * 1000;
const RETRY_MAX_DELAY_MS = 6 * 60 * 60 * 1000;

type DueReminderId = {
  id: string;
};

type DueReminderRecord = {
  id: string;
  dreamBoardId: string;
  email: string;
  remindAt: Date;
  childName: string;
  giftName: string;
  slug: string;
  campaignEndDate: Date | string | null;
  partyDate: Date | string | null;
  status: string;
  attemptCount: number;
  emailSentAt: Date | null;
  whatsappPhoneE164: string | null;
  whatsappWaId: string | null;
  whatsappOptInAt: Date | null;
  whatsappOptOutAt: Date | null;
  whatsappSentAt: Date | null;
  whatsappMessageId: string | null;
};

export type ReminderDispatchSummary = {
  scanned: number;
  sent: number;
  failed: number;
  expired: number;
  skipped: number;
};

type ReminderDispatchOutcome =
  | 'sent'
  | 'retryable_failure'
  | 'expired'
  | 'skipped'
  | 'terminal_failure';

type ReminderDispatcher = {
  sendEmail: (payload: EmailPayload, options?: { idempotencyKey?: string }) => Promise<unknown>;
  sendWhatsAppTemplate?: (params: {
    reminderId: string;
    phoneNumber: string;
    payload: ReminderWhatsAppTemplatePayload;
  }) => Promise<{ messageId: string | null; skipped: boolean }>;
};

const defaultDispatcher: ReminderDispatcher = {
  sendEmail,
  sendWhatsAppTemplate: async (params) =>
    sendWhatsAppTemplateMessage({
      phoneNumber: params.phoneNumber,
      template: params.payload.template,
      bodyParams: params.payload.bodyParams,
      languageCode: params.payload.languageCode,
    }),
};

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const shouldExpireReminder = (remindAt: Date, now: Date) =>
  now.getTime() - remindAt.getTime() > RETRY_WINDOW_MS;

const resolveRetryDelayMs = (attemptCount: number) => {
  const nextAttempt = Math.max(attemptCount + 1, 1);
  const multiplier = 2 ** Math.max(nextAttempt - 1, 0);
  return Math.min(RETRY_BASE_DELAY_MS * multiplier, RETRY_MAX_DELAY_MS);
};

const resolveCampaignCloseDate = (record: DueReminderRecord): string => {
  const closeDate = parseDateOnly(record.campaignEndDate ?? record.partyDate);
  if (!closeDate) {
    throw new ReminderTemplateValidationError(['campaign_close_date']);
  }
  return formatDateOnly(closeDate);
};

const buildReminderUrl = (slug: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${ensureTrailingSlash(baseUrl)}${slug}`;
};

const fetchDueReminderIds = async (now: Date, limit: number): Promise<DueReminderId[]> =>
  db
    .select({ id: contributionReminders.id })
    .from(contributionReminders)
    .where(
      and(
        lte(contributionReminders.remindAt, now),
        lte(contributionReminders.nextAttemptAt, now),
        isNull(contributionReminders.sentAt)
      )
    )
    .orderBy(asc(contributionReminders.nextAttemptAt), asc(contributionReminders.remindAt))
    .limit(limit);

const applyOutcome = (summary: ReminderDispatchSummary, outcome: ReminderDispatchOutcome) => {
  if (outcome === 'sent') {
    summary.sent += 1;
    return;
  }

  if (outcome === 'expired') {
    summary.expired += 1;
    return;
  }

  if (outcome === 'skipped') {
    summary.skipped += 1;
    return;
  }

  summary.failed += 1;
};

const loadDueReminder = async (
  reminderId: string,
  now: Date,
  reader: Pick<typeof db, 'select'>
): Promise<DueReminderRecord | null> => {
  const [record] = await reader
    .select({
      id: contributionReminders.id,
      dreamBoardId: contributionReminders.dreamBoardId,
      email: contributionReminders.email,
      remindAt: contributionReminders.remindAt,
      childName: dreamBoards.childName,
      giftName: dreamBoards.giftName,
      slug: dreamBoards.slug,
      campaignEndDate: dreamBoards.campaignEndDate,
      partyDate: dreamBoards.partyDate,
      status: dreamBoards.status,
      attemptCount: contributionReminders.attemptCount,
      emailSentAt: contributionReminders.emailSentAt,
      whatsappPhoneE164: contributionReminders.whatsappPhoneE164,
      whatsappWaId: contributionReminders.whatsappWaId,
      whatsappOptInAt: contributionReminders.whatsappOptInAt,
      whatsappOptOutAt: contributionReminders.whatsappOptOutAt,
      whatsappSentAt: contributionReminders.whatsappSentAt,
      whatsappMessageId: contributionReminders.whatsappMessageId,
    })
    .from(contributionReminders)
    .innerJoin(dreamBoards, eq(dreamBoards.id, contributionReminders.dreamBoardId))
    .where(
      and(
        eq(contributionReminders.id, reminderId),
        isNull(contributionReminders.sentAt),
        lte(contributionReminders.remindAt, now),
        lte(contributionReminders.nextAttemptAt, now)
      )
    )
    .limit(1);

  return record ?? null;
};

const markReminderComplete = async (
  tx: Pick<typeof db, 'update'>,
  reminderId: string,
  now: Date
) => {
  await tx
    .update(contributionReminders)
    .set({ sentAt: now })
    .where(eq(contributionReminders.id, reminderId));
};

const markRetry = async (
  tx: Pick<typeof db, 'update'>,
  reminder: DueReminderRecord,
  now: Date
) => {
  const retryAt = new Date(now.getTime() + resolveRetryDelayMs(reminder.attemptCount));
  await tx
    .update(contributionReminders)
    .set({
      attemptCount: sql`${contributionReminders.attemptCount} + 1`,
      lastAttemptAt: now,
      nextAttemptAt: retryAt,
    })
    .where(eq(contributionReminders.id, reminder.id));
  return retryAt;
};

const shouldSendReminderWhatsapp = (reminder: DueReminderRecord) =>
  isWhatsAppReminderDispatchEnabled() &&
  reminder.whatsappPhoneE164 !== null &&
  reminder.whatsappOptInAt !== null &&
  reminder.whatsappOptOutAt === null;

const processReminder = async (params: {
  reminderId: string;
  now: Date;
  requestId?: string;
  dispatcher: ReminderDispatcher;
}): Promise<ReminderDispatchOutcome> =>
  db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`reminder-dispatch:${params.reminderId}`})::bigint)`
    );

    const reminder = await loadDueReminder(params.reminderId, params.now, tx);
    if (!reminder) {
      return 'skipped';
    }

    if (reminder.status !== 'active' && reminder.status !== 'funded') {
      await markReminderComplete(tx, reminder.id, params.now);
      log(
        'warn',
        'reminders.dispatch_skipped_board_not_open',
        { reminderId: reminder.id, dreamBoardId: reminder.dreamBoardId, status: reminder.status },
        params.requestId
      );
      return 'expired';
    }

    if (shouldExpireReminder(toDate(reminder.remindAt), params.now)) {
      await markReminderComplete(tx, reminder.id, params.now);
      log(
        'warn',
        'reminders.dispatch_expired',
        { reminderId: reminder.id, remindAt: reminder.remindAt.toISOString() },
        params.requestId
      );
      return 'expired';
    }

    const emailPending = reminder.emailSentAt === null;
    const whatsappPending = shouldSendReminderWhatsapp(reminder) && reminder.whatsappSentAt === null;

    if (!emailPending && !whatsappPending) {
      await markReminderComplete(tx, reminder.id, params.now);
      return 'sent';
    }

    let emailPayload: EmailPayload;
    let whatsAppPayload: ReminderWhatsAppTemplatePayload;

    try {
      const templateVariables = {
        childName: reminder.childName,
        giftName: reminder.giftName,
        dreamBoardUrl: buildReminderUrl(reminder.slug),
        campaignCloseDate: resolveCampaignCloseDate(reminder),
      };

      emailPayload = buildReminderEmailPayload({
        toEmail: reminder.email,
        variables: templateVariables,
      });
      whatsAppPayload = buildReminderWhatsAppTemplatePayload(templateVariables);
    } catch (error) {
      const reason = toErrorMessage(error);
      await markReminderComplete(tx, reminder.id, params.now);
      log(
        'error',
        'reminders.template_validation_failed',
        { reminderId: reminder.id, reason },
        params.requestId
      );
      return 'terminal_failure';
    }

    log(
      'info',
      'reminders.dispatch_attempt',
      {
        reminderId: reminder.id,
        email: reminder.email,
        remindAt: reminder.remindAt.toISOString(),
        attemptCount: reminder.attemptCount + 1,
        emailPending,
        whatsappPending,
      },
      params.requestId
    );

    if (emailPending) {
      try {
        await params.dispatcher.sendEmail(emailPayload, {
          idempotencyKey: `reminder:${reminder.id}:${reminder.remindAt.toISOString()}:email`,
        });
        await tx
          .update(contributionReminders)
          .set({ emailSentAt: params.now })
          .where(eq(contributionReminders.id, reminder.id));
      } catch (error) {
        const reason = toErrorMessage(error);
        const retryAt = await markRetry(tx, reminder, params.now);
        log(
          'warn',
          'reminders.dispatch_email_failed',
          {
            reminderId: reminder.id,
            email: reminder.email,
            reason,
            retryable: true,
            retryAt: retryAt.toISOString(),
            attemptCount: reminder.attemptCount + 1,
          },
          params.requestId
        );
        return 'retryable_failure';
      }
    }

    if (whatsappPending && reminder.whatsappPhoneE164 && params.dispatcher.sendWhatsAppTemplate) {
      try {
        const waResult = await params.dispatcher.sendWhatsAppTemplate({
          reminderId: reminder.id,
          phoneNumber: reminder.whatsappPhoneE164,
          payload: whatsAppPayload,
        });

        await tx
          .update(contributionReminders)
          .set({
            whatsappSentAt: params.now,
            whatsappMessageId: waResult.messageId ?? reminder.whatsappMessageId,
          })
          .where(eq(contributionReminders.id, reminder.id));

        if (waResult.skipped) {
          log(
            'warn',
            'reminders.dispatch_whatsapp_skipped',
            { reminderId: reminder.id, phoneNumber: reminder.whatsappPhoneE164 },
            params.requestId
          );
        }
      } catch (error) {
        const reason = toErrorMessage(error);
        const retryAt = await markRetry(tx, reminder, params.now);
        log(
          'warn',
          'reminders.dispatch_whatsapp_failed',
          {
            reminderId: reminder.id,
            email: reminder.email,
            reason,
            retryable: true,
            retryAt: retryAt.toISOString(),
            attemptCount: reminder.attemptCount + 1,
          },
          params.requestId
        );
        return 'retryable_failure';
      }
    }

    await markReminderComplete(tx, reminder.id, params.now);
    log(
      'info',
      'reminders.dispatch_sent',
      { reminderId: reminder.id, email: reminder.email },
      params.requestId
    );

    return 'sent';
  });

export const dispatchDueReminders = async (params?: {
  now?: Date;
  limit?: number;
  requestId?: string;
  dispatcher?: ReminderDispatcher;
}): Promise<ReminderDispatchSummary> => {
  const now = params?.now ?? new Date();
  const limit = params?.limit ?? DEFAULT_BATCH_LIMIT;
  const dispatcher = params?.dispatcher ?? defaultDispatcher;

  const dueIds = await fetchDueReminderIds(now, limit);
  if (dueIds.length === 0) {
    return { scanned: 0, sent: 0, failed: 0, expired: 0, skipped: 0 };
  }

  const summary: ReminderDispatchSummary = {
    scanned: dueIds.length,
    sent: 0,
    failed: 0,
    expired: 0,
    skipped: 0,
  };

  for (const due of dueIds) {
    const outcome = await processReminder({
      reminderId: due.id,
      now,
      requestId: params?.requestId,
      dispatcher,
    });
    applyOutcome(summary, outcome);
  }

  return summary;
};
