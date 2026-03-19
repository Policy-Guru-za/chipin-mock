import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const existsInRepo = (path: string) => existsSync(join(process.cwd(), path));

describe('legacy payment webhook removal', () => {
  it('removes provider-specific webhook utilities and routes', () => {
    expect(existsInRepo('src/lib/payments/webhook-utils.ts')).toBe(false);
    expect(existsInRepo('src/app/api/webhooks/payfast/route.ts')).toBe(false);
    expect(existsInRepo('src/app/api/webhooks/ozow/route.ts')).toBe(false);
    expect(existsInRepo('src/app/api/webhooks/snapscan/route.ts')).toBe(false);
  });
});
