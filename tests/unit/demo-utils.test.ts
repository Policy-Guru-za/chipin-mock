import { afterEach, describe, expect, it } from 'vitest';

import { buildDemoToken } from '../../src/lib/demo/tokens';
import { buildDemoAssetUrl } from '../../src/lib/demo/urls';

const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (ORIGINAL_APP_URL === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  }
});

describe('buildDemoAssetUrl', () => {
  it('builds an absolute URL from NEXT_PUBLIC_APP_URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://demo.chipin.test/';

    expect(buildDemoAssetUrl('demo/path')).toBe('https://demo.chipin.test/demo/path');
  });

  it('falls back to localhost when app URL is missing', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(buildDemoAssetUrl('/demo/path')).toBe('http://localhost:3000/demo/path');
  });
});

describe('buildDemoToken', () => {
  it('strips non-alphanumeric characters and trims length', () => {
    expect(buildDemoToken('abc-123_def-456-XYZ')).toBe('abc123def456');
  });

  it('returns a fallback token when input is empty', () => {
    expect(buildDemoToken('---')).toBe('000000');
  });
});
