import { describe, expect, it } from 'vitest';

import { PAYMENT_PROVIDER, PAYMENT_PROVIDERS, isContributionPaymentsLive } from '@/lib/payments';
import { STITCH_COMING_SOON_COPY } from '@/lib/payments/copy';

describe('payments placeholder contract', () => {
  it('pins contribution payments to Stitch-only placeholder mode', () => {
    expect(PAYMENT_PROVIDER).toBe('stitch');
    expect(PAYMENT_PROVIDERS).toEqual(['stitch']);
    expect(isContributionPaymentsLive()).toBe(false);
  });

  it('keeps the public coming-soon copy available', () => {
    expect(STITCH_COMING_SOON_COPY.badge).toBe('Stitch payments coming soon');
    expect(STITCH_COMING_SOON_COPY.body).toContain('Online payments are not available yet.');
  });
});
