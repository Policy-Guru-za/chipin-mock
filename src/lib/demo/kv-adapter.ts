import { kv } from '@vercel/kv';

export type KvAdapter = typeof kv;

const kvConfigured =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN);
const useMockKv = process.env.NODE_ENV === 'development' && !kvConfigured;

let kvAdapter: KvAdapter = kv;

if (useMockKv) {
  const { createInMemoryKvAdapter } = await import('./kv-mock');
  kvAdapter = createInMemoryKvAdapter() as KvAdapter;
  console.warn('KV not configured. Using in-memory KV store for local development.');
}

export { kvAdapter };
