import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCachedDreamBoardBySlug: vi.fn(),
  imageResponseCalls: [] as Array<{ element: unknown; options: { headers?: HeadersInit } }>,
}));

vi.mock('@/lib/dream-boards/cache', () => ({
  getCachedDreamBoardBySlug: mocks.getCachedDreamBoardBySlug,
}));

vi.mock('next/og', () => ({
  ImageResponse: class extends Response {
    constructor(element: unknown, options?: { headers?: HeadersInit }) {
      mocks.imageResponseCalls.push({ element, options: options ?? {} });
      super('png', {
        status: 200,
        headers: {
          'content-type': 'image/png',
          ...(options?.headers ?? {}),
        },
      });
    }
  },
}));

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/og/[slug]/route');
};

const collectImageSources = (node: unknown, acc: string[] = []): string[] => {
  if (!node || typeof node !== 'object') return acc;

  const candidate = node as { props?: { src?: unknown; children?: unknown } };
  const src = candidate.props?.src;
  if (typeof src === 'string') {
    acc.push(src);
  }

  const children = candidate.props?.children;
  if (Array.isArray(children)) {
    children.forEach((child) => collectImageSources(child, acc));
  } else if (children) {
    collectImageSources(children, acc);
  }

  return acc;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.imageResponseCalls.length = 0;
  mocks.getCachedDreamBoardBySlug.mockResolvedValue({
    id: 'board-1',
    slug: 'maya-birthday',
    childName: 'Maya',
    childPhotoUrl: 'https://images.example/child.jpg',
    giftName: 'Train set',
    giftImageUrl: '/icons/gifts/train.png',
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('GET /api/og/[slug]', () => {
  it('returns a png image and uses the forced system icon for curated boards', async () => {
    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('http://localhost/api/og/maya-birthday'), {
      params: Promise.resolve({ slug: 'maya-birthday' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
    expect(mocks.imageResponseCalls).toHaveLength(1);

    const imageSources = collectImageSources(mocks.imageResponseCalls[0]?.element);
    expect(imageSources).toContain('http://localhost/Logos/Original.png');
    expect(imageSources).toContain('https://images.example/child.jpg');
  });

  it('returns a png image and uses the forced system icon for gifta-logo boards', async () => {
    mocks.getCachedDreamBoardBySlug.mockResolvedValue({
      id: 'board-1',
      slug: 'maya-birthday',
      childName: 'Maya',
      childPhotoUrl: 'https://images.example/child.jpg',
      giftName: 'Train set',
      giftImageUrl: '/icons/gifts/gifta-logo.png',
    });

    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('http://localhost/api/og/maya-birthday'), {
      params: Promise.resolve({ slug: 'maya-birthday' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
    expect(mocks.imageResponseCalls).toHaveLength(1);

    const imageSources = collectImageSources(mocks.imageResponseCalls[0]?.element);
    expect(imageSources).toContain('http://localhost/Logos/Original.png');
  });

  it('uses trusted preview host before NEXT_PUBLIC_APP_URL when constructing absolute image urls', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gifta.co.za');
    vi.stubEnv('VERCEL_URL', 'chipin-mock.vercel.app');
    mocks.getCachedDreamBoardBySlug.mockResolvedValue({
      id: 'board-1',
      slug: 'maya-birthday',
      childName: 'Maya',
      childPhotoUrl: '/images/maya.jpg',
      giftName: 'Train set',
      giftImageUrl: '/icons/gifts/train.png',
    });

    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('https://chipin-mock.vercel.app/api/og/maya-birthday'), {
      params: Promise.resolve({ slug: 'maya-birthday' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
    expect(mocks.imageResponseCalls).toHaveLength(1);

    const imageSources = collectImageSources(mocks.imageResponseCalls[0]?.element);
    expect(imageSources).toContain('https://chipin-mock.vercel.app/Logos/Original.png');
    expect(imageSources).toContain('https://chipin-mock.vercel.app/images/maya.jpg');
    expect(imageSources.some((url) => url.includes('gifta.co.za'))).toBe(false);
  });

  it('ignores untrusted forwarded host values and falls back to trusted request host', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gifta.co.za');
    vi.stubEnv('VERCEL_URL', 'chipin-mock.vercel.app');
    mocks.getCachedDreamBoardBySlug.mockResolvedValue({
      id: 'board-1',
      slug: 'maya-birthday',
      childName: 'Maya',
      childPhotoUrl: '/images/maya.jpg',
      giftName: 'Train set',
      giftImageUrl: '/icons/gifts/train.png',
    });

    const { GET } = await loadHandler();
    const response = await GET(
      new NextRequest('https://chipin-mock.vercel.app/api/og/maya-birthday', {
        headers: {
          'x-forwarded-host': 'attacker.example',
          'x-forwarded-proto': 'https',
        },
      }),
      {
        params: Promise.resolve({ slug: 'maya-birthday' }),
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
    expect(mocks.imageResponseCalls).toHaveLength(1);

    const imageSources = collectImageSources(mocks.imageResponseCalls[0]?.element);
    expect(imageSources).toContain('https://chipin-mock.vercel.app/Logos/Original.png');
    expect(imageSources).toContain('https://chipin-mock.vercel.app/images/maya.jpg');
    expect(imageSources.some((url) => url.includes('attacker.example'))).toBe(false);
  });

  it('returns 404 when board is missing', async () => {
    mocks.getCachedDreamBoardBySlug.mockResolvedValue(null);

    const { GET } = await loadHandler();
    const response = await GET(new NextRequest('http://localhost/api/og/missing'), {
      params: Promise.resolve({ slug: 'missing' }),
    });

    expect(response.status).toBe(404);
    expect(mocks.imageResponseCalls).toHaveLength(0);
  });
});
