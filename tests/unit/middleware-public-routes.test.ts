import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('middleware public routes', () => {
  it('allowlists legacy auth redirects', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/auth(.*)'");
  });

  it('allowlists create entry page', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/create'");
  });

  it('allowlists guest contribution create endpoint', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/contributions/create'");
  });
});
