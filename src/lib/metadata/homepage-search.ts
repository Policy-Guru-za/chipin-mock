import type { Metadata } from 'next';

import { CANONICAL_PRODUCTION_APP_URL, joinAppUrl } from '@/lib/utils/request';

export const HOMEPAGE_SEARCH_TITLE =
  'Gifta | Create a Dreamboard for one meaningful birthday gift';
export const HOMEPAGE_SEARCH_DESCRIPTION =
  'Create a Dreamboard and let friends and family chip in together for one meaningful birthday gift.';
export const HOMEPAGE_SOCIAL_TITLE = 'Gifta';
export const HOMEPAGE_SOCIAL_DESCRIPTION = 'Birthday gifting, simplified.';
export const HOMEPAGE_CANONICAL_URL = CANONICAL_PRODUCTION_APP_URL;

export const HOMEPAGE_SEARCH_METADATA: Metadata = {
  title: HOMEPAGE_SEARCH_TITLE,
  description: HOMEPAGE_SEARCH_DESCRIPTION,
  alternates: {
    canonical: HOMEPAGE_CANONICAL_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: HOMEPAGE_SOCIAL_TITLE,
    description: HOMEPAGE_SOCIAL_DESCRIPTION,
    url: HOMEPAGE_CANONICAL_URL,
    siteName: 'Gifta',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOMEPAGE_SOCIAL_TITLE,
    description: HOMEPAGE_SOCIAL_DESCRIPTION,
  },
};

export const HOMEPAGE_SEARCH_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${HOMEPAGE_CANONICAL_URL}#website`,
      name: 'Gifta',
      url: HOMEPAGE_CANONICAL_URL,
      description: HOMEPAGE_SEARCH_DESCRIPTION,
      inLanguage: 'en-ZA',
    },
    {
      '@type': 'WebPage',
      '@id': `${HOMEPAGE_CANONICAL_URL}#webpage`,
      name: HOMEPAGE_SEARCH_TITLE,
      url: HOMEPAGE_CANONICAL_URL,
      description: HOMEPAGE_SEARCH_DESCRIPTION,
      inLanguage: 'en-ZA',
      isPartOf: {
        '@id': `${HOMEPAGE_CANONICAL_URL}#website`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: joinAppUrl(HOMEPAGE_CANONICAL_URL, '/opengraph-image'),
      },
    },
  ],
} as const;

export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');
