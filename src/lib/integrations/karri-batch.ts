import { and, eq, isNull, lt, or } from 'drizzle-orm';

import { recordAuditEvent, type AuditActor } from '@/lib/audit';
import { LEGACY_PLACEHOLDER } from '@/lib/constants';
import { db } from '@/lib/db';
import { dreamBoards, karriCreditQueue, payouts } from '@/lib/db/schema';
import { topUpKarriCard } from '@/lib/integrations/karri';
import { sendPayoutConfirmation } from '@/lib/integrations/whatsapp';
import { log } from '@/lib/observability/logger';
import { completePayout, failPayout } from '@/lib/payouts/service';
import { decryptSensitiveValue } from '@/lib/utils/encryption';

const MAX_ATTEMPTS = 3;
const PENDING_RETRY_BACKOFF_MS = 15 * 60 * 1000;

const isPendingRetryDue = (lastAttemptAt: Date | null) => {
  if (!lastAttemptAt) return true;
  return lastAttemptAt.getTime() <= Date.now() - PENDING_RETRY_BACKOFF_MS;
};

type QueueRecord = typeof karriCreditQueue.$inferSelect;

export type BatchResult = {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ dreamBoardId: string; error: string }>;
};

const getCardLast4 = (encryptedCardNumber: string) => {
  if (encryptedCardNumber === LEGACY_PLACEHOLDER) {
    return '';
  }
  try {
    return decryptSensitiveValue(encryptedCardNumber).slice(-4);
  } catch {
    return '';
  }
};

const markQueueProcessing = async (queueId: string, attempts: number) => {
  const now = new Date();
  const [updated] = await db
    .update(karriCreditQueue)
    .set({
      status: 'processing',
      lastAttemptAt: now,
      attempts,
    })
    .where(and(eq(karriCreditQueue.id, queueId), eq(karriCreditQueue.status, 'pending')))
    .returning({ id: karriCreditQueue.id, attempts: karriCreditQueue.attempts });

  return updated ?? null;
};

const markQueueCompleted = async (queueId: string) => {
  await db
    .update(karriCreditQueue)
    .set({ status: 'completed', completedAt: new Date(), errorMessage: null })
    .where(eq(karriCreditQueue.id, queueId));
};

const markQueuePending = async (queueId: string, attempts: number) => {
  await db
    .update(karriCreditQueue)
    .set({ status: 'pending', errorMessage: null, attempts })
    .where(eq(karriCreditQueue.id, queueId));
};

const markQueueFailed = async (params: {
  queueId: string;
  attempts: number;
  errorMessage: string;
}) => {
  await db
    .update(karriCreditQueue)
    .set({
      status: params.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
      errorMessage: params.errorMessage,
    })
    .where(eq(karriCreditQueue.id, params.queueId));
};

const markPayoutProcessing = async (payoutId: string, externalRef?: string) => {
  await db
    .update(payouts)
    .set({ status: 'processing', externalRef: externalRef ?? null, errorMessage: null })
    .where(eq(payouts.id, payoutId));
};

const getNotificationContext = async (dreamBoardId: string) => {
  const [board] = await db
    .select({
      childName: dreamBoards.childName,
      hostWhatsAppNumber: dreamBoards.hostWhatsAppNumber,
    })
    .from(dreamBoards)
    .where(eq(dreamBoards.id, dreamBoardId))
    .limit(1);

  return board ?? null;
};

