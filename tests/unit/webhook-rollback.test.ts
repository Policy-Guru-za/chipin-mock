import { describe, expect, it } from 'vitest';

import {
  buildWebhookEndpointRollbackFilename,
  buildWebhookEndpointRollbackSnapshot,
  createWebhookEndpointRollbackRows,
  planWebhookEndpointRestore,
} from '@/lib/webhooks/rollback';

describe('webhook rollback helpers', () => {
  it('builds JSON-safe rollback rows and snapshot metadata', () => {
    const createdAt = new Date('2026-03-12T10:00:00.000Z');
    const updatedAt = new Date('2026-03-12T11:00:00.000Z');
    const rows = createWebhookEndpointRollbackRows([
      {
        id: '00000000-0000-4000-8000-000000000001',
        apiKeyId: '00000000-0000-4000-8000-000000000002',
        url: 'https://partner.example/webhooks',
        events: ['*', 'payout.completed'],
        isActive: true,
        createdAt,
        updatedAt,
      },
    ]);

    const snapshot = buildWebhookEndpointRollbackSnapshot(rows, createdAt);

    expect(snapshot.row_count).toBe(1);
    expect(snapshot.rows[0]).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      api_key_id: '00000000-0000-4000-8000-000000000002',
      url: 'https://partner.example/webhooks',
      events: ['*', 'payout.completed'],
      is_active: true,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
    });
    expect(buildWebhookEndpointRollbackFilename({ createdAt, ticket: 'CHG-123' })).toContain(
      'chg-123'
    );
  });

  it('fails restore planning when a snapshot row is missing from the target database', () => {
    const snapshot = buildWebhookEndpointRollbackSnapshot([
      {
        id: '00000000-0000-4000-8000-000000000001',
        api_key_id: '00000000-0000-4000-8000-000000000002',
        url: 'https://partner.example/webhooks',
        events: ['*'],
        is_active: true,
        created_at: new Date('2026-03-12T10:00:00.000Z').toISOString(),
        updated_at: new Date('2026-03-12T11:00:00.000Z').toISOString(),
      },
    ]);

    expect(() =>
      planWebhookEndpointRestore(snapshot, new Set(['00000000-0000-4000-8000-000000000099']))
    ).toThrow(/missing webhook rows/i);
  });

  it('replays restore rows with original events and active state', () => {
    const snapshot = buildWebhookEndpointRollbackSnapshot([
      {
        id: '00000000-0000-4000-8000-000000000001',
        api_key_id: '00000000-0000-4000-8000-000000000002',
        url: 'https://partner.example/webhooks',
        events: ['*', 'payout.completed'],
        is_active: false,
        created_at: new Date('2026-03-12T10:00:00.000Z').toISOString(),
        updated_at: new Date('2026-03-12T11:00:00.000Z').toISOString(),
      },
    ]);

    expect(
      planWebhookEndpointRestore(snapshot, new Set(['00000000-0000-4000-8000-000000000001']))
    ).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000001',
        events: ['*', 'payout.completed'],
        isActive: false,
      },
    ]);
  });
});
