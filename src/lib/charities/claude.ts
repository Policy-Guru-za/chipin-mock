import { z } from 'zod';

import type { CharitySourcePage } from './url-ingest';

const CATEGORY_OPTIONS = ['Education', 'Health', 'Environment', 'Community', 'Other'] as const;

const rawDraftSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(12).max(500),
  category: z.string().trim().min(2).max(80),
  website: z.string().trim().url().optional().nullable(),
  logoUrl: z.string().trim().url().optional().nullable(),
  contactName: z.string().trim().min(2).max(120).optional().nullable(),
  contactEmail: z.string().trim().email().max(255).optional().nullable(),
});

const anthropicResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
    })
  ),
});

export type CharityCategory = (typeof CATEGORY_OPTIONS)[number];

export type CharityDraft = {
  name: string;
  description: string;
  category: CharityCategory;
  website: string | null;
  logoUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
};

export type CharityDraftGenerationErrorCode = 'missing_api_key' | 'provider_error' | 'invalid_output';

export class CharityDraftGenerationError extends Error {
  code: CharityDraftGenerationErrorCode;

  constructor(code: CharityDraftGenerationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const normalizeCategory = (value: string): CharityCategory => {
  const normalized = value.trim().toLowerCase();

  const match = CATEGORY_OPTIONS.find((option) => option.toLowerCase() === normalized);
  if (match) return match;

  if (normalized.includes('educat')) return 'Education';
  if (normalized.includes('health') || normalized.includes('medical')) return 'Health';
  if (normalized.includes('env') || normalized.includes('climate')) return 'Environment';
  if (normalized.includes('community') || normalized.includes('social')) return 'Community';
  return 'Other';
};

const stripCodeFences = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

const toPrompt = (page: CharitySourcePage) => {
  const snippet = page.textSnippet.length > 1_500 ? page.textSnippet.slice(0, 1_500) : page.textSnippet;

  return [
    'Extract a draft charity profile from the website content below.',
    'Return only JSON. No markdown, no explanation.',
    `Allowed categories: ${CATEGORY_OPTIONS.join(', ')}.`,
    'If uncertain, choose category Other.',
    'Keep description concise and factual (1-2 sentences, max 500 chars).',
    '',
    'Output schema:',
    '{',
    '  "name": string,',
    '  "description": string,',
    '  "category": string,',
    '  "website": string | null,',
    '  "logoUrl": string | null,',
    '  "contactName": string | null,',
    '  "contactEmail": string | null',
    '}',
    '',
    'Website metadata:',
    `- sourceUrl: ${page.sourceUrl}`,
    `- finalUrl: ${page.finalUrl}`,
    `- title: ${page.title ?? ''}`,
    `- metaDescription: ${page.description ?? ''}`,
    `- ogImage: ${page.ogImageUrl ?? ''}`,
    '',
    'Visible text snippet:',
    snippet,
  ].join('\n');
};

const extractTextFromAnthropicResponse = (payload: unknown) => {
  const parsed = anthropicResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CharityDraftGenerationError('provider_error', 'Claude returned an unexpected response payload.');
  }

  const textBlock = parsed.data.content.find((block) => block.type === 'text' && typeof block.text === 'string');
  if (!textBlock?.text) {
    throw new CharityDraftGenerationError('provider_error', 'Claude did not return draft text.');
  }

  return textBlock.text;
};

export const generateCharityDraftWithClaude = async (page: CharitySourcePage): Promise<CharityDraft> => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new CharityDraftGenerationError('missing_api_key', 'ANTHROPIC_API_KEY is not configured.');
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-sonnet-latest';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: toPrompt(page),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new CharityDraftGenerationError(
      'provider_error',
      `Claude draft generation failed with status ${response.status}.`
    );
  }

  const payload = await response.json();
  const rawText = extractTextFromAnthropicResponse(payload);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripCodeFences(rawText));
  } catch {
    throw new CharityDraftGenerationError('invalid_output', 'Claude returned invalid JSON for the charity draft.');
  }

  const draftParse = rawDraftSchema.safeParse(parsedJson);
  if (!draftParse.success) {
    throw new CharityDraftGenerationError('invalid_output', 'Claude returned a malformed charity draft payload.');
  }

  const draft = draftParse.data;

  return {
    name: draft.name,
    description: draft.description,
    category: normalizeCategory(draft.category),
    website: draft.website ?? page.finalUrl,
    logoUrl: draft.logoUrl ?? page.ogImageUrl,
    contactName: draft.contactName ?? null,
    contactEmail: draft.contactEmail ?? null,
  };
};
