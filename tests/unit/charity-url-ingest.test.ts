import { afterEach, describe, expect, it, vi } from 'vitest';

import { CharityUrlIngestError, ingestCharityWebsite } from '@/lib/charities/url-ingest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('charity url ingest', () => {
  it('rejects non-https URLs', async () => {
    await expect(ingestCharityWebsite('http://example.org')).rejects.toEqual(
      expect.objectContaining({
        code: 'invalid_protocol',
      }),
    );
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
  });
});
