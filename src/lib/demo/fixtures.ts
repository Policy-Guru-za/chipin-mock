import type { TakealotProduct } from '@/lib/integrations/takealot';
import { buildDemoAssetUrl } from '@/lib/demo/urls';

export const DEMO_BLOB_PLACEHOLDER_URL = buildDemoAssetUrl('/images/child-placeholder.svg');

export const demoTakealotProducts: TakealotProduct[] = [
  {
    url: 'https://www.takealot.com/demo-dream-bike/PLID900001',
    name: 'Comet Kids Bike 16"',
    priceCents: 249900,
    imageUrl: DEMO_BLOB_PLACEHOLDER_URL,
    productId: '900001',
    inStock: true,
  },
  {
    url: 'https://www.takealot.com/demo-art-kit/PLID900002',
    name: 'Galaxy Art Kit Deluxe',
    priceCents: 89900,
    imageUrl: DEMO_BLOB_PLACEHOLDER_URL,
    productId: '900002',
    inStock: true,
  },
  {
    url: 'https://www.takealot.com/demo-storybook/PLID900003',
    name: 'Storybook Projector Bundle',
    priceCents: 129900,
    imageUrl: DEMO_BLOB_PLACEHOLDER_URL,
    productId: '900003',
    inStock: true,
  },
  {
    url: 'https://www.takealot.com/demo-picnic-set/PLID900004',
    name: 'Sunny Picnic Basket Set',
    priceCents: 109900,
    imageUrl: DEMO_BLOB_PLACEHOLDER_URL,
    productId: '900004',
    inStock: true,
  },
];
