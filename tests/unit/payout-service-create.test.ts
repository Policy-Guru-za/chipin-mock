import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  recordAuditEvent: vi.fn(),
}));

const payoutQueryMocks = vi.hoisted(() => ({
  getDreamBoardPayoutContext: vi.fn(),
  getContributionTotalsForDreamBoard: vi.fn(),
  listPayoutsForDreamBoard: vi.fn(),
}));

const karriBatchMocks = vi.hoisted(() => ({
  queueKarriCredit: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));
vi.mock('@/lib/audit', () => auditMocks);
vi.mock('@/lib/payouts/queries', () => payoutQueryMocks);
vi.mock('@/lib/integrations/karri-batch', () => karriBatchMocks);

import { payoutItems, payouts } from '@/lib/db/schema';
import { createPayoutsForDreamBoard } from '@/lib/payouts/service';

describe('payout service creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips payout creation when nothing raised', async () => {
    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-1',
      partnerId: 'partner-1',
      status: 'closed',
      payoutMethod: 'karri_card',
      giftName: 'Train set',
      giftImageUrl: 'https://images.example/product.jpg',
      giftImagePrompt: 'A bright train set',
      payoutEmail: 'host@chipin.co.za',
      karriCardNumber: 'encrypted-card',
      karriCardHolderName: 'Host Parent',
      hostWhatsAppNumber: '+27821234567',
      childName: 'Maya',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-1',
    });
    payoutQueryMocks.getContributionTotalsForDreamBoard.mockResolvedValue({
      raisedCents: 0,
      platformFeeCents: 0,
    });
    payoutQueryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);

    const result = await createPayoutsForDreamBoard({
      dreamBoardId: 'board-1',
      actor: { type: 'admin' },
    });

    expect(result.skipped).toBe(true);
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it('rejects payouts for funded boards', async () => {
    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-1',
      partnerId: 'partner-1',
      status: 'funded',
      payoutMethod: 'karri_card',
      giftName: 'Train set',
      giftImageUrl: 'https://images.example/product.jpg',
      giftImagePrompt: 'A bright train set',
      payoutEmail: 'host@chipin.co.za',
      karriCardNumber: 'encrypted-card',
      karriCardHolderName: 'Host Parent',
      hostWhatsAppNumber: '+27821234567',
      childName: 'Maya',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-1',
    });

    await expect(
      createPayoutsForDreamBoard({
        dreamBoardId: 'board-1',
        actor: { type: 'admin' },
      })
    ).rejects.toThrow('Dream Board is not ready for payout');
  });

  it('creates a karri card payout when funds are raised', async () => {
    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-2',
      partnerId: 'partner-1',
      status: 'closed',
      payoutMethod: 'karri_card',
      giftName: 'Scooter',
      giftImageUrl: 'https://images.example/scooter.jpg',
      giftImagePrompt: 'A fun scooter',
      payoutEmail: 'host@chipin.co.za',
      karriCardNumber: 'encrypted-card',
      karriCardHolderName: 'Host Parent',
      hostWhatsAppNumber: '+27821234567',
      childName: 'Luca',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-2',
    });
    payoutQueryMocks.getContributionTotalsForDreamBoard.mockResolvedValue({
      raisedCents: 14000,
      platformFeeCents: 600,
    });
    payoutQueryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);

    const insert = vi.fn((table: unknown) => {
      if (table === payouts) {
        return {
          values: vi.fn(() => ({
            onConflictDoNothing: vi.fn(() => ({
              returning: vi.fn(async () => {
                return [
                  {
                    id: 'payout-1',
                    type: 'karri_card',
                  },
                ];
              }),
            })),
          })),
        };
      }
      if (table === payoutItems) {
        return { values: vi.fn(async () => undefined) };
      }
      return { values: vi.fn(async () => undefined) };
    });

    dbMock.transaction.mockImplementation(async (callback: any) => callback({ insert }));

    const result = await createPayoutsForDreamBoard({
      dreamBoardId: 'board-2',
      actor: { type: 'admin' },
    });

    expect(result.created).toHaveLength(1);
    expect(karriBatchMocks.queueKarriCredit).toHaveBeenCalledWith(
      expect.objectContaining({
        dreamBoardId: 'board-2',
        reference: 'payout-1',
        amountCents: 14000,
      }),
      expect.anything()
    );
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledTimes(1);
  });
});
