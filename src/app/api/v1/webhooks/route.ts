import { NextRequest } from 'next/server';
import { z } from 'zod';

import { parseBody, withApiAuth } from '@/lib/api/route-utils';
import { jsonError, jsonSuccess } from '@/lib/api/response';
import { createWebhookEndpoint, listWebhookEndpointsForApiKey } from '@/lib/db/api-queries';
import { encryptSensitiveValue } from '@/lib/utils/encryption';
import {
  SUPPORTED_WEBHOOK_EVENT_TYPES,
  normalizeWebhookEndpointEvents,
} from '@/lib/webhooks';

const eventSchema = z.enum(SUPPORTED_WEBHOOK_EVENT_TYPES);

const requestSchema = z.object({
  url: z.string().url(),
  events: z.array(eventSchema).min(1),
  secret: z.string().min(8),
});

export const GET = withApiAuth('webhooks:manage', async (_request: NextRequest, context) => {
  const { requestId, apiKey, rateLimitHeaders } = context;

  const endpoints = await listWebhookEndpointsForApiKey(apiKey.id);

  return jsonSuccess({
    data: endpoints.map((endpoint) => ({
      id: endpoint.id,
      url: endpoint.url,
      events: normalizeWebhookEndpointEvents(endpoint.events),
      is_active: endpoint.isActive,
      created_at: endpoint.createdAt.toISOString(),
    })),
    requestId,
    headers: rateLimitHeaders,
  });
});

export const POST = withApiAuth('webhooks:manage', async (request: NextRequest, context) => {
  const { requestId, apiKey, rateLimitHeaders } = context;

  const parsed = await parseBody(request, requestSchema, {
    requestId,
    headers: rateLimitHeaders,
    message: 'Invalid webhook payload',
  });
  if (!parsed.ok) return parsed.response;

  const created = await createWebhookEndpoint({
    apiKeyId: apiKey.id,
    url: parsed.data.url,
    events: normalizeWebhookEndpointEvents(parsed.data.events),
    secret: encryptSensitiveValue(parsed.data.secret),
  });

  if (!created) {
    return jsonError({
      error: { code: 'internal_error', message: 'Unable to create webhook endpoint' },
      status: 500,
      requestId,
      headers: rateLimitHeaders,
    });
  }

  return jsonSuccess({
    data: {
      id: created.id,
      url: created.url,
      events: normalizeWebhookEndpointEvents(created.events),
      is_active: created.isActive,
      created_at: created.createdAt.toISOString(),
    },
    requestId,
    status: 201,
    headers: rateLimitHeaders,
  });
});
