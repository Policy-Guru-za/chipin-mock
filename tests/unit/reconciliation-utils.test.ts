import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const existsInRepo = (path: string) => existsSync(join(process.cwd(), path));

describe('legacy reconciliation removal', () => {
  it('removes the old reconciliation runtime and route surface', () => {
    expect(existsInRepo('src/lib/payments/reconciliation.ts')).toBe(false);
    expect(existsInRepo('src/app/api/internal/payments/reconcile/route.ts')).toBe(false);
  });
});
