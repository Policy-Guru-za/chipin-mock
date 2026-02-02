import { describe, expect, it } from 'vitest';

import { isPartyDateWithinRange } from '../../src/lib/dream-boards/validation';

describe('isPartyDateWithinRange', () => {
  it('rejects today', () => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    expect(isPartyDateWithinRange(dateString)).toBe(false);
  });

  it('accepts tomorrow', () => {
    const date = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const dateString = date.toISOString().split('T')[0];
    expect(isPartyDateWithinRange(dateString)).toBe(true);
  });

  it('rejects dates beyond 6 months', () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 7);
    const dateString = date.toISOString().split('T')[0];
    expect(isPartyDateWithinRange(dateString)).toBe(false);
  });
});
