import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(),
  select: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  recordAuditEvent: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));
vi.mock('@/lib/audit', () => auditMocks);

import { completePayout, updatePayoutRecipientData } from '@/lib/payouts/service';

describe('payout service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes payout and writes audit log', async () => {
    const payoutSelectChain = {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => [
            {
              id: 'payout-1',
              status: 'pending',
              dreamBoardId: 'board-1',
              type: 'karri_card',
            },
          ]),
        })),
      })),
    };

    dbMock.select.mockReturnValue(payoutSelectChain);

    const updateChain = { set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) };
    const txUpdate = vi.fn(() => updateChain);
    const txSelectChain = {
      from: vi.fn(() => ({
        where: vi.fn(async () => [{ total: 1, completed: 1 }]),
      })),
    };
    const txSelect = vi.fn(() => txSelectChain);

    dbMock.transaction.mockImplementation(async (callback: any) =>
      callback({ update: txUpdate, select: txSelect })
    );

    await completePayout({
      payoutId: 'payout-1',
      externalRef: 'REF-123',
      actor: { type: 'admin' },
    });

    expect(dbMock.transaction).toHaveBeenCalled();
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'payout.completed' })
    );
  });

  it('keeps board closed until all payout rows are completed', async () => {
    const payoutSelectChain = {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => [
            {
              id: 'payout-gift',
              status: 'pending',
              dreamBoardId: 'board-charity',
              type: 'karri_card',
            },
          ]),
        })),
      })),
    };

    dbMock.select.mockReturnValue(payoutSelectChain);

    const updateChain = { set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) };
    const txUpdate = vi.fn(() => updateChain);
    const txSelectChain = {
      from: vi.fn(() => ({
        where: vi.fn(async () => [{ total: 2, completed: 1 }]),
      })),
    };
    const txSelect = vi.fn(() => txSelectChain);

    dbMock.transaction.mockImplementation(async (callback: any) =>
      callback({ update: txUpdate, select: txSelect })
    );

    await completePayout({
      payoutId: 'payout-gift',
      externalRef: 'REF-CHARITY-1',
      actor: { type: 'admin' },
    });

    expect(txUpdate).toHaveBeenCalledTimes(1);
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'payout.completed' })
    );
  });

  it('updates payout recipient data and writes audit log', async () => {
    const payoutSelectChain = {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => [
            {
              id: 'payout-2',
              recipientData: { existing: 'value' },
            },
          ]),
        })),
      })),
    };

    dbMock.select.mockReturnValue(payoutSelectChain);

    const updateChain = { set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) };
    const txUpdate = vi.fn(() => updateChain);

    dbMock.transaction.mockImplementation(async (callback: any) => callback({ update: txUpdate }));

    await updatePayoutRecipientData({
      payoutId: 'payout-2',
      data: { receiptUrl: 'https://blob.test/receipt.pdf' },
      actor: { type: 'admin' },
    });

    expect(dbMock.transaction).toHaveBeenCalled();
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'payout.recipient.updated' })
    );
  });
});
