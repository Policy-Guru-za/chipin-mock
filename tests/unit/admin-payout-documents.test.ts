import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
}));

const payoutMocks = vi.hoisted(() => ({
  getPayoutDetail: vi.fn(),
}));

const encryptionMocks = vi.hoisted(() => ({
  decryptSensitiveBuffer: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => authMocks);
vi.mock('@/lib/payouts/queries', () => payoutMocks);
vi.mock('@/lib/utils/encryption', () => encryptionMocks);

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/payouts/[id]/documents/[type]/route');
};

const mockArrayBuffer = () => {
  const buffer = Buffer.from('encrypted');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

const basePayout = {
  id: 'payout-1',
  type: 'karri_card',
  recipientData: {
    receiptUrl: 'https://blob.example/receipt.enc',
    receiptContentType: 'application/pdf',
    receiptFilename: 'receipt.pdf',
    receiptEncrypted: true,
  },
};

beforeEach(() => {
  authMocks.requireAdminSession.mockResolvedValue({
    hostId: 'admin-1',
    email: 'admin@chipin.co.za',
  });
  encryptionMocks.decryptSensitiveBuffer.mockReturnValue(Buffer.from('decrypted'));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('admin payout documents route', () => {
  it('returns not found for receipt requests', async () => {
    payoutMocks.getPayoutDetail.mockResolvedValue(basePayout);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => mockArrayBuffer() }))
    );

    const { GET } = await loadHandler();
    const response = await GET(new Request('http://localhost'), {
      params: { id: 'payout-1', type: 'receipt' },
    });

    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe('not_found');
  });

  it('returns 404 for invalid document type', async () => {
    payoutMocks.getPayoutDetail.mockResolvedValue(basePayout);

    const { GET } = await loadHandler();
    const response = await GET(new Request('http://localhost'), {
      params: { id: 'payout-1', type: 'unknown' },
    });

    expect(response.status).toBe(404);
  });

  it('returns 404 when receipt is missing', async () => {
    payoutMocks.getPayoutDetail.mockResolvedValue({
      ...basePayout,
      recipientData: { receiptEncrypted: true },
    });

    const { GET } = await loadHandler();
    const response = await GET(new Request('http://localhost'), {
      params: { id: 'payout-1', type: 'receipt' },
    });

    expect(response.status).toBe(404);
  });
});
