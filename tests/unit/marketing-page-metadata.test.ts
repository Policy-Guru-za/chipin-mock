import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  HOMEPAGE_CANONICAL_URL,
  HOMEPAGE_SEARCH_DESCRIPTION,
  HOMEPAGE_SEARCH_METADATA,
  HOMEPAGE_SEARCH_STRUCTURED_DATA,
  HOMEPAGE_SEARCH_TITLE,
  HOMEPAGE_SOCIAL_DESCRIPTION,
  HOMEPAGE_SOCIAL_TITLE,
  serializeStructuredData,
} from '@/lib/metadata/homepage-search';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('marketing page metadata', () => {
  it('uses product-descriptive search metadata while preserving short social copy', () => {
    expect(HOMEPAGE_SEARCH_METADATA.title).toBe(HOMEPAGE_SEARCH_TITLE);
    expect(HOMEPAGE_SEARCH_METADATA.description).toBe(HOMEPAGE_SEARCH_DESCRIPTION);
    expect(HOMEPAGE_SEARCH_METADATA.alternates?.canonical).toBe(HOMEPAGE_CANONICAL_URL);
    expect(HOMEPAGE_SEARCH_METADATA.robots).toEqual({ index: true, follow: true });
    expect(HOMEPAGE_SEARCH_METADATA.openGraph?.title).toBe(HOMEPAGE_SOCIAL_TITLE);
    expect(HOMEPAGE_SEARCH_METADATA.openGraph?.description).toBe(HOMEPAGE_SOCIAL_DESCRIPTION);
    expect(HOMEPAGE_SEARCH_METADATA.openGraph?.siteName).toBe('Gifta');
    expect(HOMEPAGE_SEARCH_METADATA.twitter?.title).toBe(HOMEPAGE_SOCIAL_TITLE);
    expect(HOMEPAGE_SEARCH_METADATA.twitter?.description).toBe(HOMEPAGE_SOCIAL_DESCRIPTION);
  });

  it('defines homepage JSON-LD without organization-profile expansion', () => {
    const serialized = serializeStructuredData(HOMEPAGE_SEARCH_STRUCTURED_DATA);

    expect(serialized).toContain('"@type":"WebSite"');
    expect(serialized).toContain('"@type":"WebPage"');
    expect(serialized).toContain(HOMEPAGE_CANONICAL_URL);
    expect(serialized).toContain('"primaryImageOfPage"');
    expect(serialized).not.toContain('"Organization"');
    expect(serialized).not.toContain('"sameAs"');
  });

  it('wires the homepage metadata and structured data into the marketing route', () => {
    const pageSource = readSource('src/app/(marketing)/page.tsx');

    expect(pageSource).toContain('export const metadata = HOMEPAGE_SEARCH_METADATA;');
    expect(pageSource).toContain('type="application/ld+json"');
    expect(pageSource).toContain('HOMEPAGE_SEARCH_STRUCTURED_DATA');
  });
});
