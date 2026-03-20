import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const kvMocks = vi.hoisted(() => ({
  del: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock('@/lib/demo/kv-adapter', () => ({
  kvAdapter: {
    get: kvMocks.get,
    set: kvMocks.set,
    del: kvMocks.del,
  },
}));

import {
  getHostCreateDreamBoardDraft,
  updateHostCreateDreamBoardDraft,
} from '@/lib/dream-boards/draft';

const kvStore = new Map<string, unknown>();
const draftKey = 'draft:host:host-1';

beforeEach(() => {
  kvStore.clear();
  kvMocks.get.mockReset();
  kvMocks.set.mockReset();
  kvMocks.del.mockReset();

  kvMocks.get.mockImplementation(async (key: string) => kvStore.get(key) ?? null);
  kvMocks.set.mockImplementation(async (key: string, value: unknown) => {
    kvStore.set(key, value);
  });
  kvMocks.del.mockImplementation(async (key: string) => {
    kvStore.delete(key);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('dream board draft host-create normalization', () => {
  it('defaults legacy voucher drafts back to bank and strips charity residue from reads', async () => {
    kvStore.set(draftKey, {
      childName: 'Maya',
      giftName: 'Scooter',
      giftImageUrl: '/icons/gifts/scooter.png',
      payoutMethod: 'takealot_voucher',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      bankName: 'FNB',
      bankAccountNumberEncrypted: 'enc:123456',
      bankAccountLast4: '3456',
      bankBranchCode: '250655',
      bankAccountHolder: 'Maya Parent',
      charityEnabled: true,
      charityId: '00000000-0000-4000-8000-000000000001',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const draft = await getHostCreateDreamBoardDraft('host-1');

    expect(draft).toEqual({
      childName: 'Maya',
      giftName: 'Scooter',
      giftImageUrl: '/icons/gifts/scooter.png',
      payoutMethod: 'bank',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      bankName: 'FNB',
      bankAccountNumberEncrypted: 'enc:123456',
      bankAccountLast4: '3456',
      bankBranchCode: '250655',
      bankAccountHolder: 'Maya Parent',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(kvMocks.set).toHaveBeenCalledWith(
      draftKey,
      expect.objectContaining({
        payoutMethod: 'bank',
        bankName: 'FNB',
        bankAccountNumberEncrypted: 'enc:123456',
        charityEnabled: false,
        charityId: undefined,
      }),
      expect.any(Object)
    );
  });

  it('normalizes host-create writes to the selected payout route and clears inactive fields', async () => {
    kvStore.set(draftKey, {
      childName: 'Maya',
      payoutMethod: 'bank',
      bankName: 'FNB',
      bankAccountNumberEncrypted: 'enc:123456',
      bankAccountLast4: '3456',
      bankBranchCode: '250655',
      bankAccountHolder: 'Maya Parent',
      charityEnabled: true,
      charityId: '00000000-0000-4000-8000-000000000001',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const draft = await updateHostCreateDreamBoardDraft('host-1', {
      payoutMethod: 'karri_card',
      payoutEmail: 'parent@example.com',
      hostWhatsAppNumber: '+27821234567',
      karriCardNumberEncrypted: 'enc:card',
      karriCardHolderName: 'Maya Parent',
    });

    expect(draft).toEqual(
      expect.objectContaining({
        childName: 'Maya',
        payoutMethod: 'karri_card',
        payoutEmail: 'parent@example.com',
        hostWhatsAppNumber: '+27821234567',
        karriCardNumberEncrypted: 'enc:card',
        karriCardHolderName: 'Maya Parent',
      })
    );
    expect(draft?.bankName).toBeUndefined();
    expect(draft).not.toHaveProperty('charityEnabled');

    expect(kvStore.get(draftKey)).toEqual(
      expect.objectContaining({
        payoutMethod: 'karri_card',
        payoutEmail: 'parent@example.com',
        hostWhatsAppNumber: '+27821234567',
        karriCardNumberEncrypted: 'enc:card',
        karriCardHolderName: 'Maya Parent',
        bankName: undefined,
        charityEnabled: false,
        charityId: undefined,
      })
    );
  });
});
