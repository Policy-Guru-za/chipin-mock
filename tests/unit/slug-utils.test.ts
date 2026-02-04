import { describe, expect, it } from 'vitest';

import { generateSlug } from '../../src/lib/utils/slug';

describe('generateSlug', () => {
  it('builds a slug from the child name', () => {
    const slug = generateSlug('Maya Rose');
    expect(slug).toMatch(/^maya-rose-birthday-/);
  });

  it('falls back to the dream prefix when the name is empty', () => {
    const slug = generateSlug('!!!');
    expect(slug).toMatch(/^dream-birthday-/);
  });
});
