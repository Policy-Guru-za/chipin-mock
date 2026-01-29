type StoredEntry = {
  value: unknown;
  expiresAt?: number;
  type: 'value' | 'zset';
};

type ZSetValue = Map<string, number>;

const store = new Map<string, StoredEntry>();

const isExpired = (entry: StoredEntry) =>
  typeof entry.expiresAt === 'number' && Date.now() > entry.expiresAt;

const getEntry = (key: string): StoredEntry | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (isExpired(entry)) {
    store.delete(key);
    return null;
  }
  return entry;
};

const resolveRangeIndices = (length: number, start: number, stop: number) => {
  const normalizedStart = start < 0 ? length + start : start;
  const normalizedStop = stop < 0 ? length + stop : stop;
  const safeStart = Math.max(0, normalizedStart);
  const safeStop = Math.min(length - 1, normalizedStop);
  if (safeStart > safeStop || length <= 0) {
    return null;
  }
  return { start: safeStart, stop: safeStop };
};

const getZSet = (key: string): { zset: ZSetValue; entry: StoredEntry } => {
  const existing = getEntry(key);
  if (existing && existing.type === 'zset') {
    return { zset: existing.value as ZSetValue, entry: existing };
  }

  const zset = new Map<string, number>();
  const entry: StoredEntry = {
    value: zset,
    expiresAt: existing?.expiresAt,
    type: 'zset',
  };
  store.set(key, entry);
  return { zset, entry };
};

export const demoKv = {
  async get<T>(key: string): Promise<T | null> {
    const entry = getEntry(key);
    if (!entry) return null;
    return entry.value as T;
  },
  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
    const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : undefined;
    store.set(key, { value, expiresAt, type: 'value' });
  },
  async del(key: string): Promise<void> {
    store.delete(key);
  },
  async incr(key: string): Promise<number> {
    const entry = getEntry(key);
    const current = entry && typeof entry.value === 'number' ? entry.value : 0;
    const next = current + 1;
    const expiresAt = entry?.expiresAt;
    store.set(key, { value: next, expiresAt, type: 'value' });
    return next;
  },
  async expire(key: string, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT'): Promise<number> {
    const entry = getEntry(key);
    if (!entry) return 0;
    if (mode === 'NX' && entry.expiresAt) {
      return 0;
    }
    entry.expiresAt = Date.now() + seconds * 1000;
    store.set(key, entry);
    return 1;
  },
  async ttl(key: string): Promise<number> {
    const entry = getEntry(key);
    if (!entry) return -2;
    if (!entry.expiresAt) return -1;
    const remainingMs = entry.expiresAt - Date.now();
    if (remainingMs <= 0) {
      store.delete(key);
      return -2;
    }
    return Math.ceil(remainingMs / 1000);
  },
  async zadd(key: string, value: { score: number; member: string }): Promise<number> {
    const { zset } = getZSet(key);
    const exists = zset.has(value.member);
    zset.set(value.member, value.score);
    return exists ? 0 : 1;
  },
  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    const entry = getEntry(key);
    if (!entry || entry.type !== 'zset') return 0;
    const zset = entry.value as ZSetValue;
    let removed = 0;
    for (const [member, score] of zset.entries()) {
      if (score >= min && score <= max) {
        zset.delete(member);
        removed += 1;
      }
    }
    return removed;
  },
  async zcard(key: string): Promise<number> {
    const entry = getEntry(key);
    if (!entry || entry.type !== 'zset') return 0;
    const zset = entry.value as ZSetValue;
    return zset.size;
  },
  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean }
  ): Promise<Array<string | { member: string; score: number }>> {
    const entry = getEntry(key);
    if (!entry || entry.type !== 'zset') return [];
    const zset = entry.value as ZSetValue;
    const sorted = [...zset.entries()].sort((a, b) => a[1] - b[1]);
    const range = resolveRangeIndices(sorted.length, start, stop);
    if (!range) return [];
    const slice = sorted.slice(range.start, range.stop + 1);
    if (options?.withScores) {
      return slice.map(([member, score]) => ({ member, score }));
    }
    return slice.map(([member]) => member);
  },
  clear(): void {
    store.clear();
  },
};
