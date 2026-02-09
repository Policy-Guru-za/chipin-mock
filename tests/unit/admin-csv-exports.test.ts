import { describe, expect, it } from 'vitest';

import { toCsv } from '@/app/(admin)/admin/_lib/csv';

describe('admin csv helpers', () => {
  it('returns header-only csv when there are no rows', () => {
    const csv = toCsv(['id', 'name'], []);
    expect(csv).toBe('id,name\n');
  });

  it('escapes commas, quotes, and line breaks', () => {
    const csv = toCsv(['id', 'name', 'note'], [
      {
        id: '1',
        name: 'Hope, Foundation',
        note: 'He said "hello"\nagain',
      },
    ]);

    expect(csv).toContain('"Hope, Foundation"');
    expect(csv).toContain('"He said ""hello""\nagain"');
  });
});
