import 'dotenv/config';

import {
  DEV_SEED_ENCRYPTION_FALLBACK_KEY,
  ensureSeedEncryptionKeyForSeed,
} from './seed-env';
import { seedDatabase } from '../src/lib/db/seed';

async function main() {
  const { key, usedFallback } = ensureSeedEncryptionKeyForSeed();

  if (usedFallback && key === DEV_SEED_ENCRYPTION_FALLBACK_KEY) {
    console.warn(
      'CARD_DATA_ENCRYPTION_KEY was unset; using the development-only fallback key for pnpm db:seed.'
    );
  }

  await seedDatabase();
  console.log('Seed completed');
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
