import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('guest contribution endpoint', () => {
  it('remains allowlisted in middleware', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/contributions/create'");
  });

  it('is not gated by job-secret auth', () => {
    const handler = readSource('src/app/api/internal/contributions/create/route.ts');
    expect(handler).not.toContain('INTERNAL_JOB_SECRET');
    expect(handler).not.toContain('requireInternalJobAuth');
  });
});
