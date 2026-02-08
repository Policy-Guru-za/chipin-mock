import { beforeEach, describe, expect, it, vi } from 'vitest';

import { contributionReminders, whatsappContacts, whatsappMessageEvents } from '@/lib/db/schema';

const dbMock = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));
vi.mock('@/lib/observability/logger', () => ({ log: vi.fn() }));

import { processWhatsAppWebhookPayload } from '@/lib/integrations/whatsapp-webhook';

let contactValuesMock: ReturnType<typeof vi.fn>;
let contactOnConflictDoUpdateMock: ReturnType<typeof vi.fn>;
let messageEventValuesMock: ReturnType<typeof vi.fn>;
let reminderSetCalls: Array<Record<string, unknown>>;

describe('processWhatsAppWebhookPayload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reminderSetCalls = [];

    contactOnConflictDoUpdateMock = vi.fn(async () => undefined);
    contactValuesMock = vi.fn(() => ({
      onConflictDoUpdate: contactOnConflictDoUpdateMock,
    }));
    messageEventValuesMock = vi.fn(async () => undefined);

    dbMock.insert.mockImplementation((table: unknown) => {
      if (table === whatsappContacts) {
        return {
          values: contactValuesMock,
        };
      }

      if (table === whatsappMessageEvents) {
        return {
          values: messageEventValuesMock,
        };
      }

      return {
        values: vi.fn(async () => undefined),
      };
    });

    dbMock.update.mockImplementation((table: unknown) => {
      if (table === contributionReminders) {
        const where = vi.fn(async () => undefined);
        const set = vi.fn((values: Record<string, unknown>) => {
          reminderSetCalls.push(values);
          return { where };
        });
        return { set };
      }

      return {
        set: vi.fn(() => ({
          where: vi.fn(async () => undefined),
        })),
      };
    });
  });

  it('records inbound + status events and requeues failed WhatsApp deliveries', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: 'wamid-msg-1',
                    from: '27821234567',
                    timestamp: '1770000000',
                    type: 'text',
                    text: { body: 'Hello' },
                  },
                ],
                statuses: [
                  {
                    id: 'wamid-status-1',
                    status: 'failed',
                    recipient_id: '27821234567',
                    timestamp: '1770000001',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await processWhatsAppWebhookPayload(payload, 'req-1');

    expect(result).toEqual({ processedMessages: 1, processedStatuses: 1 });
    expect(dbMock.insert).toHaveBeenCalledWith(whatsappContacts);
    expect(dbMock.insert).toHaveBeenCalledWith(whatsappMessageEvents);
    expect(reminderSetCalls).toContainEqual(
      expect.objectContaining({
        sentAt: null,
        whatsappSentAt: null,
        lastAttemptAt: expect.any(Date),
        nextAttemptAt: expect.any(Date),
      })
    );
  });

  it('propagates STOP opt-outs to pending reminders', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: 'wamid-msg-stop',
                    from: '27821234567',
                    timestamp: '1770000002',
                    type: 'text',
                    text: { body: 'STOP' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await processWhatsAppWebhookPayload(payload, 'req-2');

    expect(result).toEqual({ processedMessages: 1, processedStatuses: 0 });
    expect(contactOnConflictDoUpdateMock).toHaveBeenCalledTimes(1);
    const contactUpdateSet = contactOnConflictDoUpdateMock.mock.calls[0]?.[0]?.set;
    expect(contactUpdateSet).toEqual(
      expect.objectContaining({
        optOutAt: expect.any(Date),
      })
    );
    expect(reminderSetCalls).toContainEqual(
      expect.objectContaining({
        whatsappOptOutAt: expect.any(Date),
      })
    );
  });

  it('preserves existing opt-out state for non-STOP inbound messages', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: 'wamid-msg-2',
                    from: '27821234567',
                    timestamp: '1770000003',
                    type: 'text',
                    text: { body: 'Hi there' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await processWhatsAppWebhookPayload(payload, 'req-3');

    expect(result).toEqual({ processedMessages: 1, processedStatuses: 0 });
    expect(contactOnConflictDoUpdateMock).toHaveBeenCalledTimes(1);
    const contactUpdateSet = contactOnConflictDoUpdateMock.mock.calls[0]?.[0]?.set as
      | Record<string, unknown>
      | undefined;
    expect(contactUpdateSet).toBeDefined();
    expect(contactUpdateSet).not.toHaveProperty('optOutAt');
    expect(reminderSetCalls).toHaveLength(0);
  });
});
