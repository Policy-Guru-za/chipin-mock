import { describe, expect, it } from 'vitest';

import { isPartyDateWithinRange } from '../../src/lib/dream-boards/validation';

const formatDateOnlyLocal = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

describe('isPartyDateWithinRange', () => {
  it('rejects today', () => {
    const today = new Date();
    const dateString = formatDateOnlyLocal(today);
    expect(isPartyDateWithinRange(dateString)).toBe(false);
  });

  it('accepts tomorrow', () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateString = formatDateOnlyLocal(date);
    expect(isPartyDateWithinRange(dateString)).toBe(true);
  });

  it('rejects dates beyond 6 months', () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 7);
    const dateString = formatDateOnlyLocal(date);
    expect(isPartyDateWithinRange(dateString)).toBe(false);
  });
});
