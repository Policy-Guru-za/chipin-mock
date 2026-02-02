import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  update: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  recordAuditEvent: vi.fn(),
}));

const payoutQueryMocks = vi.hoisted(() => ({
  getPayoutDetail: vi.fn(),
}));

const payoutServiceMocks = vi.hoisted(() => ({
  completePayout: vi.fn(),
  failPayout: vi.fn(),
}));

const karriBatchMocks = vi.hoisted(() => ({
  processKarriCreditByReference: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));
vi.mock('@/lib/audit', () => auditMocks);
vi.mock('@/lib/payouts/queries', () => payoutQueryMocks);
vi.mock('@/lib/payouts/service', () => payoutServiceMocks);
vi.mock('@/lib/integrations/karri-batch', () => karriBatchMocks);

const loadModule = async () => {
  vi.resetModules();
  return import('@/lib/payouts/automation');
};

const originalEnv = {
  KARRI_AUTOMATION_ENABLED: process.env.KARRI_AUTOMATION_ENABLED,
};

beforeEach(() => {
  const updateChain = { set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) };
  dbMock.update.mockReturnValue(updateChain);
});

afterEach(() => {
  process.env.KARRI_AUTOMATION_ENABLED = originalEnv.KARRI_AUTOMATION_ENABLED;
  vi.clearAllMocks();
});

describe('payout automation - karri', () => {
  it('executes Karri batch automation', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
    payoutQueryMocks.getPayoutDetail.mockResolvedValue({
      id: 'payout-2',
      type: 'karri_card',
      status: 'pending',
      netCents: 6500,
      payoutEmail: 'host@chipin.co.za',
      childName: 'Maya',
    });
    karriBatchMocks.processKarriCreditByReference.mockResolvedValue({
      status: 'completed',
      transactionId: 'K-123',
    });

    const { executeAutomatedPayout } = await loadModule();
    const result = await executeAutomatedPayout({
      payoutId: 'payout-2',
      actor: { type: 'admin' },
    });

    expect(karriBatchMocks.processKarriCreditByReference).toHaveBeenCalledWith(
      expect.objectContaining({ reference: 'payout-2' })
    );
    expect(result).toEqual({ payoutId: 'payout-2', status: 'completed', externalRef: 'K-123' });
  });

  it('returns pending status when Karri batch is processing', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
    payoutQueryMocks.getPayoutDetail.mockResolvedValue({
      id: 'payout-2b',
      type: 'karri_card',
      status: 'pending',
      netCents: 6500,
      payoutEmail: 'host@chipin.co.za',
      childName: 'Maya',
    });
    karriBatchMocks.processKarriCreditByReference.mockResolvedValue({
      status: 'pending',
      transactionId: 'K-456',
    });

    const { executeAutomatedPayout } = await loadModule();
    const result = await executeAutomatedPayout({
      payoutId: 'payout-2b',
      actor: { type: 'admin' },
    });

    expect(result).toEqual({ payoutId: 'payout-2b', status: 'pending', externalRef: 'K-456' });
  });

  it('returns failed status when Karri batch fails', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'true';
    payoutQueryMocks.getPayoutDetail.mockResolvedValue({
      id: 'payout-5',
      type: 'karri_card',
      status: 'pending',
      netCents: 6500,
      payoutEmail: 'host@chipin.co.za',
      childName: 'Maya',
    });
    karriBatchMocks.processKarriCreditByReference.mockResolvedValue({
      status: 'failed',
      errorMessage: 'Card declined',
    });

    const { executeAutomatedPayout } = await loadModule();
    const result = await executeAutomatedPayout({ payoutId: 'payout-5', actor: { type: 'admin' } });

    expect(result.status).toBe('failed');
  });
});

describe('payout automation - errors', () => {
  it('throws for unsupported payout types', async () => {
    payoutQueryMocks.getPayoutDetail.mockResolvedValue({
      id: 'payout-disabled',
      type: 'takealot_gift_card',
      status: 'pending',
      netCents: 5000,
      payoutEmail: 'host@chipin.co.za',
      recipientData: { email: 'host@chipin.co.za' },
      childName: 'Maya',
    });

    const { executeAutomatedPayout } = await loadModule();

    await expect(
      executeAutomatedPayout({ payoutId: 'payout-disabled', actor: { type: 'admin' } })
    ).rejects.toThrow('Unsupported payout type');
  });

  it('throws when Karri automation is disabled', async () => {
    process.env.KARRI_AUTOMATION_ENABLED = 'false';
    payoutQueryMocks.getPayoutDetail.mockResolvedValue({
      id: 'payout-disabled-karri',
      type: 'karri_card',
      status: 'pending',
      netCents: 5000,
      payoutEmail: 'host@chipin.co.za',
      childName: 'Maya',
    });

    const { executeAutomatedPayout } = await loadModule();

    await expect(
      executeAutomatedPayout({ payoutId: 'payout-disabled-karri', actor: { type: 'admin' } })
    ).rejects.toThrow('Automation disabled for payout type');
  });
});
