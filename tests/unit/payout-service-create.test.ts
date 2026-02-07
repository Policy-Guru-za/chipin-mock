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
import { LEGACY_PLACEHOLDER } from '@/lib/constants';
import { createPayoutsForDreamBoard } from '@/lib/payouts/service';

describe('payout service creation', () => {
  const originalEnv = {
    UX_V2_ENABLE_CHARITY_WRITE_PATH: process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = originalEnv.UX_V2_ENABLE_CHARITY_WRITE_PATH;
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
      charityCents: 0,
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

  it('skips legacy karri boards without throwing', async () => {
    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-legacy',
      partnerId: 'partner-1',
      status: 'closed',
      payoutMethod: 'karri_card',
      giftName: 'Train set',
      giftImageUrl: 'https://images.example/product.jpg',
      giftImagePrompt: 'A bright train set',
      payoutEmail: 'host@chipin.co.za',
      karriCardNumber: LEGACY_PLACEHOLDER,
      karriCardHolderName: 'Host Parent',
      hostWhatsAppNumber: '+27821234567',
      childName: 'Maya',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-legacy',
    });
    payoutQueryMocks.getContributionTotalsForDreamBoard.mockResolvedValue({
      raisedCents: 12000,
      platformFeeCents: 500,
      charityCents: 0,
    });

    const result = await createPayoutsForDreamBoard({
      dreamBoardId: 'board-legacy',
      actor: { type: 'admin' },
    });

    expect(result.skipped).toBe(true);
    expect(result.created).toEqual([]);
    expect(payoutQueryMocks.listPayoutsForDreamBoard).not.toHaveBeenCalled();
    expect(dbMock.transaction).not.toHaveBeenCalled();
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
      charityCents: 0,
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

  it('creates a bank payout and does not queue Karri credits', async () => {
    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-3',
      partnerId: 'partner-1',
      status: 'closed',
      payoutMethod: 'bank',
      giftName: 'Bike',
      giftImageUrl: 'https://images.example/bike.jpg',
      giftImagePrompt: 'A mountain bike',
      payoutEmail: 'host@chipin.co.za',
      bankName: 'FNB',
      bankAccountNumberEncrypted: 'encrypted-account',
      bankAccountLast4: '6789',
      bankBranchCode: '250655',
      bankAccountHolder: 'Host Parent',
      charityEnabled: false,
      hostWhatsAppNumber: '+27821234567',
      childName: 'Noah',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-3',
    });
    payoutQueryMocks.getContributionTotalsForDreamBoard.mockResolvedValue({
      raisedCents: 18000,
      platformFeeCents: 700,
      charityCents: 0,
    });
    payoutQueryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);

    const insertedPayouts: Array<Record<string, unknown>> = [];
    const insert = vi.fn((table: unknown) => {
      if (table === payouts) {
        return {
          values: vi.fn((values: Record<string, unknown>) => {
            insertedPayouts.push(values);
            return {
              onConflictDoNothing: vi.fn(() => ({
                returning: vi.fn(async () => [
                  {
                    id: `payout-${insertedPayouts.length}`,
                    type: values.type,
                  },
                ]),
              })),
            };
          }),
        };
      }
      if (table === payoutItems) {
        return { values: vi.fn(async () => undefined) };
      }
      return { values: vi.fn(async () => undefined) };
    });

    dbMock.transaction.mockImplementation(async (callback: any) => callback({ insert }));

    const result = await createPayoutsForDreamBoard({
      dreamBoardId: 'board-3',
      actor: { type: 'admin' },
    });

    expect(result.created).toHaveLength(1);
    expect(insertedPayouts[0]).toEqual(
      expect.objectContaining({
        type: 'bank',
        grossCents: 18000,
        netCents: 18000,
        charityCents: 0,
      })
    );
    expect(karriBatchMocks.queueKarriCredit).not.toHaveBeenCalled();
  });

  it('creates charity payout rows for already-linked charities even when writes are disabled', async () => {
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'false';

    payoutQueryMocks.getDreamBoardPayoutContext.mockResolvedValue({
      id: 'board-4',
      partnerId: 'partner-1',
      status: 'closed',
      payoutMethod: 'karri_card',
      giftName: 'Lego',
      giftImageUrl: 'https://images.example/lego.jpg',
      giftImagePrompt: 'A large lego set',
      payoutEmail: 'host@chipin.co.za',
      karriCardNumber: 'encrypted-card',
      karriCardHolderName: 'Host Parent',
      charityEnabled: true,
      charityId: 'charity-1',
      charitySplitType: 'percentage',
      charityPercentageBps: 1000,
      charityThresholdCents: null,
      charityName: 'Save The Ocean',
      charityBankDetailsEncrypted: { account: 'encrypted' },
      hostWhatsAppNumber: '+27821234567',
      childName: 'Aria',
      hostEmail: 'host@chipin.co.za',
      hostId: 'host-4',
    });
    payoutQueryMocks.getContributionTotalsForDreamBoard.mockResolvedValue({
      raisedCents: 20000,
      platformFeeCents: 800,
      charityCents: 3000,
    });
    payoutQueryMocks.listPayoutsForDreamBoard.mockResolvedValue([]);

    const insertedPayouts: Array<Record<string, unknown>> = [];
    const insertedItems: Array<Record<string, unknown>> = [];
    const insert = vi.fn((table: unknown) => {
      if (table === payouts) {
        return {
          values: vi.fn((values: Record<string, unknown>) => {
            insertedPayouts.push(values);
            return {
              onConflictDoNothing: vi.fn(() => ({
                returning: vi.fn(async () => [
                  {
                    id: `payout-${insertedPayouts.length}`,
                    type: values.type,
                  },
                ]),
              })),
            };
          }),
        };
      }
      if (table === payoutItems) {
        return {
          values: vi.fn(async (values: Record<string, unknown>) => {
            insertedItems.push(values);
            return undefined;
          }),
        };
      }
      return { values: vi.fn(async () => undefined) };
    });

    dbMock.transaction.mockImplementation(async (callback: any) => callback({ insert }));

    const result = await createPayoutsForDreamBoard({
      dreamBoardId: 'board-4',
      actor: { type: 'admin' },
    });

    expect(result.created.map((item) => item.type).sort()).toEqual(['charity', 'karri_card']);
    expect(insertedPayouts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'karri_card',
          grossCents: 20000,
          netCents: 17000,
          charityCents: 3000,
        }),
        expect.objectContaining({
          type: 'charity',
          grossCents: 3000,
          netCents: 3000,
          charityCents: 3000,
        }),
      ])
    );
    expect(insertedItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'gift', amountCents: 17000 }),
        expect.objectContaining({ type: 'charity', amountCents: 3000 }),
      ])
    );
    expect(karriBatchMocks.queueKarriCredit).toHaveBeenCalledTimes(1);
    expect(karriBatchMocks.queueKarriCredit).toHaveBeenCalledWith(
      expect.objectContaining({
        dreamBoardId: 'board-4',
        amountCents: 17000,
      }),
      expect.anything()
    );
  });
});
