import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/og/[slug]/route');
};

afterEach(() => {
  vi.unmock('@/lib/dream-boards/cache');
  vi.resetModules();
});

describe('GET /api/og/[slug]', () => {
  it('returns a png image when board exists', async () => {
    vi.doMock('@/lib/dream-boards/cache', () => ({
      getCachedDreamBoardBySlug: vi.fn(async () => ({
        id: 'board-1',
        slug: 'maya-birthday',
        childName: 'Maya',
        childPhotoUrl: 'https://images.example/child.jpg',
        giftName: 'Train set',
        giftImageUrl: '/icons/gifts/train.png',
      })),
    }));

    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('http://localhost/api/og/maya-birthday'), {
      params: Promise.resolve({ slug: 'maya-birthday' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
  });

  it('returns 404 when board is missing', async () => {
    vi.doMock('@/lib/dream-boards/cache', () => ({
      getCachedDreamBoardBySlug: vi.fn(async () => null),
    }));

    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('http://localhost/api/og/missing'), {
      params: Promise.resolve({ slug: 'missing' }),
    });

    expect(response.status).toBe(404);
  });
});
