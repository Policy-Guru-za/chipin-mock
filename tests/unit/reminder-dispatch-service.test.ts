import { afterEach, describe, expect, it, vi } from 'vitest';

type MockReminderRecord = {
  id: string;
  dreamBoardId: string;
  email: string;
  remindAt: Date;
  childName: string;
  giftName: string;
  slug: string;
  campaignEndDate: string | null;
  partyDate: string | null;
  status: string;
  attemptCount: number;
  emailSentAt: Date | null;
  whatsappPhoneE164: string | null;
  whatsappWaId: string | null;
  whatsappOptInAt: Date | null;
  whatsappOptOutAt: Date | null;
  whatsappSentAt: Date | null;
};

const createDbMock = (params: { dueIds: string[]; reminderRecords: Array<MockReminderRecord | null> }) => {
  const dueIds = params.dueIds.map((id) => ({ id }));
  const reminderQueue = [...params.reminderRecords];
  const updates: Array<Record<string, unknown>> = [];

  const dueLimit = vi.fn(async () => dueIds);
  const dueOrderBy = vi.fn(() => ({ limit: dueLimit }));
  const dueWhere = vi.fn(() => ({ orderBy: dueOrderBy }));
  const dueFrom = vi.fn(() => ({ where: dueWhere }));
  const select = vi.fn(() => ({ from: dueFrom }));

  const txLimit = vi.fn(async () => {
    const next = reminderQueue.shift();
    return next ? [next] : [];
  });
  const txWhere = vi.fn(() => ({ limit: txLimit }));
  const txInnerJoin = vi.fn(() => ({ where: txWhere }));
  const txFrom = vi.fn(() => ({ innerJoin: txInnerJoin }));
  const txSelect = vi.fn(() => ({ from: txFrom }));
  const txUpdateWhere = vi.fn(async () => undefined);
  const txUpdateSet = vi.fn((values: Record<string, unknown>) => {
    updates.push(values);
    return { where: txUpdateWhere };
  });
  const txUpdate = vi.fn(() => ({ set: txUpdateSet }));
  const txExecute = vi.fn(async () => undefined);

  const tx = {
    execute: txExecute,
    select: txSelect,
    update: txUpdate,
  };

  const transaction = vi.fn(async (callback: (txArg: typeof tx) => Promise<unknown>) => callback(tx));

  return {
    db: {
      select,
      transaction,
    },
    updates,
  };
};

const loadService = async (dbOverride: { select: unknown; transaction: unknown }) => {
  vi.resetModules();
  vi.doMock('@/lib/db', () => ({ db: dbOverride }));
  vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));
  return import('@/lib/reminders/service');
};

const originalWhatsAppReminderFlag = process.env.UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH;

afterEach(() => {
  process.env.UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH = originalWhatsAppReminderFlag;
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/observability/logger');
  vi.resetModules();
});

