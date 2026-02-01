# Perplexity API Reference for ChipIn Takealot Integration

> **Document Type:** Technical Reference  
> **Version:** 1.0  
> **Created:** 2026-02-01  
> **Purpose:** Comprehensive reference for integrating Perplexity API to fetch Takealot product data

---

## Executive Summary

Perplexity provides three core APIs that can extract product information from Takealot URLs:

| API | Best For | Cost | Our Use Case |
|-----|----------|------|--------------|
| **Chat Completions** | Web-grounded AI responses with built-in search | ~$0.006/query | ✅ **Recommended** |
| **Search API** | Raw web search results | $5/1K requests | Not ideal (no AI extraction) |
| **Agentic Research** | Complex multi-step research | Higher cost | Overkill for our needs |

**Recommendation:** Use the **Chat Completions API** with `sonar` model for cost-effective product extraction.

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Chat Completions API (Recommended)](#chat-completions-api)
4. [Models & Pricing](#models--pricing)
5. [Rate Limits](#rate-limits)
6. [Implementation Guide](#implementation-guide)
7. [Error Handling](#error-handling)
8. [OpenAI SDK Compatibility](#openai-sdk-compatibility)
9. [Cost Estimation](#cost-estimation)

---

## API Overview

### Available APIs

#### 1. Chat Completions API (Recommended for ChipIn)
- **Endpoint:** `POST https://api.perplexity.ai/v2/chat/completions`
- **Purpose:** Web-grounded AI responses with citations
- **Key Feature:** Built-in web search + AI extraction in one call
- **Models:** `sonar`, `sonar-pro`, `sonar-reasoning-pro`, `sonar-deep-research`

#### 2. Search API
- **Endpoint:** `POST https://api.perplexity.ai/search`
- **Purpose:** Raw web search results (no AI processing)
- **Pricing:** $5 per 1,000 requests
- **Best For:** Custom AI pipelines where you provide your own LLM

#### 3. Agentic Research API
- **Endpoint:** `POST https://api.perplexity.ai/v2/responses`
- **Purpose:** Multi-provider access (OpenAI, Anthropic, Google models)
- **Best For:** Complex agentic workflows, multi-step research

---

## Authentication

### Getting an API Key

1. Navigate to: **https://perplexity.ai/account/api**
2. Go to the **API Keys** tab
3. Generate a new key (starts with `pplx-`)

### Environment Setup

```bash
# .env.local
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Request Authentication

```bash
curl -X POST https://api.perplexity.ai/v2/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json"
```

---

## Chat Completions API

### Basic Request Structure

```typescript
interface ChatCompletionRequest {
  model: string;                    // e.g., "sonar", "sonar-pro"
  messages: Message[];              // Chat messages array
  max_tokens?: number;              // Max response tokens (default: varies by model)
  stream?: boolean;                 // Enable streaming (default: false)
  search_domain_filter?: string[];  // Limit to specific domains
  search_recency_filter?: string;   // "hour" | "day" | "week" | "month" | "year"
  return_images?: boolean;          // Include image URLs
  return_related_questions?: boolean;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### Response Structure

```typescript
interface ChatCompletionResponse {
  id: string;
  model: string;
  created: number;
  choices: [{
    index: number;
    message: {
      role: "assistant";
      content: string;      // The AI response
    };
    finish_reason: "stop" | "length";
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];           // Source URLs
  search_results?: SearchResult[];  // Full search result objects
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
}
```

### Example: Basic Chat Completion

```typescript
const response = await fetch('https://api.perplexity.ai/v2/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'sonar',
    messages: [
      {
        role: 'user',
        content: 'What is the price and name of this product? https://www.takealot.com/playstation-5-dualsense-controller-starlight-blue-ps5/PLID73817018'
      }
    ]
  })
});
```

### Search Filtering Options

```typescript
// Limit search to specific domains
search_domain_filter: ["takealot.com"]

// Exclude domains (prefix with -)
search_domain_filter: ["-reddit.com", "-pinterest.com"]

// Filter by recency
search_recency_filter: "month"  // hour | day | week | month | year

// Date range filters
search_after_date_filter: "2024-01-01"
search_before_date_filter: "2024-12-31"

// Regional search
country: "ZA"  // ISO 3166-1 alpha-2 code
```

---

## Models & Pricing

### Sonar Models (Chat Completions API)

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Request Fee ($/1K) | Context Window | Best For |
|-------|---------------------|----------------------|-------------------|----------------|----------|
| **sonar** | $1 | $1 | $5-12 | 128K | Quick queries, cost-effective ✅ |
| **sonar-pro** | $3 | $15 | $6-14 | 200K | Complex queries |
| **sonar-reasoning-pro** | $2 | $8 | $6-14 | 128K | Step-by-step reasoning |
| **sonar-deep-research** | $2 | $8 | Varies | 128K | Exhaustive research |

### Request Fee by Search Context Size

| Context Size | sonar | sonar-pro |
|--------------|-------|-----------|
| Low (default) | $5/1K | $6/1K |
| Medium | $8/1K | $10/1K |
| High | $12/1K | $14/1K |

### Search API Pricing

| API | Price |
|-----|-------|
| Search API | $5 per 1,000 requests |

### Agentic Research API Tool Pricing

| Tool | Price |
|------|-------|
| `web_search` | $0.005 per invocation |
| `fetch_url` | $0.0005 per invocation |

---

## Rate Limits

### Rate Limits by Usage Tier

| Tier | Credits Purchased | RPM (sonar) | RPM (sonar-pro) |
|------|-------------------|-------------|-----------------|
| Tier 0 | $0 | 50/min | 50/min |
| Tier 1 | $50+ | 150/min | 150/min |
| Tier 2 | $250+ | 500/min | 500/min |
| Tier 3 | $500+ | 1,000/min | 1,000/min |
| Tier 4 | $1,000+ | 4,000/min | 4,000/min |
| Tier 5 | $5,000+ | 4,000/min | 4,000/min |

### Search API Rate Limits

- **All tiers:** 50 requests per second
- **Burst capacity:** 50 requests

### Rate Limit Algorithm

Perplexity uses a **leaky bucket algorithm**:
- Tokens refill continuously (not at fixed intervals)
- Burst traffic is allowed up to bucket capacity
- Recovery is immediate once tokens refill

### Handling 429 Errors

```typescript
if (response.status === 429) {
  // Implement exponential backoff with jitter
  const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
  const jitter = Math.random() * 1000;
  await sleep(delay + jitter);
  // Retry request
}
```

---

## Implementation Guide

### ChipIn Takealot Product Extraction

#### Recommended Approach

```typescript
// src/lib/integrations/perplexity.ts

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v2/chat/completions';

interface TakealotProduct {
  url: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  productId: string | null;
  inStock: boolean;
}

export async function fetchTakealotProductViaPerplexity(
  takealotUrl: string
): Promise<TakealotProduct> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `You are a product data extractor. Extract product details from Takealot URLs and return ONLY valid JSON with no additional text.

Return format:
{
  "name": "Product Name",
  "priceCents": 129900,
  "imageUrl": "https://...",
  "inStock": true
}

Rules:
- priceCents must be an integer (R1299.00 = 129900)
- imageUrl should be the main product image
- inStock should be true unless explicitly marked as out of stock`
        },
        {
          role: 'user',
          content: `Extract product details from: ${takealotUrl}`
        }
      ],
      max_tokens: 500,
      search_domain_filter: ['takealot.com']
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Perplexity API error: ${response.status} - ${error.message || 'Unknown'}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in Perplexity response');
  }

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                    content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Could not parse product JSON from response');
  }

  const productData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  // Extract product ID from URL
  const productIdMatch = takealotUrl.match(/PLID(\d+)/i);
  
  return {
    url: takealotUrl,
    name: productData.name,
    priceCents: productData.priceCents,
    imageUrl: productData.imageUrl || '/images/gift-placeholder.svg',
    productId: productIdMatch ? productIdMatch[1] : null,
    inStock: productData.inStock ?? true,
  };
}
```

#### With Caching

```typescript
import { kvAdapter } from '@/lib/demo/kv-adapter';
import { createHash } from 'crypto';

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function buildCacheKey(url: string): string {
  const hash = createHash('sha256').update(url).digest('hex');
  return `takealot:perplexity:${hash}`;
}

export async function fetchTakealotProduct(url: string): Promise<TakealotProduct> {
  const cacheKey = buildCacheKey(url);
  
  // Check cache first
  const cached = await kvAdapter.get<TakealotProduct>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Perplexity
  const product = await fetchTakealotProductViaPerplexity(url);
  
  // Cache result
  await kvAdapter.set(cacheKey, product, { ex: CACHE_TTL_SECONDS });
  
  return product;
}
```

---

## Error Handling

### Error Types

| HTTP Status | Error Type | Description | Action |
|-------------|------------|-------------|--------|
| 400 | Bad Request | Invalid request format | Check request body |
| 401 | Unauthorized | Invalid API key | Verify API key |
| 403 | Forbidden | Access denied | Check API permissions |
| 422 | Validation Error | Invalid parameters | Check parameter values |
| 429 | Rate Limited | Too many requests | Implement backoff |
| 500 | Server Error | Perplexity internal error | Retry with backoff |

### Error Response Format

```typescript
interface PerplexityError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}
```

### Robust Error Handling

```typescript
export type PerplexityErrorCode = 
  | 'not_configured'
  | 'rate_limited'
  | 'invalid_response'
  | 'parse_failed'
  | 'api_error';

export class PerplexityFetchError extends Error {
  code: PerplexityErrorCode;
  
  constructor(code: PerplexityErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

async function fetchWithErrorHandling(url: string): Promise<TakealotProduct> {
  try {
    const response = await fetch(PERPLEXITY_API_URL, { /* ... */ });
    
    if (response.status === 429) {
      throw new PerplexityFetchError('rate_limited', 'Rate limit exceeded');
    }
    
    if (!response.ok) {
      throw new PerplexityFetchError('api_error', `API error: ${response.status}`);
    }
    
    const data = await response.json();
    // ... parse response
    
  } catch (error) {
    if (error instanceof PerplexityFetchError) {
      throw error;
    }
    throw new PerplexityFetchError('api_error', 'Unknown error occurred');
  }
}
```

---

## OpenAI SDK Compatibility

Perplexity's API is fully compatible with OpenAI's SDK. You can use your existing OpenAI client:

### Using OpenAI SDK

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai/v2'
});

const completion = await client.chat.completions.create({
  model: 'sonar',
  messages: [
    { role: 'user', content: 'Extract product info from this Takealot URL...' }
  ]
});

console.log(completion.choices[0].message.content);
```

### Perplexity-Specific Parameters (via extra_body)

```typescript
const completion = await client.chat.completions.create({
  model: 'sonar',
  messages: [...],
  extra_body: {
    search_domain_filter: ['takealot.com'],
    search_recency_filter: 'month'
  }
});
```

### Using Native Perplexity SDK

```bash
npm install perplexityai
```

```typescript
import { Perplexity } from 'perplexity';

const client = new Perplexity();  // Uses PERPLEXITY_API_KEY env var

const completion = await client.chat.completions.create({
  model: 'sonar',
  messages: [
    { role: 'user', content: 'Extract product info...' }
  ]
});
```

---

## Cost Estimation

### ChipIn Use Case: Takealot Product Extraction

**Assumptions:**
- ~500 input tokens per request (URL + system prompt)
- ~200 output tokens per response (JSON)
- Using `sonar` model with low search context

**Cost per Request:**
| Component | Cost |
|-----------|------|
| Input tokens (500) | $0.0005 |
| Output tokens (200) | $0.0002 |
| Request fee (low context) | $0.005 |
| **Total per request** | **~$0.0057** |

**Monthly Cost Estimates:**

| Daily Lookups | Monthly Lookups | Monthly Cost |
|---------------|-----------------|--------------|
| 10 | 300 | ~$1.71 |
| 50 | 1,500 | ~$8.55 |
| 100 | 3,000 | ~$17.10 |

**Comparison with Google Custom Search:**
- Google: 100 free queries/day, then $5/1000 queries
- Perplexity: ~$0.006/query with AI extraction included
- **Perplexity includes AI extraction; Google requires separate LLM call**

---

## Environment Variables

```bash
# Required
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional (for debugging)
PERPLEXITY_DEBUG=true
```

---

## Best Practices

### 1. Always Use Domain Filtering

```typescript
search_domain_filter: ['takealot.com']
```
This ensures responses are grounded in Takealot data only.

### 2. Use Structured System Prompts

```typescript
{
  role: 'system',
  content: 'Return ONLY valid JSON. No markdown. No explanations.'
}
```

### 3. Implement Caching

Cache responses for 24 hours to reduce costs and improve latency.

### 4. Handle Rate Limits Gracefully

Implement exponential backoff with jitter for 429 responses.

### 5. Validate Response JSON

Always validate parsed JSON against expected schema before using.

### 6. Log Safely

Never log the full API key. Use masked versions:
```typescript
console.log(`Using key: pplx-...${apiKey.slice(-4)}`);
```

---

## Quick Reference

### API Endpoints

| API | Endpoint |
|-----|----------|
| Chat Completions | `POST https://api.perplexity.ai/v2/chat/completions` |
| Search | `POST https://api.perplexity.ai/search` |
| Agentic Research | `POST https://api.perplexity.ai/v2/responses` |

### Models

| Model | Use Case | Cost Tier |
|-------|----------|-----------|
| `sonar` | Quick queries | Low |
| `sonar-pro` | Complex queries | Medium |
| `sonar-reasoning-pro` | Step-by-step | Medium |
| `sonar-deep-research` | Exhaustive | High |

### Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model name |
| `messages` | array | Chat messages |
| `max_tokens` | number | Max response tokens |
| `stream` | boolean | Enable streaming |
| `search_domain_filter` | string[] | Limit domains |
| `search_recency_filter` | string | Time filter |

---

## Links

- **API Portal:** https://perplexity.ai/account/api
- **Documentation:** https://docs.perplexity.ai
- **Pricing:** https://docs.perplexity.ai/docs/getting-started/pricing
- **Rate Limits:** https://docs.perplexity.ai/docs/admin/rate-limits-usage-tiers
- **Models:** https://docs.perplexity.ai/docs/getting-started/models

---

*End of Reference Document*
