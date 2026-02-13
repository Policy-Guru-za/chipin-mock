import { afterEach, describe, expect, it, vi } from 'vitest';

import { CharityUrlIngestError, ingestCharityWebsite } from '@/lib/charities/url-ingest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('charity url ingest', () => {
  it('rejects non-http(s) URLs', async () => {
    await expect(ingestCharityWebsite('ftp://93.184.216.34/about')).rejects.toEqual(
      expect.objectContaining({
        code: 'invalid_protocol',
      }),
    );
  });

  it('accepts http URLs', async () => {
    const html = `
      <html>
        <head>
          <title>Reach for a Dream</title>
        </head>
        <body>
          <h1>Reach for a Dream</h1>
        </body>
      </html>
    `;

    const fetchMock = vi.fn(async () =>
      new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await ingestCharityWebsite('http://93.184.216.34/about');

    expect(fetchMock).toHaveBeenCalled();
    expect(result.title).toBe('Reach for a Dream');
  });

  it('rejects localhost and private hosts', async () => {
    await expect(ingestCharityWebsite('https://localhost/charity')).rejects.toEqual(
      expect.objectContaining<Partial<CharityUrlIngestError>>({
        code: 'forbidden_host',
      }),
    );
  });

  it('extracts title/description/og image/text from a valid page', async () => {
    const html = `
      <html>
        <head>
          <title>Reach for a Dream</title>
          <meta name="description" content="Supporting children with chronic illnesses." />
          <meta property="og:image" content="/images/logo.png" />
        </head>
        <body>
          <h1>Reach for a Dream</h1>
          <p>We create moments of joy and support for children and families.</p>
        </body>
      </html>
    `;

    const fetchMock = vi.fn(async () =>
      new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await ingestCharityWebsite('https://93.184.216.34/about');

    expect(fetchMock).toHaveBeenCalled();
    expect(result.title).toBe('Reach for a Dream');
    expect(result.description).toBe('Supporting children with chronic illnesses.');
    expect(result.ogImageUrl).toBe('https://93.184.216.34/images/logo.png');
    expect(result.textSnippet).toContain('Reach for a Dream');
    expect(result.ingest).toEqual(
      expect.objectContaining({
        bytesRead: expect.any(Number),
        truncated: false,
      }),
    );
  });

  it('truncates large pages (content-length present) instead of failing', async () => {
    const bigChunk = 'a'.repeat(2_250_000);
    const html = `<html><head><title>Big Site</title></head><body>${bigChunk}</body></html>`;

    const fetchMock = vi.fn(async () =>
      new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'content-length': String(Buffer.byteLength(html, 'utf8')),
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await ingestCharityWebsite('https://93.184.216.34/big');

    expect(result.title).toBe('Big Site');
    expect(result.ingest.truncated).toBe(true);
    expect(result.ingest.bytesRead).toBeLessThanOrEqual(2_000_000);
    expect(result.textSnippet.length).toBeGreaterThan(0);
  });

  it('truncates large pages (no content-length) instead of failing', async () => {
    const bigChunk = 'a'.repeat(2_250_000);
    const html = `<html><head><title>Big Site</title></head><body>${bigChunk}</body></html>`;

    const fetchMock = vi.fn(async () =>
      new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await ingestCharityWebsite('https://93.184.216.34/big-no-length');

    expect(result.title).toBe('Big Site');
    expect(result.ingest.truncated).toBe(true);
    expect(result.ingest.bytesRead).toBeLessThanOrEqual(2_000_000);
    expect(result.textSnippet.length).toBeGreaterThan(0);
  });
});
