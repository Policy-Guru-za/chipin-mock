import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('middleware Clerk protect usage', () => {
  it('uses auth.protect and not auth().protect', () => {
    const middleware = readSource('src/middleware.ts');
    expect(middleware).toContain('auth.protect');
    expect(middleware).not.toContain('auth().protect');
  });

  it('does not branch on auth.protect return values', () => {
    const middleware = readSource('src/middleware.ts');
    expect(middleware).not.toContain('protectResponse');
    expect(middleware).not.toContain('if (protectResponse)');
  });
});
