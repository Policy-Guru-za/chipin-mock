'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type GiftArtworkGeneratorProps = {
  defaultDescription?: string;
  defaultImageUrl?: string;
  defaultPrompt?: string;
};

type ArtworkResponse = {
  imageUrl: string;
  prompt: string;
};

const MIN_DESCRIPTION_LENGTH = 10;

export const GiftArtworkGenerator = ({
  defaultDescription,
  defaultImageUrl,
  defaultPrompt,
}: GiftArtworkGeneratorProps) => {
  const [description, setDescription] = useState(defaultDescription ?? '');
  const [imageUrl, setImageUrl] = useState(defaultImageUrl ?? '');
  const [prompt, setPrompt] = useState(defaultPrompt ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = description.trim().length >= MIN_DESCRIPTION_LENGTH && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError('Add a few more details so we can generate the artwork.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/internal/artwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null;
        const fallback = payload?.message ?? payload?.error ?? 'Unable to generate artwork.';
        throw new Error(fallback);
      }

      const payload = (await response.json()) as ArtworkResponse;
      setImageUrl(payload.imageUrl);
      setPrompt(payload.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate artwork.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="giftDescription" className="text-sm font-medium text-text">
          Describe the dream gift
        </label>
        <Textarea
          id="giftDescription"
          name="giftDescription"
          placeholder="E.g., a red mountain bike with a basket and shiny streamers."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        <p className="text-xs text-text-muted">We’ll use this to generate playful artwork.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-border bg-white p-4">
        {imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border">
            <Image
              src={imageUrl}
              alt="Generated gift artwork"
              width={800}
              height={600}
              className="h-56 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-subtle text-sm text-text-muted">
            Generated artwork preview
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleGenerate} disabled={!canGenerate}>
            {isGenerating ? 'Generating…' : imageUrl ? 'Regenerate artwork' : 'Generate artwork'}
          </Button>
          <span className="text-xs text-text-muted">
            {imageUrl ? 'Looks good? You can regenerate anytime.' : 'Generation takes ~10 seconds.'}
          </span>
        </div>
      </div>

      <input type="hidden" name="giftImageUrl" value={imageUrl} />
      <input type="hidden" name="giftImagePrompt" value={prompt} />
    </div>
  );
};
