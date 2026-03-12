import { describe, expect, it } from 'vitest';

import {
  SUPPORTED_WEBHOOK_EVENT_TYPES,
  hasLegacyWebhookEventSelection,
  matchesWebhookEndpointEvent,
  normalizeWebhookEndpointEvents,
} from '@/lib/webhooks';

describe('webhook contract helpers', () => {
  it('keeps supported events in canonical order', () => {
    expect(normalizeWebhookEndpointEvents(['pot.funded', 'contribution.received'])).toEqual([
      'contribution.received',
      'pot.funded',
    ]);
  });

  it('expands wildcard selections and drops unsupported events', () => {
    expect(
      normalizeWebhookEndpointEvents(['dreamboard.created', '*', 'pot.funded', 'unknown'])
    ).toEqual([...SUPPORTED_WEBHOOK_EVENT_TYPES]);
  });

  it('flags legacy webhook selections', () => {
    expect(hasLegacyWebhookEventSelection(['contribution.received'])).toBe(false);
    expect(hasLegacyWebhookEventSelection(['*'])).toBe(true);
    expect(hasLegacyWebhookEventSelection(['payout.completed'])).toBe(true);
  });

  it('matches only supported events after normalization', () => {
    expect(matchesWebhookEndpointEvent(['*'], 'contribution.received')).toBe(true);
    expect(matchesWebhookEndpointEvent(['payout.completed'], 'contribution.received')).toBe(
      false
    );
    expect(matchesWebhookEndpointEvent(['contribution.received'], 'payout.completed')).toBe(
      false
    );
  });
});
