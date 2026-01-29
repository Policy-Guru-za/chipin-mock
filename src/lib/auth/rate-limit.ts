import { kvAdapter } from '@/lib/demo/kv-adapter';

export type RateLimitConfig = {
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export async function enforceRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const count = await kvAdapter.incr(key);

  if (count === 1) {
    await kvAdapter.expire(key, config.windowSeconds);
  }

  if (count > config.limit) {
    const ttl = await kvAdapter.ttl(key);
    return {
      allowed: false,
      retryAfterSeconds: ttl > 0 ? ttl : config.windowSeconds,
    };
  }

  return { allowed: true };
}
