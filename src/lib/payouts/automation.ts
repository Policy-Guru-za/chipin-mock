import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import { recordAuditEvent, type AuditActor } from '@/lib/audit';
import { isMockSentry } from '@/lib/config/feature-flags';
import { db } from '@/lib/db';
import { payouts } from '@/lib/db/schema';
import { processKarriCreditByReference } from '@/lib/integrations/karri-batch';
import { log } from '@/lib/observability/logger';

import { getPayoutDetail } from './queries';
import { failPayout } from './service';

type PayoutRecord = NonNullable<Awaited<ReturnType<typeof getPayoutDetail>>>;
type PayoutType = PayoutRecord['type'];

export type AutomationResult = {
  payoutId: string;
  status: 'completed' | 'pending' | 'failed';
  externalRef?: string;
};

const isEnabledFlag = (value?: string) => value === 'true';

export const isAutomationEnabledForType = (type: PayoutType) => {
  if (type === 'karri_card') {
    return isEnabledFlag(process.env.KARRI_AUTOMATION_ENABLED);
  }
  return false;
};

const markProcessing = async (payout: PayoutRecord) => {
  await db
    .update(payouts)
    .set({ status: 'processing', errorMessage: null })
    .where(eq(payouts.id, payout.id));
};

const recordAutomationEvent = async (params: {
  actor: AuditActor;
  action: string;
  payoutId: string;
  metadata?: Record<string, unknown>;
}) =>
  recordAuditEvent({
    actor: params.actor,
    action: params.action,
    target: { type: 'payout', id: params.payoutId },
    metadata: params.metadata,
  });


const recordAutomationResult = async (params: {
  actor: AuditActor;
  payout: PayoutRecord;
  status: AutomationResult['status'];
  externalRef?: string;
  errorMessage?: string;
}) => {
  if (params.status === 'completed') {
    await recordAutomationEvent({
      actor: params.actor,
      action: 'payout.automation.completed',
      payoutId: params.payout.id,
      metadata: { externalRef: params.externalRef },
    });
    return;
  }

  if (params.status === 'pending') {
    await recordAutomationEvent({
      actor: params.actor,
      action: 'payout.automation.pending',
      payoutId: params.payout.id,
      metadata: { externalRef: params.externalRef },
    });
    return;
  }

  await recordAutomationEvent({
    actor: params.actor,
    action: 'payout.automation.failed',
    payoutId: params.payout.id,
    metadata: { reason: params.errorMessage },
  });
};

export async function executeAutomatedPayout(params: {
  payoutId: string;
  actor: AuditActor;
}): Promise<AutomationResult> {
  const payout = await getPayoutDetail(params.payoutId);
  if (!payout) {
    throw new Error('Payout not found');
  }

  if (payout.status === 'completed') {
    return {
      payoutId: payout.id,
      status: 'completed',
      externalRef: payout.externalRef ?? undefined,
    };
  }

  if (payout.type !== 'karri_card') {
    throw new Error('Unsupported payout type');
  }

  if (!isAutomationEnabledForType(payout.type)) {
    throw new Error('Automation disabled for payout type');
  }

  await markProcessing(payout);
  await recordAutomationEvent({
    actor: params.actor,
    action: 'payout.automation.started',
    payoutId: payout.id,
    metadata: { payoutType: payout.type },
  });

  try {
    const result = await processKarriCreditByReference({
      reference: payout.id,
      actor: params.actor,
    });

    const mappedStatus: AutomationResult['status'] =
      result.status === 'completed'
        ? 'completed'
        : result.status === 'failed'
          ? 'failed'
          : 'pending';

    const automationResult: AutomationResult = {
      payoutId: payout.id,
      status: mappedStatus,
      externalRef: 'transactionId' in result ? result.transactionId : undefined,
    };

    await recordAutomationResult({
      actor: params.actor,
      payout,
      status: automationResult.status,
      externalRef: automationResult.externalRef,
      errorMessage: 'errorMessage' in result ? result.errorMessage : undefined,
    });

    return automationResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Automation failed';
    log('error', 'payout_automation_failed', { payoutId: payout.id, message });
    if (!isMockSentry()) {
      Sentry.captureException(error);
    }
    await failPayout({ payoutId: payout.id, errorMessage: message, actor: params.actor });
    await recordAutomationResult({
      actor: params.actor,
      payout,
      status: 'failed',
      errorMessage: message,
    });
    throw error;
  }
}
