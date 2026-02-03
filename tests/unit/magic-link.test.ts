import { createHash } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const kvMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zrange: vi.fn(),
}));

vi.mock('@/lib/demo/kv-adapter', () => ({
  kvAdapter: kvMock,
}));

import { verifyMagicLink } from '@/lib/auth/magic-link';

describe('verifyMagicLink', () => {
  beforeEach(() => {
    kvMock.get.mockReset();
    kvMock.set.mockReset();
    kvMock.del.mockReset();
    kvMock.zrange.mockReset();
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
});
