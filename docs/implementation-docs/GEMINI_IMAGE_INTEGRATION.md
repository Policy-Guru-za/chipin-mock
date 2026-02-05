# Gemini Image Integration

## Overview

Gifta generates gift artwork using **Gemini 2.5 Flash Image** via the Google Generative Language API. The integration lives in:

- `src/lib/integrations/image-generation.ts`
- `src/app/api/internal/artwork/generate/route.ts`

The flow:

1. Build a whimsical prompt (`STYLE_DIRECTIVE + giftDescription`).
2. Call `:generateContent` with `responseModalities: ['IMAGE']`.
3. Decode the base64 image payload.
4. Upload the image to Vercel Blob.
5. Return `{ imageUrl, prompt }` and persist against the Dream Board.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | API key for Google Generative Language API. |
| `GEMINI_IMAGE_MODEL` | optional | Defaults to `gemini-2.5-flash-image`. |

> Note: Image uploads require `BLOB_READ_WRITE_TOKEN` (handled elsewhere in integration setup).

## API Request Shape

Endpoint:

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

Body (simplified):

```json
{
  "contents": [{ "parts": [{ "text": "<full prompt>" }] }],
  "generationConfig": { "responseModalities": ["IMAGE"] }
}
```

Headers:

```
x-goog-api-key: <GEMINI_API_KEY>
Content-Type: application/json
```

## Error Handling & Retries

- Up to **3 attempts** with incremental backoff (`0.5s`, `1s`, `1.5s`).
- Retries on `429`, `500`, `502`, `503`.
- Fails fast on missing `inlineData` or malformed responses.

## Observability

- Logs `image_generation.retry` and `image_generation.request_failed` when retries occur.
- Logs `image_generation.completed` with `usageMetadata` when successful.

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `GEMINI_API_KEY is required` | Missing env var | Set `GEMINI_API_KEY` in env. |
| `Image generation response missing data` | API returned no image | Retry or check model access/quota. |
| `Image generation failed (429)` | Rate limit | Wait and retry; check usage quotas. |

## Security Notes

- Never log or expose the API key.
- Images are stored in Vercel Blob with public access URLs.
