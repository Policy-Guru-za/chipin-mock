import { afterEach, describe, expect, it, vi } from 'vitest';

const neonMock = vi.fn(() => ({ sql: true }));
const drizzleNeonMock = vi.fn(() => ({ marker: 'db-neon' }));
const poolMock = vi.fn(function PoolMock() {
  return { marker: 'pool' };
});
const drizzlePgMock = vi.fn(() => ({ marker: 'db-pg' }));

vi.mock('@neondatabase/serverless', () => ({ neon: neonMock }));
vi.mock('drizzle-orm/neon-http', () => ({ drizzle: drizzleNeonMock }));
vi.mock('pg', () => ({ Pool: poolMock }));
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: drizzlePgMock }));

const loadDb = async () => {
  vi.resetModules();
  return import('@/lib/db');
};

describe('db', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalDriver = process.env.DATABASE_DRIVER;

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    process.env.DATABASE_DRIVER = originalDriver;
    vi.clearAllMocks();
  });

  it('throws when DATABASE_URL is not set', async () => {
    delete process.env.DATABASE_URL;

    const { db } = await loadDb();

    expect(() => (db as { marker: string }).marker).toThrow('DATABASE_URL is not set');
    expect(neonMock).not.toHaveBeenCalled();
    expect(poolMock).not.toHaveBeenCalled();
  });

  it('initializes once and reuses the neon drizzle instance by default', async () => {
    process.env.DATABASE_URL = 'postgres://example';
    delete process.env.DATABASE_DRIVER;

    const { db } = await loadDb();

    expect((db as { marker: string }).marker).toBe('db-neon');
    expect((db as { marker: string }).marker).toBe('db-neon');

    expect(neonMock).toHaveBeenCalledWith('postgres://example');
    expect(drizzleNeonMock).toHaveBeenCalledTimes(1);
    expect(poolMock).not.toHaveBeenCalled();
  });

  it('initializes pg drizzle when DATABASE_DRIVER is pg', async () => {
    process.env.DATABASE_URL = 'postgres://example';
    process.env.DATABASE_DRIVER = 'pg';

    const { db } = await loadDb();

    expect((db as { marker: string }).marker).toBe('db-pg');
    expect(poolMock).toHaveBeenCalledWith({ connectionString: 'postgres://example' });
    expect(drizzlePgMock).toHaveBeenCalledTimes(1);
    expect(neonMock).not.toHaveBeenCalled();
  });
});
