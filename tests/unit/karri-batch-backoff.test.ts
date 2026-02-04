import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('karri batch backoff', () => {
  it('guards pending selection with lastAttemptAt backoff', () => {
    const source = readSource('src/lib/integrations/karri-batch.ts');
    expect(source).toContain('PENDING_RETRY_BACKOFF_MS');
    expect(source).toContain('lastAttemptAt');
    expect(source).toContain('retryCutoff');
  });
});
