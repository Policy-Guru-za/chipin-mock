import { describe, expect, it } from 'vitest';

import { getDaysUntilDateOnly, parseDateOnly } from '../../src/lib/utils/date';

describe('parseDateOnly', () => {
  it('parses valid date strings', () => {
    const result = parseDateOnly('2026-02-15');
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(1);
    expect(result?.getDate()).toBe(15);
  });

  it('rejects localized slash date strings', () => {
    expect(parseDateOnly('15/02/2026')).toBeNull();
  });

  it('rejects overflow dates', () => {
    expect(parseDateOnly('2026-02-30')).toBeNull();
  });

  it('rejects invalid months', () => {
    expect(parseDateOnly('2026-13-01')).toBeNull();
  });

  it('rejects invalid localized dates', () => {
    expect(parseDateOnly('31/02/2026')).toBeNull();
  });
});

describe('getDaysUntilDateOnly', () => {
  it('uses date-only semantics for countdown math', () => {
    const now = new Date(2026, 2, 17, 23, 59, 0);
    expect(getDaysUntilDateOnly('2026-03-18', now)).toBe(1);
  });

  it('returns zero for unsupported localized slash dates', () => {
    const now = new Date(2026, 2, 17, 23, 59, 0);
    expect(getDaysUntilDateOnly('18/03/2026', now)).toBe(0);
  });

  it('clamps past dates to zero', () => {
    const now = new Date(2026, 2, 17, 12, 0, 0);
    expect(getDaysUntilDateOnly('2026-03-16', now)).toBe(0);
  });
});
