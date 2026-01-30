import { seedDemoDatabase } from '../src/lib/db/seed-demo';

async function main() {
  await seedDemoDatabase();
  console.log('Demo seed completed');
}

main().catch((error) => {
  console.error('Demo seed failed', error);
  process.exit(1);
});
