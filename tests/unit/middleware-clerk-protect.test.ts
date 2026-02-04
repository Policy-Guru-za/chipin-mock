import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('middleware Clerk protect usage', () => {
  it('uses auth.protect and not auth().protect', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain('auth.protect');
    expect(middleware).not.toContain('auth().protect');
  });
});
