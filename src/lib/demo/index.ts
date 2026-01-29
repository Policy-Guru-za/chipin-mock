const DEMO_MODE_VALUE = 'true';

export const isDemoMode = (): boolean => process.env.DEMO_MODE === DEMO_MODE_VALUE;

export const DEMO_MODE: boolean = process.env.DEMO_MODE === DEMO_MODE_VALUE;

const PRODUCTION_DENYLIST = ['prod', 'production'];

const isProductionDatabaseUrl = (databaseUrl: string): boolean => {
  const normalized = databaseUrl.toLowerCase();
  return PRODUCTION_DENYLIST.some((token) => normalized.includes(token));
};

export function assertNotProductionDb(): void {
  if (!DEMO_MODE) return;

  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (!databaseUrl.trim()) {
    throw new Error(
      'FATAL: DEMO_MODE requires DATABASE_URL to be set to a NON-PRODUCTION demo database.'
    );
  }

  const allowlistToken = process.env.DEMO_DB_ALLOWLIST_TOKEN?.trim();
  if (allowlistToken) {
    if (!databaseUrl.toLowerCase().includes(allowlistToken.toLowerCase())) {
      throw new Error(
        'FATAL: DEMO_MODE DATABASE_URL must include DEMO_DB_ALLOWLIST_TOKEN to confirm it is a demo database. Refusing to start.'
      );
    }
  }

  if (isProductionDatabaseUrl(databaseUrl)) {
    const message =
      'FATAL: DEMO_MODE cannot run against a production database. Refusing to start.';
    console.error(message);
    throw new Error(message);
  }
}
