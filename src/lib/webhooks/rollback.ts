import { z } from 'zod';

import {
  SUPPORTED_WEBHOOK_EVENT_TYPES,
  hasLegacyWebhookEventSelection,
  type SupportedWebhookEventType,
} from './contract';

type SnapshotCandidateRow = {
  id: string;
  apiKeyId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WebhookEndpointRollbackRow = {
  id: string;
  api_key_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WebhookEndpointRollbackSnapshot = {
  schema_version: 1;
  created_at: string;
  supported_events: SupportedWebhookEventType[];
  row_count: number;
  rows: WebhookEndpointRollbackRow[];
};

const rollbackRowSchema = z.object({
  id: z.string().uuid(),
  api_key_id: z.string().uuid(),
  url: z.string().url(),
  events: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const rollbackSnapshotSchema = z.object({
  schema_version: z.literal(1),
  created_at: z.string().datetime(),
  supported_events: z.array(
    z.enum([SUPPORTED_WEBHOOK_EVENT_TYPES[0], SUPPORTED_WEBHOOK_EVENT_TYPES[1]])
  ),
  row_count: z.number().int().nonnegative(),
  rows: z.array(rollbackRowSchema),
});

const sanitizeTicket = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');

export const createWebhookEndpointRollbackRows = (
  rows: readonly SnapshotCandidateRow[]
): WebhookEndpointRollbackRow[] =>
  rows
    .filter((row) => hasLegacyWebhookEventSelection(row.events))
    .map((row) => ({
      id: row.id,
      api_key_id: row.apiKeyId,
      url: row.url,
      events: [...row.events],
      is_active: row.isActive,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    }));

export const buildWebhookEndpointRollbackSnapshot = (
  rows: readonly WebhookEndpointRollbackRow[],
  createdAt = new Date()
): WebhookEndpointRollbackSnapshot => ({
  schema_version: 1,
  created_at: createdAt.toISOString(),
  supported_events: [...SUPPORTED_WEBHOOK_EVENT_TYPES],
  row_count: rows.length,
  rows: [...rows],
});

export const parseWebhookEndpointRollbackSnapshot = (
  input: string
): WebhookEndpointRollbackSnapshot => rollbackSnapshotSchema.parse(JSON.parse(input));

export const buildWebhookEndpointRollbackFilename = (params?: {
  createdAt?: Date;
  ticket?: string | null;
}) => {
  const createdAt = params?.createdAt ?? new Date();
  const ticket = params?.ticket ? `-${sanitizeTicket(params.ticket)}` : '';
  const timestamp = createdAt.toISOString().replace(/[:.]/g, '-');
  return `webhook-endpoints-rollback-${timestamp}${ticket}.json`;
};

export const planWebhookEndpointRestore = (
  snapshot: WebhookEndpointRollbackSnapshot,
  existingIds: ReadonlySet<string>
) => {
  const missingIds = snapshot.rows
    .map((row) => row.id)
    .filter((rowId) => !existingIds.has(rowId));

  if (missingIds.length > 0) {
    throw new Error(
      `Rollback snapshot references missing webhook rows: ${missingIds.join(', ')}`
    );
  }

  return snapshot.rows.map((row) => ({
    id: row.id,
    events: [...row.events],
    isActive: row.is_active,
  }));
};
