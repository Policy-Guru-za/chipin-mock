import { z } from 'zod';

import { enforceRateLimit } from '@/lib/auth/rate-limit';
import { getContributionForReceipt } from '@/lib/db/queries';
import { sendEmail } from '@/lib/integrations/email';
import { log } from '@/lib/observability/logger';
import { formatZar } from '@/lib/utils/money';

const receiptSchema = z.object({
  contributionId: z.string().min(1),
  email: z.string().email(),
});

type ReceiptState = {
  success: boolean;
  error?: string;
};

const RECEIPT_CONTRIBUTION_LIMIT = 3;
const RECEIPT_CONTRIBUTION_WINDOW_SECONDS = 3600;
const RECEIPT_RECIPIENT_LIMIT = 1;
const RECEIPT_RECIPIENT_WINDOW_SECONDS = 300;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const buildReceiptEmail = (params: {
  childName: string;
  giftName: string;
  amountCents: number;
  feeCents: number;
  createdAt: Date;
  boardUrl: string;
  to: string;
}) => {
  const totalCents = params.amountCents + params.feeCents;
  const contributionDate = params.createdAt.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const subject = `Your contribution receipt for ${params.childName}'s Dreamboard`;
  const safeChildName = escapeHtml(params.childName);
  const safeGiftName = escapeHtml(params.giftName);
  const safeBoardUrl = escapeHtml(params.boardUrl);

  return {
    to: params.to,
    subject,
    text: [
      `Thanks for contributing to ${params.childName}'s Dreamboard for ${params.giftName}.`,
      `Gift contribution: ${formatZar(params.amountCents)}`,
      `Processing fee: ${formatZar(params.feeCents)}`,
      `Total paid: ${formatZar(totalCents)}`,
      `Date: ${contributionDate}`,
      `View Dreamboard: ${params.boardUrl}`,
      '',
      'Thank you for helping make this birthday extra special.',
      'Gifta',
    ].join('\n'),
    html: [
      '<p>Hi there,</p>',
      `<p>Thanks for contributing to <strong>${safeChildName}</strong>'s Dreamboard for <strong>${safeGiftName}</strong>.</p>`,
      '<p><strong>Receipt details</strong></p>',
      '<ul>',
      `<li>Gift contribution: ${formatZar(params.amountCents)}</li>`,
      `<li>Processing fee: ${formatZar(params.feeCents)}</li>`,
      `<li>Total paid: ${formatZar(totalCents)}</li>`,
      `<li>Date: ${contributionDate}</li>`,
      '</ul>',
      `<p><a href="${safeBoardUrl}">View Dreamboard</a></p>`,
      '<p>Thank you for helping make this birthday extra special.</p>',
      '<p>Gifta</p>',
    ].join(''),
  };
};

export async function requestReceiptAction(
  contributionId: string,
  email: string
): Promise<ReceiptState> {
  'use server';

  const parsed = receiptSchema.safeParse({ contributionId, email });
  if (!parsed.success) {
    return { success: false, error: 'invalid' };
  }

  const contribution = await getContributionForReceipt(parsed.data.contributionId);
  if (!contribution || contribution.paymentStatus !== 'completed') {
    return { success: false, error: 'unavailable' };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const boardUrl = `${baseUrl.replace(/\/+$/, '')}/${contribution.slug}`;

  const contributionRateLimit = await enforceRateLimit(`receipt:contribution:${contribution.id}`, {
    limit: RECEIPT_CONTRIBUTION_LIMIT,
    windowSeconds: RECEIPT_CONTRIBUTION_WINDOW_SECONDS,
  });
  if (!contributionRateLimit.allowed) {
    return { success: false, error: 'rate_limited' };
  }

  const recipientRateLimit = await enforceRateLimit(
    `receipt:recipient:${contribution.id}:${normalizedEmail}`,
    {
      limit: RECEIPT_RECIPIENT_LIMIT,
      windowSeconds: RECEIPT_RECIPIENT_WINDOW_SECONDS,
    }
  );
  if (!recipientRateLimit.allowed) {
    return { success: false, error: 'rate_limited' };
  }

  try {
    const emailPayload = buildReceiptEmail({
      childName: contribution.childName,
      giftName: contribution.giftName,
      amountCents: contribution.amountCents,
      feeCents: contribution.feeCents,
      createdAt: contribution.createdAt,
      boardUrl,
      to: normalizedEmail,
    });
    const idempotencyBucket = new Date().toISOString().slice(0, 16);

    await sendEmail(emailPayload, {
      idempotencyKey: `receipt:${contribution.id}:${normalizedEmail}:${idempotencyBucket}`,
    });
  } catch (error) {
    log('error', 'receipts.send_failed', {
      contributionId: contribution.id,
      dreamBoardId: contribution.dreamBoardId,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return { success: false, error: 'send_failed' };
  }

  return { success: true };
}
