import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

import { isDemoMode } from '@/lib/demo';
import { log } from '@/lib/observability/logger';

export type GeneratedImage = {
  imageUrl: string;
  prompt: string;
};

const STYLE_DIRECTIVE =
  'Create a whimsical, playful illustration in a watercolor and hand-drawn style. ' +
  'The image should feel warm, celebratory, and child-friendly. ' +
  'Do not create photorealistic images. Use soft colors and gentle shapes. ' +
  'The subject is: ';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const DEFAULT_MODEL = 'dall-e-3';

const getImageGenerationConfig = () => {
  const apiUrl = process.env.IMAGE_GENERATION_API_URL;
  const apiKey = process.env.IMAGE_GENERATION_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error('IMAGE_GENERATION_API_URL and IMAGE_GENERATION_API_KEY are required');
  }
  return {
    apiUrl,
    apiKey,
    model: process.env.IMAGE_GENERATION_MODEL ?? DEFAULT_MODEL,
  };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (request: () => Promise<Response>) => {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await request();
      if (response.ok) {
        return response;
      }

      if (![429, 500, 502, 503].includes(response.status) || attempt === MAX_ATTEMPTS) {
        const message = await response.text().catch(() => 'Image generation failed');
        throw new Error(message || `Image generation failed (${response.status})`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Image generation failed');
      if (attempt < MAX_ATTEMPTS) {
        await delay(BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error('Image generation failed');
};

const resolveImageBuffer = async (payload: { url?: string; b64_json?: string }) => {
  if (payload.url) {
    const imageResponse = await fetch(payload.url);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (payload.b64_json) {
    return Buffer.from(payload.b64_json, 'base64');
  }

  throw new Error('Image generation response missing image payload');
};

export async function generateGiftArtwork(giftDescription: string): Promise<GeneratedImage> {
  const fullPrompt = `${STYLE_DIRECTIVE}${giftDescription}`;

  if (isDemoMode()) {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1520694478169-84f29f7c44c5?auto=format&fit=crop&w=1200&q=80',
      prompt: fullPrompt,
    };
  }

  const { apiUrl, apiKey, model } = getImageGenerationConfig();

  const response = await fetchWithRetry(() =>
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
      }),
    })
  );

  const payload = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
    usage?: Record<string, number>;
  };

  const imagePayload = payload.data?.[0];
  if (!imagePayload) {
    throw new Error('Image generation response missing data');
  }

  const buffer = await resolveImageBuffer(imagePayload);
  const { url } = await put(`artwork/${nanoid()}.png`, buffer, {
    access: 'public',
    contentType: 'image/png',
  });

  log('info', 'image_generation.completed', {
    model,
    usage: payload.usage ?? null,
  });

  return { imageUrl: url, prompt: fullPrompt };
}
