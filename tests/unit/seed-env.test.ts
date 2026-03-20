import { describe, expect, it } from 'vitest';

import {
  DEV_SEED_ENCRYPTION_FALLBACK_KEY,
  ensureSeedEncryptionKeyForSeed,
} from '../../scripts/seed-env';

describe('ensureSeedEncryptionKeyForSeed', () => {
  it('keeps an explicit encryption key', () => {
    const env = {
      NODE_ENV: 'development',
      CARD_DATA_ENCRYPTION_KEY: 'existing-seed-key',
    } as NodeJS.ProcessEnv;

    const result = ensureSeedEncryptionKeyForSeed(env);

    expect(result).toEqual({
      key: 'existing-seed-key',
      usedFallback: false,
    });
    expect(env.CARD_DATA_ENCRYPTION_KEY).toBe('existing-seed-key');
  });

  it('sets the development fallback key when the env value is missing', () => {
    const env = {
      NODE_ENV: 'development',
    } as NodeJS.ProcessEnv;

    const result = ensureSeedEncryptionKeyForSeed(env);

    expect(result).toEqual({
      key: DEV_SEED_ENCRYPTION_FALLBACK_KEY,
      usedFallback: true,
    });
    expect(env.CARD_DATA_ENCRYPTION_KEY).toBe(DEV_SEED_ENCRYPTION_FALLBACK_KEY);
  });

  it('throws in production when the encryption key is missing', () => {
    const env = {
      NODE_ENV: 'production',
    } as NodeJS.ProcessEnv;

    expect(() => ensureSeedEncryptionKeyForSeed(env)).toThrow(/CARD_DATA_ENCRYPTION_KEY/);
  });
});
