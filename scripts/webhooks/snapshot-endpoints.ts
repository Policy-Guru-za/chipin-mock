import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { db } from '../../src/lib/db';
import { webhookEndpoints } from '../../src/lib/db/schema';
import {
  buildWebhookEndpointRollbackFilename,
  buildWebhookEndpointRollbackSnapshot,
  createWebhookEndpointRollbackRows,
} from '../../src/lib/webhooks/rollback';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const ticketIndex = args.indexOf('--ticket');
  const outDirIndex = args.indexOf('--out-dir');

  return {
    ticket: ticketIndex >= 0 ? args[ticketIndex + 1] ?? null : null,
    outDir:
      outDirIndex >= 0 ? args[outDirIndex + 1] ?? path.join(process.cwd(), 'tmp', 'rollback') : path.join(process.cwd(), 'tmp', 'rollback'),
  };
};

async function main() {
  const { ticket, outDir } = parseArgs();
  const rows = await db
    .select({
      id: webhookEndpoints.id,
      apiKeyId: webhookEndpoints.apiKeyId,
      url: webhookEndpoints.url,
      events: webhookEndpoints.events,
      isActive: webhookEndpoints.isActive,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
    })
    .from(webhookEndpoints);

  const snapshotRows = createWebhookEndpointRollbackRows(rows);
  const createdAt = new Date();
  const artifact = buildWebhookEndpointRollbackSnapshot(snapshotRows, createdAt);
  const filename = buildWebhookEndpointRollbackFilename({ createdAt, ticket });
  const outputPath = path.join(outDir, filename);

  await mkdir(outDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        rowCount: artifact.row_count,
        outputPath,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error('Webhook endpoint snapshot failed', error);
  process.exit(1);
});
