import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const putMock = vi.hoisted(() => vi.fn());
const loggerMocks = vi.hoisted(() => ({
  log: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  put: putMock,
}));

vi.mock('nanoid', () => ({
  nanoid: () => 'image-id',
}));

vi.mock('@/lib/observability/logger', () => loggerMocks);

import { generateGiftArtwork } from '@/lib/integrations/image-generation';

const originalEnv = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL,
};

const createSuccessResponse = (payload: unknown) =>
  ({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(payload),
  }) as Response;

const createErrorResponse = (status: number, body = 'error') =>
  ({
    ok: false,
    status,
    text: vi.fn().mockResolvedValue(body),
  }) as Response;

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_IMAGE_MODEL = 'gemini-test-model';
  putMock.mockReset();
  loggerMocks.log.mockReset();
});

afterEach(() => {
  process.env.GEMINI_API_KEY = originalEnv.GEMINI_API_KEY;
  process.env.GEMINI_IMAGE_MODEL = originalEnv.GEMINI_IMAGE_MODEL;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('generateGiftArtwork', () => {
  it('returns imageUrl and prompt on success', async () => {
    const fetchMock = vi.fn(async () =>
      createSuccessResponse({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: Buffer.from('image').toString('base64'),
                  },
                },
              ],
            },
          },
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    putMock.mockResolvedValueOnce({ url: 'https://blob.example/art.png' });

    const result = await generateGiftArtwork('Lego castle');

    expect(result.imageUrl).toBe('https://blob.example/art.png');
    expect(result.prompt).toContain('The dream gift is: Lego castle');
    expect(putMock).toHaveBeenCalledWith(
      'artwork/image-id.png',
      expect.any(Buffer),
      expect.objectContaining({
        access: 'public',
        contentType: 'image/png',
      })
    );

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent'
    );
    expect(options.headers).toEqual({
      'x-goog-api-key': 'test-key',
      'Content-Type': 'application/json',
    });
  });

  it('retries on retryable errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createErrorResponse(429, 'rate limit'))
      .mockResolvedValueOnce(createErrorResponse(500, 'server error'))
      .mockResolvedValueOnce(
        createSuccessResponse({
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: Buffer.from('image').toString('base64'),
                    },
                  },
                ],
              },
            },
          ],
        })
      );
    vi.stubGlobal('fetch', fetchMock);
    putMock.mockResolvedValueOnce({ url: 'https://blob.example/art.png' });

    const result = await generateGiftArtwork('Skateboard');

    expect(result.imageUrl).toBe('https://blob.example/art.png');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const retryLogs = loggerMocks.log.mock.calls.filter(
      ([level, event]) => level === 'debug' && event === 'image_generation.retry'
    );
    expect(retryLogs.length).toBeGreaterThan(0);
  });

  it('throws when GEMINI_API_KEY is missing', async () => {
    process.env.GEMINI_API_KEY = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(generateGiftArtwork('Scooter')).rejects.toThrow('GEMINI_API_KEY is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