describe('dispatchDueReminders', () => {
  const buildReminderRecord = (
    partial: Partial<MockReminderRecord> & Pick<MockReminderRecord, 'id' | 'dreamBoardId' | 'email'>
  ): MockReminderRecord => ({
    id: partial.id,
    dreamBoardId: partial.dreamBoardId,
    email: partial.email,
    remindAt: partial.remindAt ?? new Date('2026-02-08T09:00:00.000Z'),
    childName: partial.childName ?? 'Maya',
    giftName: partial.giftName ?? 'Scooter',
    slug: partial.slug ?? 'maya-board',
    campaignEndDate: partial.campaignEndDate ?? '2099-01-30',
    partyDate: partial.partyDate ?? '2099-01-31',
    status: partial.status ?? 'active',
    attemptCount: partial.attemptCount ?? 0,
    emailSentAt: partial.emailSentAt ?? null,
    whatsappPhoneE164: partial.whatsappPhoneE164 ?? null,
    whatsappWaId: partial.whatsappWaId ?? null,
    whatsappOptInAt: partial.whatsappOptInAt ?? null,
    whatsappOptOutAt: partial.whatsappOptOutAt ?? null,
    whatsappSentAt: partial.whatsappSentAt ?? null,
  });

  it('sends due reminders once and marks them terminal', async () => {
    const now = new Date('2026-02-08T10:00:00.000Z');
    const dbMock = createDbMock({
      dueIds: ['r-1'],
      reminderRecords: [
        buildReminderRecord({
          id: 'r-1',
          dreamBoardId: 'board-1',
          email: 'friend@example.com',
        }),
      ],
    });
    const { dispatchDueReminders } = await loadService(dbMock.db);

    const sendEmail = vi.fn(async () => ({ id: 'email-1' }));
    const summary = await dispatchDueReminders({
      now,
      dispatcher: { sendEmail },
    });

    expect(summary).toEqual({ scanned: 1, sent: 1, failed: 0, expired: 0, skipped: 0 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(dbMock.updates).toHaveLength(2);
    expect(dbMock.updates[0]).toEqual({ emailSentAt: now });
    expect(dbMock.updates[1]).toEqual({ sentAt: now });
  });

  it('updates retry state when send fails inside retry window', async () => {
    const now = new Date('2026-02-08T10:00:00.000Z');
    const dbMock = createDbMock({
      dueIds: ['r-2'],
      reminderRecords: [
        buildReminderRecord({
          id: 'r-2',
          dreamBoardId: 'board-2',
          email: 'friend@example.com',
          giftName: 'Skates',
        }),
      ],
    });
    const { dispatchDueReminders } = await loadService(dbMock.db);

    const sendEmail = vi.fn(async () => {
      throw new Error('provider timeout');
    });
    const summary = await dispatchDueReminders({
      now,
      dispatcher: { sendEmail },
    });

    expect(summary).toEqual({ scanned: 1, sent: 0, failed: 1, expired: 0, skipped: 0 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(dbMock.updates).toHaveLength(1);
    expect(dbMock.updates[0]).toEqual(
      expect.objectContaining({
        lastAttemptAt: now,
        nextAttemptAt: new Date('2026-02-08T10:05:00.000Z'),
      })
    );
    expect(dbMock.updates[0]).toHaveProperty('attemptCount');
  });

  it('expires old due reminders after retry window without sending', async () => {
    const now = new Date('2026-02-08T10:00:00.000Z');
    const dbMock = createDbMock({
      dueIds: ['r-3'],
      reminderRecords: [
        buildReminderRecord({
          id: 'r-3',
          dreamBoardId: 'board-3',
          email: 'friend@example.com',
          remindAt: new Date('2026-02-05T09:00:00.000Z'),
          giftName: 'Book set',
        }),
      ],
    });
    const { dispatchDueReminders } = await loadService(dbMock.db);

    const sendEmail = vi.fn(async () => ({ id: 'email-1' }));
    const summary = await dispatchDueReminders({
      now,
      dispatcher: { sendEmail },
    });

    expect(summary).toEqual({ scanned: 1, sent: 0, failed: 0, expired: 1, skipped: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(dbMock.updates).toHaveLength(1);
    expect(dbMock.updates[0]).toEqual({ sentAt: now });
  });

  it('does not resend email when only WhatsApp channel is pending', async () => {
    const now = new Date('2026-02-08T10:00:00.000Z');
    const dbMock = createDbMock({
      dueIds: ['r-4'],
      reminderRecords: [
        buildReminderRecord({
          id: 'r-4',
          dreamBoardId: 'board-4',
          email: 'friend@example.com',
          attemptCount: 1,
          emailSentAt: new Date('2026-02-08T09:30:00.000Z'),
          whatsappPhoneE164: '+27821234567',
          whatsappOptInAt: new Date('2026-02-07T12:00:00.000Z'),
        }),
      ],
    });
    const { dispatchDueReminders } = await loadService(dbMock.db);

    const sendEmail = vi.fn(async () => ({ id: 'email-1' }));
    const sendWhatsAppTemplate = vi.fn(async () => {
      throw new Error('whatsapp failure');
    });
    process.env.UX_V2_ENABLE_WHATSAPP_REMINDER_DISPATCH = 'true';

    const summary = await dispatchDueReminders({
      now,
      dispatcher: {
        sendEmail,
        sendWhatsAppTemplate,
      },
    });

    expect(summary).toEqual({ scanned: 1, sent: 0, failed: 1, expired: 0, skipped: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendWhatsAppTemplate).toHaveBeenCalledTimes(1);
    expect(dbMock.updates).toHaveLength(1);
    expect(dbMock.updates[0]).toEqual(
      expect.objectContaining({
        lastAttemptAt: now,
        nextAttemptAt: new Date('2026-02-08T10:10:00.000Z'),
      })
    );
    expect(dbMock.updates[0]).toHaveProperty('attemptCount');
  });
});
