import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
}));

const payoutServiceMocks = vi.hoisted(() => ({
  completePayout: vi.fn(),
  failPayout: vi.fn(),
}));

const karriMocks = vi.hoisted(() => ({
  topUpKarriCard: vi.fn(),
}));

const whatsappMocks = vi.hoisted(() => ({
  sendPayoutConfirmation: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  recordAuditEvent: vi.fn(),
}));

const encryptionMocks = vi.hoisted(() => ({
  decryptSensitiveValue: vi.fn(() => '4111111111111111'),
}));

const loggerMocks = vi.hoisted(() => ({
  log: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));
vi.mock('@/lib/payouts/service', () => payoutServiceMocks);
vi.mock('@/lib/integrations/karri', () => karriMocks);
vi.mock('@/lib/integrations/whatsapp', () => whatsappMocks);
vi.mock('@/lib/audit', () => auditMocks);
vi.mock('@/lib/utils/encryption', () => encryptionMocks);
vi.mock('@/lib/observability/logger', () => loggerMocks);

import { karriCreditQueue } from '@/lib/db/schema';
import { processKarriCreditByReference, queueKarriCredit } from '@/lib/integrations/karri-batch';

const makeSelect = (result: unknown) => ({
  from: vi.fn(() => ({
    where: vi.fn(() => ({
      limit: vi.fn(async () => result),
    })),
  })),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('karri batch queue', () => {
  it('queues Karri credits with pending status', async () => {
    const onConflictDoNothing = vi.fn(async () => undefined);
    const values = vi.fn(() => ({ onConflictDoNothing }));
    const insert = vi.fn(() => ({ values }));

    await queueKarriCredit(
      {
        dreamBoardId: 'board-1',
        karriCardNumber: 'encrypted-card',
        amountCents: 12000,
        reference: 'payout-1',
      },
      { insert } as any
    );

    expect(insert).toHaveBeenCalledWith(karriCreditQueue);
    expect(values).toHaveBeenCalledWith({
      dreamBoardId: 'board-1',
      karriCardNumber: 'encrypted-card',
      amountCents: 12000,
      reference: 'payout-1',
      status: 'pending',
    });
    expect(onConflictDoNothing).toHaveBeenCalled();
  });

  it('processes pending Karri credits by reference', async () => {
    const queueEntry = {
      id: 'queue-1',
      dreamBoardId: 'board-1',
      karriCardNumber: 'encrypted-card',
      amountCents: 9000,
      reference: 'payout-1',
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      completedAt: null,
      errorMessage: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    dbMock.select
      .mockReturnValueOnce(makeSelect([queueEntry]))
      .mockReturnValueOnce(
        makeSelect([
          {
            childName: 'Maya',
            hostWhatsAppNumber: '+27821234567',
          },
        ])
      );

    const updateProcessingChain = {
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(async () => [{ id: 'queue-1', attempts: 1 }]),
        })),
      })),
    };
    const updateChain = {
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    };

    dbMock.update.mockReturnValueOnce(updateProcessingChain).mockReturnValue(updateChain);
    karriMocks.topUpKarriCard.mockResolvedValue({
      status: 'completed',
      transactionId: 'TX-1',
    });

    const result = await processKarriCreditByReference({
      reference: 'payout-1',
      actor: { type: 'admin' },
    });

    expect(result).toEqual({ status: 'completed', transactionId: 'TX-1' });
    expect(karriMocks.topUpKarriCard).toHaveBeenCalledWith(
      expect.objectContaining({
        cardNumber: '4111111111111111',
        amountCents: 9000,
        reference: 'payout-1',
      })
    );
    expect(payoutServiceMocks.completePayout).toHaveBeenCalledWith({
      payoutId: 'payout-1',
      externalRef: 'TX-1',
      actor: { type: 'admin' },
    });
    expect(whatsappMocks.sendPayoutConfirmation).toHaveBeenCalledWith(
      '+27821234567',
      9000,
      '1111'
    );
  });

  it('requeues pending Karri credits when provider is pending', async () => {
    const queueEntry = {
      id: 'queue-2',
      dreamBoardId: 'board-2',
      karriCardNumber: 'encrypted-card',
      amountCents: 7500,
      reference: 'payout-2',
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      completedAt: null,
      errorMessage: null,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    dbMock.select.mockReturnValueOnce(makeSelect([queueEntry]));

    const updateProcessingChain = {
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(async () => [{ id: 'queue-2', attempts: 1 }]),
        })),
      })),
    };
    const updatePayoutChain = {
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    };
    const updateQueueChain = {
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    };

    let queueUpdates = 0;
    dbMock.update.mockImplementation((table) => {
      if (table === karriCreditQueue) {
        queueUpdates += 1;
        return queueUpdates === 1 ? updateProcessingChain : updateQueueChain;
      }
      return updatePayoutChain;
    });

    karriMocks.topUpKarriCard.mockResolvedValue({
      status: 'pending',
      transactionId: 'TX-2',
    });

    const result = await processKarriCreditByReference({
      reference: 'payout-2',
      actor: { type: 'system', id: 'karri_batch' },
    });

    expect(result).toEqual({ status: 'pending' });
    expect(updateQueueChain.set).toHaveBeenCalledWith({
      status: 'pending',
      errorMessage: null,
      attempts: queueEntry.attempts,
    });
    expect(payoutServiceMocks.completePayout).not.toHaveBeenCalled();
    expect(payoutServiceMocks.failPayout).not.toHaveBeenCalled();
  });

  it('skips pending credits within backoff window', async () => {
    const queueEntry = {
      id: 'queue-3',
      dreamBoardId: 'board-3',
      karriCardNumber: 'encrypted-card',
      amountCents: 8200,
      reference: 'payout-3',
      status: 'pending',
      attempts: 1,
      lastAttemptAt: new Date(Date.now() - 5 * 60 * 1000),
      completedAt: null,
      errorMessage: null,
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
    };

    dbMock.select.mockReturnValueOnce(makeSelect([queueEntry]));

    const result = await processKarriCreditByReference({
      reference: 'payout-3',
      actor: { type: 'system', id: 'karri_batch' },
    });

    expect(result).toEqual({ status: 'pending' });
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(karriMocks.topUpKarriCard).not.toHaveBeenCalled();
  });
});
