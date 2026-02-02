const isEnabled = (value: string | undefined): boolean => value === 'true';
const hasValue = (value: string | undefined): boolean => Boolean(value && value.trim().length > 0);

let demoModeWarningShown = false;

const PRODUCTION_DENYLIST = ['prod', 'production'];

const isProductionDatabaseUrl = (databaseUrl: string): boolean => {
  const normalized = databaseUrl.toLowerCase();
  return PRODUCTION_DENYLIST.some((token) => normalized.includes(token));
};

const PAYMENT_PROVIDERS = [
  {
    name: 'PayFast',
    keys: ['PAYFAST_MERCHANT_ID', 'PAYFAST_MERCHANT_KEY'],
  },
  {
    name: 'Ozow',
    keys: [
      'OZOW_CLIENT_ID',
      'OZOW_CLIENT_SECRET',
      'OZOW_SITE_CODE',
      'OZOW_BASE_URL',
      'OZOW_WEBHOOK_SECRET',
    ],
  },
  {
    name: 'SnapScan',
    keys: ['SNAPSCAN_SNAPCODE', 'SNAPSCAN_WEBHOOK_AUTH_KEY'],
  },
];

const getMissingKeys = (keys: string[]) => keys.filter((key) => !hasValue(process.env[key]));
const hasAnyKey = (keys: string[]) => keys.some((key) => hasValue(process.env[key]));
const hasAllKeys = (keys: string[]) => keys.every((key) => hasValue(process.env[key]));

/** Returns true when payment providers should be mocked. */
export const isMockPayments = (): boolean => isEnabled(process.env.MOCK_PAYMENTS);

/** Returns true when payment webhook validation should be mocked. */
export const isMockPaymentWebhooks = (): boolean =>
  isEnabled(process.env.MOCK_PAYMENT_WEBHOOKS);

/** Returns true when Karri Card requests should be mocked. */
export const isMockKarri = (): boolean => isEnabled(process.env.MOCK_KARRI);

/** Returns true when Sentry reporting should be mocked. */
export const isMockSentry = (): boolean => isEnabled(process.env.MOCK_SENTRY);

/** Returns true when any sandbox mock flag is enabled. */
export const isAnyMockEnabled = (): boolean =>
  isMockPayments() || isMockPaymentWebhooks() || isMockKarri() || isMockSentry();

/** Returns true when the payment simulator should be available. */
export const isPaymentSimulatorEnabled = (): boolean => isMockPayments();

/**
 * @deprecated Use specific mock flags instead (isMockPayments, isMockKarri, etc.).
 */
export const isDemoMode = (): boolean => {
  if (!demoModeWarningShown && process.env.NODE_ENV === 'development') {
    demoModeWarningShown = true;
    console.warn('isDemoMode() is deprecated. Use isMockPayments(), isMockKarri(), etc.');
  }
  return false;
};

/** Ensure mock mode cannot point at production databases. */
export function assertNotProductionDb(): void {
  if (!isMockPayments() && !isMockKarri()) return;

  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (!databaseUrl.trim()) {
    throw new Error('FATAL: Mock mode requires DATABASE_URL to be set.');
  }

  if (isProductionDatabaseUrl(databaseUrl)) {
    const message =
      'FATAL: Mock mode cannot run against a production database. Refusing to start.';
    console.error(message);
    throw new Error(message);
  }
}

/** Validate startup configuration for required integrations. */
export const assertStartupConfig = (): void => {
  const issues: string[] = [];
  const isStrict = process.env.NODE_ENV === 'production';
  const warnOnly = !isStrict && process.env.NODE_ENV !== 'test';
  const kvConfigured = hasValue(process.env.KV_REST_API_URL) && hasValue(process.env.KV_REST_API_TOKEN);
  const allowKvFallback = process.env.NODE_ENV === 'development' && !kvConfigured;

  if (!hasValue(process.env.RESEND_API_KEY)) {
    issues.push('Missing RESEND_API_KEY (Resend email).');
  }

  if (!hasValue(process.env.BLOB_READ_WRITE_TOKEN)) {
    issues.push('Missing BLOB_READ_WRITE_TOKEN (Vercel Blob).');
  }

  if (!kvConfigured && !allowKvFallback) {
    issues.push('Missing KV_REST_API_URL or KV_REST_API_TOKEN (Vercel KV).');
  }

  if (!isMockKarri()) {
    const missingKarri = getMissingKeys(['KARRI_BASE_URL', 'KARRI_API_KEY']);
    if (missingKarri.length > 0) {
      issues.push(`Karri configuration incomplete. Missing: ${missingKarri.join(', ')}`);
    }
  }

  if (!isMockPayments()) {
    const configuredProviders: string[] = [];
    PAYMENT_PROVIDERS.forEach((provider) => {
      const missingKeys = getMissingKeys(provider.keys);
      if (missingKeys.length === 0 && hasAllKeys(provider.keys)) {
        configuredProviders.push(provider.name);
        return;
      }
      if (hasAnyKey(provider.keys)) {
        issues.push(`${provider.name} configuration incomplete. Missing: ${missingKeys.join(', ')}`);
      }
    });

    if (configuredProviders.length === 0) {
      issues.push(
        'No payment providers configured. Set PayFast (PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY), Ozow (OZOW_CLIENT_ID, OZOW_CLIENT_SECRET, OZOW_SITE_CODE, OZOW_BASE_URL, OZOW_WEBHOOK_SECRET), or SnapScan (SNAPSCAN_SNAPCODE, SNAPSCAN_WEBHOOK_AUTH_KEY).'
      );
    }
  }

  if (issues.length === 0) return;

  const message = `Startup configuration validation failed:\n- ${issues.join('\n- ')}`;
  if (isStrict) {
    throw new Error(message);
  }
  if (warnOnly) {
    console.warn(message);
  }
};
