import { afterEach, describe, expect, it, vi } from 'vitest';

import { createInMemoryKvAdapter } from '@/lib/demo/kv-mock';

describe('in-memory kv adapter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('respects NX and XX set modes', async () => {
    const kv = createInMemoryKvAdapter();

    await expect(kv.set('a', 'first', { nx: true })).resolves.toBe('OK');
    await expect(kv.set('a', 'second', { nx: true })).resolves.toBeNull();

    await expect(kv.set('missing', 'value', { xx: true })).resolves.toBeNull();
    await expect(kv.set('a', 'updated', { xx: true })).resolves.toBe('OK');
    await expect(kv.get<string>('a')).resolves.toBe('updated');
  });

  it('supports ttl + keepTtl semantics', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const kv = createInMemoryKvAdapter();

    await expect(kv.set('k', 'v', { ex: 60 })).resolves.toBe('OK');
    await expect(kv.ttl('k')).resolves.toBe(60);

    vi.setSystemTime(new Date('2026-01-01T00:00:10.000Z'));
    await expect(kv.set('k', 'v2', { keepTtl: true })).resolves.toBe('OK');
    await expect(kv.ttl('k')).resolves.toBe(50);

    await expect(kv.expire('k', 30, 'NX')).resolves.toBe(0);
    await expect(kv.del('k')).resolves.toBe(1);
    await expect(kv.ttl('k')).resolves.toBe(-2);
  });

  it('expires keys and handles incr fallback for non-numeric values', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const kv = createInMemoryKvAdapter();

    await kv.set('counter', 'abc');
    await expect(kv.incr('counter')).resolves.toBe(1);

    await kv.set('temp', 1, { ex: 1 });
    vi.setSystemTime(new Date('2026-01-01T00:00:02.000Z'));
    await expect(kv.get<number>('temp')).resolves.toBeNull();
    await expect(kv.expire('temp', 5)).resolves.toBe(0);
  });

  it('supports sorted set workflows including score ranges and withScores output', async () => {
    const kv = createInMemoryKvAdapter();

    await expect(kv.zadd('scores', { member: 'a', score: 10 })).resolves.toBe(1);
    await expect(kv.zadd('scores', { member: 'b', score: 20 })).resolves.toBe(2);
    await expect(kv.zadd('scores', { member: 'a', score: 30 })).resolves.toBe(2);

    await expect(kv.zcard('scores')).resolves.toBe(2);
    await expect(kv.zrange('scores', 0, -1)).resolves.toEqual(['b', 'a']);
    await expect(kv.zrange('scores', 0, 1, { withScores: true })).resolves.toEqual([
      { value: 'b', score: 20 },
      { value: 'a', score: 30 },
    ]);

    await expect(kv.zremrangebyscore('scores', 25, 35)).resolves.toBe(1);
    await expect(kv.zrange('scores', 0, -1)).resolves.toEqual(['b']);
    await expect(kv.zrange('scores', 5, 10)).resolves.toEqual([]);
  });
});
