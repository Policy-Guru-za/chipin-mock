import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { eq, inArray } from 'drizzle-orm';

import { db } from '../../src/lib/db';
import { webhookEndpoints } from '../../src/lib/db/schema';
import {
  parseWebhookEndpointRollbackSnapshot,
  planWebhookEndpointRestore,
} from '../../src/lib/webhooks/rollback';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const dryRun = args.includes('--dry-run');

  const input = inputIndex >= 0 ? args[inputIndex + 1] ?? '' : '';
  if (!input) {
    throw new Error('Missing required --input <snapshot.json>');
  }

  return { input: path.resolve(process.cwd(), input), dryRun };
};

async function main() {
  const { input, dryRun } = parseArgs();
  const content = await readFile(input, 'utf8');
  const snapshot = parseWebhookEndpointRollbackSnapshot(content);
  const ids = snapshot.rows.map((row) => row.id);
  const existingRows =
    ids.length === 0
      ? []
      : await db
          .select({ id: webhookEndpoints.id })
          .from(webhookEndpoints)
          .where(inArray(webhookEndpoints.id, ids));

  const restorePlan = planWebhookEndpointRestore(
    snapshot,
    new Set(existingRows.map((row) => row.id))
  );

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          rowCount: restorePlan.length,
          input,
        },
        null,
        2
      )
    );
    return;
  }

  for (const row of restorePlan) {
    await db
      .update(webhookEndpoints)
      .set({
        events: row.events,
        isActive: row.isActive,
        updatedAt: new Date(),
      })
      .where(eq(webhookEndpoints.id, row.id));
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: false,
        rowCount: restorePlan.length,
        input,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error('Webhook endpoint restore failed', error);
  process.exit(1);
});
