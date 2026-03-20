export const DEV_SEED_ENCRYPTION_FALLBACK_KEY = 'gifta-dev-seed-only-card-data-key';

const hasValue = (value: string | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const ensureSeedEncryptionKeyForSeed = (env: NodeJS.ProcessEnv = process.env) => {
  if (hasValue(env.CARD_DATA_ENCRYPTION_KEY)) {
    return {
      key: env.CARD_DATA_ENCRYPTION_KEY,
      usedFallback: false,
    };
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('CARD_DATA_ENCRYPTION_KEY is required when running seeds in production.');
  }

  env.CARD_DATA_ENCRYPTION_KEY = DEV_SEED_ENCRYPTION_FALLBACK_KEY;

  return {
    key: env.CARD_DATA_ENCRYPTION_KEY,
    usedFallback: true,
  };
};
