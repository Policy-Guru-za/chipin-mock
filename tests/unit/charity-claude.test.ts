import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CharityDraftGenerationError,
  generateCharityDraftWithClaude,
} from '@/lib/charities/claude';

const sourcePage = {
  sourceUrl: 'https://example.org/about',
  finalUrl: 'https://example.org/about',
  domain: 'example.org',
  title: 'Example Charity',
  description: 'Helping local communities thrive.',
  ogImageUrl: 'https://example.org/logo.png',
  textSnippet: 'Example Charity supports families with food and education programs.',
};

describe('charity claude draft generation', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;
  const originalModel = process.env.ANTHROPIC_MODEL;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalApiKey;
    process.env.ANTHROPIC_MODEL = originalModel;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects malformed model output', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            content: [{ type: 'text', text: '{not-json' }],
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );

    await expect(generateCharityDraftWithClaude(sourcePage)).rejects.toEqual(
      expect.objectContaining<Partial<CharityDraftGenerationError>>({
        code: 'invalid_output',
      }),
    );
  });

  it('accepts valid structured output', async () => {
    const content = {
      name: 'Example Charity',
      description: 'We support local communities with education and food programs.',
      category: 'community',
      website: 'https://example.org',
      logoUrl: 'https://example.org/logo-new.png',
      contactName: 'Operations Team',
      contactEmail: 'ops@example.org',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            content: [{ type: 'text', text: JSON.stringify(content) }],
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );

    const draft = await generateCharityDraftWithClaude(sourcePage);

    expect(draft).toEqual({
      name: 'Example Charity',
      description: 'We support local communities with education and food programs.',
      category: 'Community',
      website: 'https://example.org',
      logoUrl: 'https://example.org/logo-new.png',
      contactName: 'Operations Team',
      contactEmail: 'ops@example.org',
    });
  });
});
