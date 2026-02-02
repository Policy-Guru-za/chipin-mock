import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

import { log } from '@/lib/observability/logger';

export type GeneratedImage = {
  imageUrl: string;
  prompt: string;
};

const STYLE_DIRECTIVE =
  'Create a whimsical, joyful illustration in a soft watercolor and hand-drawn style, ' +
  "perfect for a child's birthday celebration. The artwork should feel magical and " +
  'dream-like, as if depicting a cherished birthday wish come true. Use warm, ' +
  'cheerful colors with gentle shapes. Center the subject prominently. ' +
  'Do NOT create photorealistic images. ' +
  'The dream gift is: ';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const MAX_ERROR_BODY_LENGTH = 500;
const DEFAULT_MODEL = 'gemini-2.5-flash-image';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const getImageGenerationConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }
  return {
    apiKey,
    model: process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL,
  };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const trimErrorBody = (value: string) =>
  value.length > MAX_ERROR_BODY_LENGTH
    ? `${value.slice(0, MAX_ERROR_BODY_LENGTH)}...`
    : value;

const fetchWithRetry = async (request: () => Promise<Response>) => {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await request();
      if (response.ok) {
        return response;
      }

      const errorBody = await response.text().catch(() => 'Image generation failed');
      const errorMessage = errorBody || `Image generation failed (${response.status})`;
      const shouldRetry = [429, 500, 502, 503].includes(response.status);

      if (!shouldRetry || attempt === MAX_ATTEMPTS) {
        log('warn', 'image_generation.request_failed', {
          status: response.status,
          attempt,
          body: errorBody ? trimErrorBody(errorBody) : null,
        });
        throw new Error(errorMessage);
      }

      if (attempt < MAX_ATTEMPTS) {
        log('debug', 'image_generation.retry', {
          attempt,
          status: response.status,
        });
      }
      lastError = new Error(errorMessage);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Image generation failed');
      if (attempt < MAX_ATTEMPTS) {
        log('debug', 'image_generation.retry', {
          attempt,
          error: lastError.message,
        });
        await delay(BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error('Image generation failed');
};

const resolveImageBuffer = (payload?: { inlineData?: { data?: string } }) => {
  const inlineData = payload?.inlineData?.data;
  if (!inlineData) {
    throw new Error('Image generation response missing image payload');
  }
  return Buffer.from(inlineData, 'base64');
};

export async function generateGiftArtwork(giftDescription: string): Promise<GeneratedImage> {
  const fullPrompt = `${STYLE_DIRECTIVE}${giftDescription}`;

  const { apiKey, model } = getImageGenerationConfig();

  const response = await fetchWithRetry(() =>
    fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    })
  );

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            mimeType?: string;
            data?: string;
          };
        }>;
      };
    }>;
    usageMetadata?: Record<string, number>;
  };

  const imagePayload = payload.candidates?.[0]?.content?.parts?.find(
    (part) => Boolean(part.inlineData?.data)
  );
  if (!imagePayload) {
    throw new Error('Image generation response missing data');
  }

  const buffer = resolveImageBuffer(imagePayload);
  const { url } = await put(`artwork/${nanoid()}.png`, buffer, {
    access: 'public',
    contentType: 'image/png',
  });

  log('info', 'image_generation.completed', {
    model,
    usage: payload.usageMetadata ?? null,
  });

  return { imageUrl: url, prompt: fullPrompt };
}
