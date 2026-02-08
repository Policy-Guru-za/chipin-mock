import crypto from 'crypto';

import { and, eq, isNull, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { contributionReminders, whatsappContacts, whatsappMessageEvents } from '@/lib/db/schema';
import { log } from '@/lib/observability/logger';

const CSW_WINDOW_MS = 24 * 60 * 60 * 1000;
const STOP_KEYWORDS = new Set(['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);

type WhatsAppWebhookMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { payload?: string; text?: string };
};

type WhatsAppWebhookStatus = {
  id?: string;
  status?: string;
  recipient_id?: string;
  timestamp?: string;
  errors?: unknown;
};

type WhatsAppWebhookChangeValue = {
  contacts?: Array<{ wa_id?: string }>;
  messages?: WhatsAppWebhookMessage[];
  statuses?: WhatsAppWebhookStatus[];
};

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: WhatsAppWebhookChangeValue;
    }>;
  }>;
};

const normalizeWaIdToPhone = (waId: string | null | undefined) => {
  if (!waId) return null;
  const normalized = waId.trim();
  if (!normalized) return null;
  if (normalized.startsWith('+')) return normalized;
  return `+${normalized}`;
};

const parseTimestamp = (value: string | undefined) => {
  if (!value) return new Date();
  if (/^\d+$/.test(value)) {
    const parsed = Number(value) * 1000;
    if (Number.isFinite(parsed)) return new Date(parsed);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
};

const isStopMessage = (message: WhatsAppWebhookMessage) => {
  const textBody = message.text?.body?.trim().toUpperCase() ?? '';
  const buttonPayload = message.button?.payload?.trim().toUpperCase() ?? '';
  const buttonText = message.button?.text?.trim().toUpperCase() ?? '';
  return (
    STOP_KEYWORDS.has(textBody) || STOP_KEYWORDS.has(buttonPayload) || STOP_KEYWORDS.has(buttonText)
  );
};

const timingSafeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const isValidWhatsAppWebhookSignature = (rawBody: string, signatureHeader: string | null) => {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expectedSignature = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  return timingSafeEqual(expectedSignature, signatureHeader);
};

const upsertContactForInboundMessage = async (params: {
  waId: string;
  inboundAt: Date;
  optOut: boolean;
}) => {
  const phoneE164 = normalizeWaIdToPhone(params.waId);
  if (!phoneE164) return { phoneE164: null, optOutAt: null };

  const now = new Date();
  const cswExpiresAt = new Date(params.inboundAt.getTime() + CSW_WINDOW_MS);
  const optOutAt = params.optOut ? now : null;

  await db
    .insert(whatsappContacts)
    .values({
      phoneE164,
      waId: params.waId,
      lastInboundAt: params.inboundAt,
      cswExpiresAt,
      optOutAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: whatsappContacts.phoneE164,
      set: {
        waId: params.waId,
        lastInboundAt: params.inboundAt,
        cswExpiresAt,
        ...(params.optOut ? { optOutAt } : {}),
        updatedAt: now,
      },
    });

  return { phoneE164, optOutAt };
};

const recordInboundMessageEvent = async (params: {
  message: WhatsAppWebhookMessage;
  waId: string;
  payload: unknown;
}) =>
  db.insert(whatsappMessageEvents).values({
    messageId: params.message.id ?? null,
    direction: 'inbound',
    eventType: 'message',
    recipientWaId: params.waId,
    recipientPhoneE164: normalizeWaIdToPhone(params.waId),
    payload: params.payload as Record<string, unknown>,
  });

const recordStatusEvent = async (params: { status: WhatsAppWebhookStatus; payload: unknown }) =>
  db.insert(whatsappMessageEvents).values({
    messageId: params.status.id ?? null,
    direction: 'status',
    eventType: 'status',
    status: params.status.status ?? null,
    recipientWaId: params.status.recipient_id ?? null,
    recipientPhoneE164: normalizeWaIdToPhone(params.status.recipient_id),
    payload: params.payload as Record<string, unknown>,
  });

const requeueFailedReminderDelivery = async (messageId: string) => {
  const now = new Date();
  await db
    .update(contributionReminders)
    .set({
      sentAt: null,
      whatsappSentAt: null,
      nextAttemptAt: now,
      lastAttemptAt: now,
      attemptCount: sql`${contributionReminders.attemptCount} + 1`,
    })
    .where(eq(contributionReminders.whatsappMessageId, messageId));
};

const applyReminderOptOut = async (params: { phoneE164: string; optOutAt: Date }) => {
  await db
    .update(contributionReminders)
    .set({
      whatsappOptOutAt: params.optOutAt,
    })
    .where(
      and(
        eq(contributionReminders.whatsappPhoneE164, params.phoneE164),
        isNull(contributionReminders.sentAt),
        isNull(contributionReminders.whatsappOptOutAt)
      )
    );
};

export const processWhatsAppWebhookPayload = async (payload: WhatsAppWebhookPayload, requestId?: string) => {
  if (payload.object !== 'whatsapp_business_account') {
    return { processedMessages: 0, processedStatuses: 0 };
  }

  let processedMessages = 0;
  let processedStatuses = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      for (const message of value.messages ?? []) {
        const waId = message.from ?? value.contacts?.[0]?.wa_id;
        if (!waId) continue;

        const inboundAt = parseTimestamp(message.timestamp);
        const optOut = isStopMessage(message);
        const contactResult = await upsertContactForInboundMessage({ waId, inboundAt, optOut });
        if (optOut && contactResult.phoneE164 && contactResult.optOutAt) {
          await applyReminderOptOut({
            phoneE164: contactResult.phoneE164,
            optOutAt: contactResult.optOutAt,
          });
        }
        await recordInboundMessageEvent({ message, waId, payload: message });
        processedMessages += 1;
      }

      for (const status of value.statuses ?? []) {
        await recordStatusEvent({ status, payload: status });
        processedStatuses += 1;

        if (status.status === 'failed' && status.id) {
          await requeueFailedReminderDelivery(status.id);
          log('warn', 'whatsapp.reminder_delivery_failed', { messageId: status.id }, requestId);
        }
      }
    }
  }

  return { processedMessages, processedStatuses };
};
