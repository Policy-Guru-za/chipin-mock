import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('admin charities query source', () => {
  it('qualifies outer charities id in correlated subqueries', () => {
    const source = readSource('src/lib/admin/service.ts');

    expect(source).toContain(`const charityIdReference = sql.raw('"charities"."id"');`);
    expect(source).toContain('db.charity_id = ${charityIdReference}');
    expect(source).toContain("p.recipient_data ->> 'charityId' = ${charityIdReference}");
  });
});