const processQueueEntry = async (entry: QueueRecord, actor: AuditActor) => {
  const attempts = entry.attempts + 1;
  const locked = await markQueueProcessing(entry.id, attempts);
  if (!locked) {
    return { status: 'skipped' as const };
  }
  try {
    if (entry.karriCardNumber === LEGACY_PLACEHOLDER) {
      throw new Error('Karri card number is missing');
    }
    const cardNumber = decryptSensitiveValue(entry.karriCardNumber);
    await markPayoutProcessing(entry.reference);

    const result = await topUpKarriCard({
      cardNumber,
      amountCents: entry.amountCents,
      reference: entry.reference,
      description: 'ChipIn Dream Board credit',
    });

    if (result.status === 'pending') {
      await markPayoutProcessing(entry.reference, result.transactionId);
      await markQueuePending(entry.id, entry.attempts);
      return { status: 'pending' as const };
    }

    if (result.status !== 'completed') {
      throw new Error(result.errorMessage ?? 'Karri credit failed');
    }

    await completePayout({
      payoutId: entry.reference,
      externalRef: result.transactionId,
      actor,
    });

    await markQueueCompleted(entry.id);

    const notification = await getNotificationContext(entry.dreamBoardId);
    if (notification?.hostWhatsAppNumber) {
      const cardLast4 = getCardLast4(entry.karriCardNumber);
      try {
        await sendPayoutConfirmation(
          notification.hostWhatsAppNumber,
          entry.amountCents,
          cardLast4
        );
      } catch (error) {
        log('warn', 'whatsapp.payout_confirmation_failed', {
          dreamBoardId: entry.dreamBoardId,
          message: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    }

    return { status: 'completed' as const, transactionId: result.transactionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Karri credit failed';
    await markQueueFailed({ queueId: entry.id, attempts, errorMessage: message });

    if (attempts >= MAX_ATTEMPTS) {
      await failPayout({ payoutId: entry.reference, errorMessage: message, actor });
      await recordAuditEvent({
        actor,
        action: 'karri.batch.failed',
        target: { type: 'karri_credit_queue', id: entry.id },
        metadata: { dreamBoardId: entry.dreamBoardId, attempts, errorMessage: message },
      });
    }

    log('error', 'karri_batch_failed', {
      queueId: entry.id,
      dreamBoardId: entry.dreamBoardId,
      attempts,
      message,
    });

    return { status: 'failed' as const, errorMessage: message };
  }
};

export const queueKarriCredit = async (
  params: {
    dreamBoardId: string;
    karriCardNumber: string;
    amountCents: number;
    reference: string;
  },
  database = db
) => {
  await database
    .insert(karriCreditQueue)
    .values({
      dreamBoardId: params.dreamBoardId,
      karriCardNumber: params.karriCardNumber,
      amountCents: params.amountCents,
      reference: params.reference,
      status: 'pending',
    })
    .onConflictDoNothing({ target: karriCreditQueue.reference });
};

export const processDailyKarriBatch = async (): Promise<BatchResult> => {
  const result: BatchResult = { processed: 0, succeeded: 0, failed: 0, errors: [] };
  const actor: AuditActor = { type: 'system', id: 'karri_batch' };
  const batchSize = 50;

  while (true) {
    const retryCutoff = new Date(Date.now() - PENDING_RETRY_BACKOFF_MS);
    const pending = await db
      .select()
      .from(karriCreditQueue)
      .where(
        and(
          eq(karriCreditQueue.status, 'pending'),
          or(
            isNull(karriCreditQueue.lastAttemptAt),
            lt(karriCreditQueue.lastAttemptAt, retryCutoff)
          )
        )
      )
      .orderBy(karriCreditQueue.createdAt)
      .limit(batchSize);

    if (pending.length === 0) {
      break;
    }

    for (const entry of pending) {
      result.processed += 1;
      const outcome = await processQueueEntry(entry, actor);
      if (outcome.status === 'completed') {
        result.succeeded += 1;
      } else if (outcome.status === 'failed') {
        result.failed += 1;
        result.errors.push({
          dreamBoardId: entry.dreamBoardId,
          error: outcome.errorMessage ?? 'Karri credit failed',
        });
      }
    }

    if (pending.length < batchSize) {
      break;
    }
  }

  return result;
};

export const processKarriCreditByReference = async (params: {
  reference: string;
  actor: AuditActor;
}) => {
  const [entry] = await db
    .select()
    .from(karriCreditQueue)
    .where(eq(karriCreditQueue.reference, params.reference))
    .limit(1);

  if (!entry) {
    throw new Error('Karri credit queue entry not found');
  }

  if (entry.status !== 'pending') {
    return { status: entry.status };
  }

  if (!isPendingRetryDue(entry.lastAttemptAt ?? null)) {
    return { status: 'pending' as const };
  }

  return processQueueEntry(entry, params.actor);
};
