import { isDemoMode } from '@/lib/demo';
import { demoKv } from '@/lib/demo/kv-mock';

export type KvLike = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
};

type KvExtras = {
  expire(key: string, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT'): Promise<number>;
  ttl(key: string): Promise<number>;
  zadd(key: string, value: { score: number; member: string }): Promise<number | null>;
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
  zcard(key: string): Promise<number>;
  zrange(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean }
  ): Promise<Array<string | { member: string; score: number }>>;
};

export type KvAdapter = KvLike & KvExtras;

let realKvPromise: Promise<KvAdapter> | null = null;

const getRealKv = async (): Promise<KvAdapter> => {
  if (!realKvPromise) {
    realKvPromise = import('@vercel/kv').then((mod) => {
      const resolved = (mod as { kv?: unknown; default?: unknown }).kv ??
        (mod as { default?: unknown }).default;
      if (!resolved) {
        throw new Error('KV client unavailable');
      }
      const kv = resolved as Record<string, (...args: any[]) => any>;
      const bindMethod = <T extends (...args: any[]) => any>(name: string) => {
        const method = kv[name];
        if (typeof method === 'function') {
          return method.bind(kv) as T;
        }
        return (async () => {
          throw new Error(`KV method ${name} unavailable`);
        }) as T;
      };
      return {
        get: bindMethod<KvAdapter['get']>('get'),
        set: async (key, value, opts) => {
          const method = bindMethod<(...args: any[]) => Promise<unknown>>('set');
          await method(key, value, opts as Parameters<typeof method>[2]);
        },
        del: async (key) => {
          const method = bindMethod<(...args: any[]) => Promise<unknown>>('del');
          await method(key);
        },
        incr: bindMethod<KvAdapter['incr']>('incr'),
        expire: bindMethod<KvAdapter['expire']>('expire'),
        ttl: bindMethod<KvAdapter['ttl']>('ttl'),
        zadd: bindMethod<KvAdapter['zadd']>('zadd'),
        zremrangebyscore: bindMethod<KvAdapter['zremrangebyscore']>('zremrangebyscore'),
        zcard: bindMethod<KvAdapter['zcard']>('zcard'),
        zrange: bindMethod<KvAdapter['zrange']>('zrange'),
      } satisfies KvAdapter;
    });
  }
  return realKvPromise!;
};

const hasRealKvCredentials = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const getKvClient = async (): Promise<KvAdapter> => {
  // Use real KV if credentials are available, even in demo mode
  // (needed for serverless session persistence on Vercel)
  if (hasRealKvCredentials()) {
    return getRealKv();
  }

  // Fall back to in-memory mock for local development without KV
  if (isDemoMode()) {
    return demoKv;
  }

  return getRealKv();
};

export const kvAdapter: KvAdapter = {
  get: async (key) => (await getKvClient()).get(key),
  set: async (key, value, opts) => (await getKvClient()).set(key, value, opts),
  del: async (key) => (await getKvClient()).del(key),
  incr: async (key) => (await getKvClient()).incr(key),
  expire: async (key, seconds, mode) => {
    const client = await getKvClient();
    if (mode === undefined) {
      return client.expire(key, seconds);
    }
    return client.expire(key, seconds, mode);
  },
  ttl: async (key) => (await getKvClient()).ttl(key),
  zadd: async (key, value) => (await getKvClient()).zadd(key, value),
  zremrangebyscore: async (key, min, max) =>
    (await getKvClient()).zremrangebyscore(key, min, max),
  zcard: async (key) => (await getKvClient()).zcard(key),
  zrange: async (key, start, stop, options) =>
    (await getKvClient()).zrange(key, start, stop, options),
};
