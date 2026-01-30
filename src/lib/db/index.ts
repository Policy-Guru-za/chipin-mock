import { neon } from '@neondatabase/serverless';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type { NeonHttpQueryResultHKT } from 'drizzle-orm/neon-http';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

type Database = PgDatabase<NeonHttpQueryResultHKT | NodePgQueryResultHKT, typeof schema>;

let dbInstance: Database | null = null;

const initDb = (): Database => {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  if (process.env.DATABASE_DRIVER === 'pg') {
    const pool = new Pool({ connectionString });
    dbInstance = drizzlePg(pool, { schema });
    return dbInstance;
  }

  const sql = neon(connectionString);
  dbInstance = drizzleNeon(sql, { schema });
  return dbInstance;
};

export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    return Reflect.get(initDb(), prop);
  },
});
