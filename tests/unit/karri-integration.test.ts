import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { isMockKarri } from '@/lib/config/feature-flags';

import { topUpKarriCard, verifyKarriCard } from '../../src/lib/integrations/karri';

vi.mock('@/lib/config/feature-flags', () => ({ isMockKarri: vi.fn() }));

const mockFetch = vi.fn();
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

const buildResponse = (payload: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => payload,
  }) as Response;

describe('karri integration', () => {
  const isMockKarriMock = vi.mocked(isMockKarri);

  beforeAll(() => {
    global.fetch = mockFetch as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  });

  beforeEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    mockFetch.mockReset();
    isMockKarriMock.mockReset();
  });

  it('returns demo verification when mock mode is enabled', async () => {
    isMockKarriMock.mockReturnValue(true);

    await expect(verifyKarriCard('1234567890123456')).resolves.toEqual({
      valid: true,
      cardholderFirstName: 'Demo',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when verification credentials are missing', async () => {
    isMockKarriMock.mockReturnValue(false);
    delete process.env.KARRI_BASE_URL;
    delete process.env.KARRI_API_KEY;

    await expect(verifyKarriCard('1234567890123456')).rejects.toThrow(
      'Karri credentials are missing'
    );
  });

  it('rejects verification responses without a valid flag', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(buildResponse({}));

    await expect(verifyKarriCard('1234567890123456')).rejects.toThrow(
      'Karri verification response missing valid flag'
    );
  });

  it('rejects verification requests when the API responds with an error', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(buildResponse({}, false, 500));

    await expect(verifyKarriCard('1234567890123456')).rejects.toThrow(
      'Karri card verification failed (500)'
    );
  });

  it('parses successful verification responses', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(
      buildResponse({ valid: true, cardholderFirstName: 'Sam', errorCode: 'OK' })
    );

    await expect(verifyKarriCard('1234567890123456')).resolves.toEqual({
      valid: true,
      cardholderFirstName: 'Sam',
      errorCode: 'OK',
    });
  });

  it('returns demo top-up results when mock mode is enabled', async () => {
    isMockKarriMock.mockReturnValue(true);

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).resolves.toEqual({
      transactionId: 'DEMO-KARRI-ref123',
      status: 'completed',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when top-up credentials are missing', async () => {
    isMockKarriMock.mockReturnValue(false);
    delete process.env.KARRI_BASE_URL;
    delete process.env.KARRI_API_KEY;

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).rejects.toThrow('Karri credentials are missing');
  });

  it('rejects top-up requests when the API responds with an error', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(buildResponse({}, false, 503));

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).rejects.toThrow('Karri top-up failed (503)');
  });

  it('rejects top-up responses without a transaction id', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(buildResponse({ status: 'completed' }));

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).rejects.toThrow('Karri response missing transactionId');
  });

  it('rejects top-up responses with an invalid status', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(buildResponse({ transactionId: 'txn-1', status: 'unknown' }));

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).rejects.toThrow('Karri response missing status');
  });

  it('parses successful top-up responses', async () => {
    isMockKarriMock.mockReturnValue(false);
    process.env.KARRI_BASE_URL = 'https://karri.test';
    process.env.KARRI_API_KEY = 'token';
    mockFetch.mockResolvedValueOnce(
      buildResponse({ id: 'txn-2', status: 'pending', errorMessage: 'Queued' })
    );

    await expect(
      topUpKarriCard({
        cardNumber: '1234567890123456',
        amountCents: 2000,
        reference: 'ref123',
        description: 'Test top-up',
      })
    ).resolves.toEqual({
      transactionId: 'txn-2',
      status: 'pending',
      errorMessage: 'Queued',
    });
  });
});
