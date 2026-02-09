import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getContributionForReceiptMock = vi.hoisted(() => vi.fn());
const getContributionByPaymentRefMock = vi.hoisted(() => vi.fn());
const sendEmailMock = vi.hoisted(() => vi.fn());
const logMock = vi.hoisted(() => vi.fn());
const enforceRateLimitMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db/queries', () => ({
  getContributionByPaymentRef: getContributionByPaymentRefMock,
  getContributionForReceipt: getContributionForReceiptMock,
}));

vi.mock('@/lib/integrations/email', () => ({
  sendEmail: sendEmailMock,
}));

vi.mock('@/lib/observability/logger', () => ({
  log: logMock,
}));

vi.mock('@/lib/auth/rate-limit', () => ({
  enforceRateLimit: enforceRateLimitMock,
}));

import { requestReceiptAction } from '@/app/(guest)/[slug]/thanks/page';

const receiptContribution = {
  id: 'contribution-1',
  dreamBoardId: 'board-1',
  amountCents: 10000,
  feeCents: 300,
  paymentStatus: 'completed' as const,
  createdAt: new Date('2026-02-08T10:00:00.000Z'),
  childName: 'Maya',
  giftName: 'Scooter',
  slug: 'maya-birthday',
};

describe('requestReceiptAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gifta.co.za');
    getContributionByPaymentRefMock.mockResolvedValue(null);
    enforceRateLimitMock.mockResolvedValue({ allowed: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns invalid when payload is malformed', async () => {
    const result = await requestReceiptAction('', 'bad-email');

    expect(result).toEqual({ success: false, error: 'invalid' });
    expect(getContributionForReceiptMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('returns unavailable when contribution does not exist', async () => {
    getContributionForReceiptMock.mockResolvedValue(null);

    const result = await requestReceiptAction('contribution-1', 'ava@example.com');

    expect(result).toEqual({ success: false, error: 'unavailable' });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('returns unavailable when contribution is not completed', async () => {
    getContributionForReceiptMock.mockResolvedValue({
      ...receiptContribution,
      paymentStatus: 'pending',
    });

    const result = await requestReceiptAction('contribution-1', 'ava@example.com');

    expect(result).toEqual({ success: false, error: 'unavailable' });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('returns send_failed and logs on provider failure', async () => {
    getContributionForReceiptMock.mockResolvedValue(receiptContribution);
    sendEmailMock.mockRejectedValue(new Error('provider down'));

    const result = await requestReceiptAction('contribution-1', 'ava@example.com');

    expect(result).toEqual({ success: false, error: 'send_failed' });
    expect(logMock).toHaveBeenCalledWith(
      'error',
      'receipts.send_failed',
      expect.objectContaining({
        contributionId: 'contribution-1',
        dreamBoardId: 'board-1',
      })
    );
  });

  it('returns rate_limited when throttle denies send', async () => {
    getContributionForReceiptMock.mockResolvedValue(receiptContribution);
    enforceRateLimitMock.mockResolvedValueOnce({ allowed: false });

    const result = await requestReceiptAction('contribution-1', 'ava@example.com');

    expect(result).toEqual({ success: false, error: 'rate_limited' });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('sends receipt email and returns success', async () => {
    getContributionForReceiptMock.mockResolvedValue(receiptContribution);
    sendEmailMock.mockResolvedValue({ id: 'email-1' });

    const result = await requestReceiptAction('contribution-1', 'AVA@example.com');

    expect(result).toEqual({ success: true });
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ava@example.com',
        subject: "Your contribution receipt for Maya's Dream Board",
      }),
      expect.objectContaining({
        idempotencyKey: expect.stringMatching(/^receipt:contribution-1:ava@example.com:/),
      })
    );
  });
});
