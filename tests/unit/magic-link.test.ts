import { createHash } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const kvMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zadd: vi.fn(),
  expire: vi.fn(),
  zrange: vi.fn(),
}));

const sendEmailMock = vi.hoisted(() => {
  class ResendApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ResendApiError';
    }
  }
  return { sendEmail: vi.fn(), ResendApiError };
});

const rateLimitMock = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock('@/lib/demo/kv-adapter', () => ({
  kvAdapter: kvMock,
}));

vi.mock('@/lib/integrations/email', () => sendEmailMock);
vi.mock('@/lib/auth/rate-limit', () => rateLimitMock);

import { sendMagicLink, verifyMagicLink } from '@/lib/auth/magic-link';

describe('verifyMagicLink', () => {
  beforeEach(() => {
    kvMock.get.mockReset();
    kvMock.set.mockReset();
    kvMock.del.mockReset();
    kvMock.zadd.mockReset();
    kvMock.expire.mockReset();
    kvMock.zrange.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns email without consuming the token', async () => {
    kvMock.get.mockResolvedValueOnce({
      email: 'host@example.com',
      createdAt: Date.now(),
      usedAt: null,
    });

    const result = await verifyMagicLink('token', { consume: false });

    expect(result).toBe('host@example.com');
    expect(kvMock.set).not.toHaveBeenCalled();
    expect(kvMock.zrange).not.toHaveBeenCalled();
  });

  it('consumes the token using keepTtl and xx', async () => {
    const token = 'token-123';
    const tokenHash = createHash('sha256').update(token).digest('hex');

    kvMock.get.mockResolvedValueOnce({
      email: 'host@example.com',
      createdAt: Date.now(),
      usedAt: null,
    });
    kvMock.set.mockResolvedValueOnce('OK');
    kvMock.zrange.mockResolvedValueOnce([tokenHash]);
    kvMock.del.mockResolvedValueOnce(1);

    const result = await verifyMagicLink(token, { consume: true });

    expect(result).toBe('host@example.com');
    expect(kvMock.set).toHaveBeenCalledWith(
      `magic:${tokenHash}`,
      expect.objectContaining({
        email: 'host@example.com',
        usedAt: expect.any(Number),
      }),
      { keepTtl: true, xx: true }
    );
  });

  it('consumes legacy string records without deleting the token', async () => {
    const token = 'legacy-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');

    kvMock.get.mockResolvedValueOnce('legacy@example.com');
    kvMock.set.mockResolvedValueOnce('OK');
    kvMock.zrange.mockResolvedValueOnce([tokenHash]);
    kvMock.del.mockResolvedValueOnce(1);

    const result = await verifyMagicLink(token, { consume: true });

    expect(result).toBe('legacy@example.com');
    expect(kvMock.set).toHaveBeenCalledWith(
      `magic:${tokenHash}`,
      expect.objectContaining({
        email: 'legacy@example.com',
        usedAt: expect.any(Number),
      }),
      { keepTtl: true, xx: true }
    );
    expect(kvMock.del).not.toHaveBeenCalledWith(`magic:${tokenHash}`);
  });

  it('retries lookup on transient misses', async () => {
    vi.useFakeTimers();
    const token = 'retry-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');

    kvMock.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        email: 'host@example.com',
        createdAt: Date.now(),
        usedAt: null,
      });

    const resultPromise = verifyMagicLink(token, { consume: false });
    await vi.advanceTimersByTimeAsync(150);
    const result = await resultPromise;

    expect(result).toBe('host@example.com');
    expect(kvMock.get).toHaveBeenCalledTimes(2);
    expect(kvMock.get).toHaveBeenNthCalledWith(1, `magic:${tokenHash}`);
    expect(kvMock.get).toHaveBeenNthCalledWith(2, `magic:${tokenHash}`);
  });
});

describe('sendMagicLink', () => {
  beforeEach(() => {
    kvMock.get.mockReset();
    kvMock.set.mockReset();
    kvMock.del.mockReset();
    kvMock.zadd.mockReset();
    kvMock.expire.mockReset();
    kvMock.zrange.mockReset();
    sendEmailMock.sendEmail.mockReset();
    rateLimitMock.enforceRateLimit.mockReset();
  });

  it('does not delete the token on network errors', async () => {
    rateLimitMock.enforceRateLimit.mockResolvedValue({ allowed: true });
    kvMock.set.mockResolvedValue('OK');
    kvMock.get.mockResolvedValue({
      email: 'host@example.com',
      createdAt: Date.now(),
      usedAt: null,
    });
    sendEmailMock.sendEmail.mockRejectedValue(new Error('network down'));

    const result = await sendMagicLink('host@example.com');

    expect(result).toEqual({ ok: false, reason: 'send_failed' });
    expect(kvMock.del).not.toHaveBeenCalled();
  });

  it('deletes the token on Resend API errors', async () => {
    rateLimitMock.enforceRateLimit.mockResolvedValue({ allowed: true });
    kvMock.set.mockResolvedValue('OK');
    kvMock.get.mockResolvedValue({
      email: 'host@example.com',
      createdAt: Date.now(),
      usedAt: null,
    });
    sendEmailMock.sendEmail.mockRejectedValue(new sendEmailMock.ResendApiError('bad request'));

    const result = await sendMagicLink('host@example.com');

    expect(result).toEqual({ ok: false, reason: 'send_failed' });
    expect(kvMock.del).toHaveBeenCalledTimes(1);
    expect(kvMock.del).toHaveBeenCalledWith(expect.stringMatching(/^magic:/));
  });
});
