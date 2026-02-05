import { describe, expect, it } from 'vitest';

import { isBankAccountNumberValid } from '../../src/lib/dream-boards/validation';

describe('isBankAccountNumberValid', () => {
  it('accepts account numbers with 6 to 20 digits', () => {
    expect(isBankAccountNumberValid('123456')).toBe(true);
    expect(isBankAccountNumberValid('12345678901234567890')).toBe(true);
  });

  it('rejects account numbers shorter than 6 digits', () => {
    expect(isBankAccountNumberValid('12345')).toBe(false);
  });

  it('rejects account numbers longer than 20 digits', () => {
    expect(isBankAccountNumberValid('123456789012345678901')).toBe(false);
  });
});
