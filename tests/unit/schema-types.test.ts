import { describe, expect, it } from 'vitest';

import { dreamBoards, karriCreditQueue } from '@/lib/db/schema';

describe('schema column types', () => {
  it('stores encrypted Karri card numbers as text columns', () => {
    expect(dreamBoards.karriCardNumber.getSQLType()).toBe('text');
    expect(karriCreditQueue.karriCardNumber.getSQLType()).toBe('text');
  });
});
