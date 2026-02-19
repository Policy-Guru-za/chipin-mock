import { describe, expect, it } from 'vitest';

import { buildDreamBoardMetadata } from '@/lib/dream-boards/metadata';

describe('buildDreamBoardMetadata', () => {
  it('uses gift metadata when the goal is funded', () => {
    const metadata = buildDreamBoardMetadata(
      {
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: '/kids/maya.jpg',
        giftName: 'Wooden Scooter',
        giftImageUrl: '/products/scooter.jpg',
        giftImagePrompt: null,
        goalCents: 5000,
        raisedCents: 7500,
      },
      { baseUrl: 'http://localhost:3000', path: '/maya-birthday-123/contribute' }
    );

    expect(metadata.description).toContain("Maya's Wooden Scooter");
    expect(metadata.openGraph?.url).toBe('http://localhost:3000/maya-birthday-123/contribute');
    expect(metadata.openGraph?.images?.[0]?.url).toBe('http://localhost:3000/api/og/maya-birthday-123');
    expect(metadata.openGraph?.images?.[0]?.alt).toBe('Dream gift');
  });

  it('builds absolute urls from the runtime base url for preview hosts', () => {
    const metadata = buildDreamBoardMetadata(
      {
        slug: 'maya-birthday-123',
        childName: 'Maya',
        childPhotoUrl: '/kids/maya.jpg',
        giftName: 'Wooden Scooter',
        giftImageUrl: '/products/scooter.jpg',
        goalCents: 5000,
        raisedCents: 7500,
      },
      { baseUrl: 'https://chipin-mock.vercel.app', path: '/maya-birthday-123' }
    );

    expect(metadata.openGraph?.url).toBe('https://chipin-mock.vercel.app/maya-birthday-123');
    expect(metadata.openGraph?.images?.[0]?.url).toBe(
      'https://chipin-mock.vercel.app/api/og/maya-birthday-123'
    );
    expect(metadata.twitter?.images).toEqual([
      'https://chipin-mock.vercel.app/api/og/maya-birthday-123',
    ]);
  });
});
