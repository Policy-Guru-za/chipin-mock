import { describe, expect, it } from 'vitest';

import { buildDemoToken } from '../../src/lib/demo/tokens';

describe('buildDemoToken', () => {
  it('strips non-alphanumeric characters and trims length', () => {
    expect(buildDemoToken('abc-123_def-456-XYZ')).toBe('abc123def456');
  });

  it('returns a fallback token when input is empty', () => {
    expect(buildDemoToken('---')).toBe('000000');
  });
});
