import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const verificationFilePath = resolve(process.cwd(), 'public/google5154e017d4f8496a.html');
const verificationFileBody = 'google-site-verification: google5154e017d4f8496a.html';

describe('google search console verification file', () => {
  it('publishes the exact verification file body from the site root public directory', () => {
    expect(existsSync(verificationFilePath)).toBe(true);
    expect(readFileSync(verificationFilePath, 'utf8')).toBe(verificationFileBody);
  });
});
