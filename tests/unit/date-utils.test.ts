import { describe, expect, it } from 'vitest';

import { parseDateOnly } from '../../src/lib/utils/date';

describe('parseDateOnly', () => {
  it('parses valid date strings', () => {
    const result = parseDateOnly('2026-02-15');
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(1);
    expect(result?.getDate()).toBe(15);
  });

  it('rejects overflow dates', () => {
    expect(parseDateOnly('2026-02-30')).toBeNull();
  });

  it('rejects invalid months', () => {
    expect(parseDateOnly('2026-13-01')).toBeNull();
  });
});
