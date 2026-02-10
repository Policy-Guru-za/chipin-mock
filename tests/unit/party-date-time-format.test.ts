import { describe, expect, it } from 'vitest';

import { formatPartyDateTime } from '@/lib/dream-boards/party-date-time';

describe('formatPartyDateTime', () => {
  it('formats values in the Johannesburg timezone', () => {
    expect(formatPartyDateTime('2026-06-12T23:30:00.000Z')).toBe('13 June 2026, 01:30');
  });

  it('returns null for invalid dates', () => {
    expect(formatPartyDateTime('not-a-date')).toBeNull();
  });

  it('returns null when value is empty', () => {
    expect(formatPartyDateTime(null)).toBeNull();
  });
});
