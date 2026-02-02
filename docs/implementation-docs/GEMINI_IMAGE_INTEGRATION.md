# Gemini 2.5 Flash Image Integration

## Overview
ChipIn uses Gemini 2.5 Flash Image ("Nano Banana") to generate AI artwork for dream gifts.
The integration calls the Gemini `generateContent` endpoint and uploads the image to Vercel Blob.

## Prompt
The prompt is optimized for a celebratory, dream-gift style and should remain consistent:

```
Create a whimsical, joyful illustration in a soft watercolor and hand-drawn style,
perfect for a child's birthday celebration. The artwork should feel magical and
dream-like, as if depicting a cherished birthday wish come true. Use warm,
cheerful colors with gentle shapes. Center the subject prominently.
Do NOT create photorealistic images.

The dream gift is: <giftDescription>
```

## Environment Variables

```
GEMINI_API_KEY="<google-ai-studio-api-key>"
GEMINI_IMAGE_MODEL="gemini-2.5-flash-image"
```

## API Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent
```

## Request Format

```json
{
  "contents": [
    {
      "parts": [
        { "text": "<prompt>" }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE"]
  }
}
```

## Response Format

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "<base64>"
            }
          }
        ]
      }
    }
  ]
}
```

## Output Specs
- Model: `gemini-2.5-flash-image`
- Resolution: 1024×1024
- Output tokens: ~1290 per image
- Cost: ~$0.039 per image

## Rate Limits
- Standard: 1,000 requests/minute
- Enterprise: 10,000 requests/minute
- ChipIn: 5 images/hour per host
