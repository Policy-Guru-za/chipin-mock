type KvSetOptions = {
  ex?: number;
};

type KvZaddInput = {
  score: number;
  member: string;
};

type KvZrangeOptions = {
  withScores?: boolean;
};

type SortedSetEntry = {
  score: number;
  member: string;
};

type ExpiryMap = Map<string, number>;

const now = () => Date.now();


const purgeExpired = (
  key: string,
  store: Map<string, unknown>,
  sortedSets: Map<string, SortedSetEntry[]>,
  expiries: ExpiryMap
) => {
  const expiry = expiries.get(key);
  if (!expiry) return false;
  if (expiry > now()) return false;

  expiries.delete(key);
  store.delete(key);
  sortedSets.delete(key);
  return true;
};

export const createInMemoryKvAdapter = () => {
  const store = new Map<string, unknown>();
  const sortedSets = new Map<string, SortedSetEntry[]>();
  const expiries: ExpiryMap = new Map();

  const exists = (key: string) => store.has(key) || sortedSets.has(key);

  const set = async (key: string, value: unknown, options?: KvSetOptions) => {
    store.set(key, value);
    if (options?.ex) {
      expiries.set(key, now() + options.ex * 1000);
    } else {
      expiries.delete(key);
    }
    return 'OK';
  };

  const get = async <T>(key: string): Promise<T | null> => {
    if (purgeExpired(key, store, sortedSets, expiries)) return null;
    return (store.get(key) as T | undefined) ?? null;
  };

  const del = async (key: string) => {
    const removed = store.delete(key) || sortedSets.delete(key);
    expiries.delete(key);
    return removed ? 1 : 0;
  };

  const incr = async (key: string) => {
    if (purgeExpired(key, store, sortedSets, expiries)) {
      store.delete(key);
    }
    const current = Number(store.get(key) ?? 0);
    const next = Number.isFinite(current) ? current + 1 : 1;
    store.set(key, next);
    return next;
  };

  const expire = async (key: string, seconds: number, mode?: string) => {
    if (purgeExpired(key, store, sortedSets, expiries)) return 0;
    if (!exists(key)) return 0;
    if (mode === 'NX' && expiries.has(key)) return 0;
    expiries.set(key, now() + seconds * 1000);
    return 1;
  };

  const ttl = async (key: string) => {
    if (purgeExpired(key, store, sortedSets, expiries)) return -2;
    if (!exists(key)) return -2;
    const expiry = expiries.get(key);
    if (!expiry) return -1;
    return Math.ceil((expiry - now()) / 1000);
  };

  const zadd = async (key: string, value: KvZaddInput) => {
    if (purgeExpired(key, store, sortedSets, expiries)) {
      sortedSets.delete(key);
    }
    const entries = sortedSets.get(key) ?? [];
    const index = entries.findIndex((entry) => entry.member === value.member);
    if (index >= 0) {
      entries[index] = { score: value.score, member: value.member };
    } else {
      entries.push({ score: value.score, member: value.member });
    }
    entries.sort((a, b) => a.score - b.score);
    sortedSets.set(key, entries);
    return entries.length;
  };

  const zremrangebyscore = async (key: string, min: number, max: number) => {
    if (purgeExpired(key, store, sortedSets, expiries)) return 0;
    const entries = sortedSets.get(key) ?? [];
    const filtered = entries.filter((entry) => entry.score < min || entry.score > max);
    sortedSets.set(key, filtered);
    return entries.length - filtered.length;
  };

  const zcard = async (key: string) => {
    if (purgeExpired(key, store, sortedSets, expiries)) return 0;
    return (sortedSets.get(key) ?? []).length;
  };

  const zrange = async (
    key: string,
    start: number,
    stop: number,
    options?: KvZrangeOptions
  ) => {
    if (purgeExpired(key, store, sortedSets, expiries)) return [];
    const entries = sortedSets.get(key) ?? [];
    if (entries.length === 0) return [];

    const startIndex = start < 0 ? entries.length + start : start;
    const stopIndex = stop < 0 ? entries.length + stop : stop;
    if (startIndex >= entries.length) return [];

    const normalizedStart = Math.max(0, startIndex);
    const normalizedStop = Math.min(entries.length - 1, stopIndex);
    if (normalizedStop < 0 || normalizedStart > normalizedStop) return [];

    const slice = entries.slice(normalizedStart, normalizedStop + 1);

    if (options?.withScores) {
      return slice.map((entry) => ({ value: entry.member, score: entry.score }));
    }

    return slice.map((entry) => entry.member);
  };

  return {
    get,
    set,
    del,
    incr,
    expire,
    ttl,
    zadd,
    zremrangebyscore,
    zcard,
    zrange,
  };
};
