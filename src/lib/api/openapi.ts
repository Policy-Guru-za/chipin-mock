/* eslint-disable max-lines */

import {
  LOCKED_CHARITY_SPLIT_MODES,
  LOCKED_PAYOUT_METHODS,
  LOCKED_PAYOUT_TYPES,
} from '@/lib/ux-v2/decision-locks';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Gifta Public API',
    version: '1.0.0',
    description: 'Partner API for Dream Boards, contributions, payouts, and webhooks.',
  },
  servers: [
    {
      url: 'https://api.gifta.co.za/v1',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000/v1',
      description: 'Local development',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  tags: [
    {
      name: 'Dream Boards',
      description: 'Create and retrieve Dream Boards.',
    },
    {
      name: 'Contributions',
      description: 'Read contribution records.',
    },
    {
      name: 'Payouts',
      description: 'Manage payout status updates.',
    },
    {
      name: 'Webhooks',
      description: 'Create and manage webhook subscriptions.',
    },
  ],
  paths: {
    '/dream-boards': {
      get: {
        tags: ['Dream Boards'],
        summary: 'List dream boards',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              $ref: '#/components/schemas/DreamBoardStatus',
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: 'after',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Dream boards list',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DreamBoardListResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
      post: {
        tags: ['Dream Boards'],
        summary: 'Create a dream board',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DreamBoardCreateRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Dream board created',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DreamBoardResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '422': {
            $ref: '#/components/responses/UnsupportedOperationError',
          },
          '409': {
            $ref: '#/components/responses/ConflictError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/dream-boards/{id}': {
      get: {
        tags: ['Dream Boards'],
        summary: 'Get a dream board',
        parameters: [
          {
            $ref: '#/components/parameters/DreamBoardId',
          },
        ],
        responses: {
          '200': {
            description: 'Dream board',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DreamBoardResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
      patch: {
        tags: ['Dream Boards'],
        summary: 'Update a dream board',
        parameters: [
          {
            $ref: '#/components/parameters/DreamBoardId',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DreamBoardUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Dream board updated',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DreamBoardResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '409': {
            $ref: '#/components/responses/ConflictError',
          },
          '422': {
            $ref: '#/components/responses/UnsupportedOperationError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/dream-boards/{id}/contributions': {
      get: {
        tags: ['Contributions'],
        summary: 'List contributions for a dream board',
        parameters: [
          {
            $ref: '#/components/parameters/DreamBoardId',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              $ref: '#/components/schemas/ContributionStatus',
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: 'after',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Contribution list',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ContributionListResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/contributions/{id}': {
      get: {
        tags: ['Contributions'],
        summary: 'Get a contribution',
        parameters: [
          {
            $ref: '#/components/parameters/ContributionId',
          },
        ],
        responses: {
          '200': {
            description: 'Contribution',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ContributionResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/payouts/pending': {
      get: {
        tags: ['Payouts'],
        summary: 'List pending payouts',
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: {
              $ref: '#/components/schemas/PayoutType',
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: 'after',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Pending payout list',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PayoutListResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/payouts/{id}': {
      get: {
        tags: ['Payouts'],
        summary: 'Get a payout',
        parameters: [
          {
            $ref: '#/components/parameters/PayoutId',
          },
        ],
        responses: {
          '200': {
            description: 'Payout',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PayoutResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/payouts/{id}/confirm': {
      post: {
        tags: ['Payouts'],
        summary: 'Confirm a payout',
        parameters: [
          {
            $ref: '#/components/parameters/PayoutId',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PayoutConfirmRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Payout confirmed',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PayoutResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/payouts/{id}/fail': {
      post: {
        tags: ['Payouts'],
        summary: 'Fail a payout',
        parameters: [
          {
            $ref: '#/components/parameters/PayoutId',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PayoutFailRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Payout failed',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PayoutResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/webhooks': {
      get: {
        tags: ['Webhooks'],
        summary: 'List webhook endpoints',
        responses: {
          '200': {
            description: 'Webhook list',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WebhookListResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
      post: {
        tags: ['Webhooks'],
        summary: 'Create webhook endpoint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WebhookCreateRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Webhook created',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WebhookResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/webhooks/{id}': {
      delete: {
        tags: ['Webhooks'],
        summary: 'Deactivate webhook endpoint',
        parameters: [
          {
            $ref: '#/components/parameters/WebhookId',
          },
        ],
        responses: {
          '200': {
            description: 'Webhook deactivated',
            headers: {
              'X-RateLimit-Limit': {
                $ref: '#/components/headers/RateLimitLimit',
              },
              'X-RateLimit-Remaining': {
                $ref: '#/components/headers/RateLimitRemaining',
              },
              'X-RateLimit-Reset': {
                $ref: '#/components/headers/RateLimitReset',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WebhookDeleteResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Bearer cpk_live_xxx or cpk_test_xxx',
      },
    },
    parameters: {
      DreamBoardId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z0-9-]+$',
          maxLength: 100,
        },
        description: 'Public dream board identifier.',
      },
      ContributionId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'Contribution identifier.',
      },
      PayoutId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'Payout identifier.',
      },
      WebhookId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'Webhook endpoint identifier.',
      },
    },
    headers: {
      RateLimitLimit: {
        schema: {
          type: 'integer',
        },
        description: 'Hourly rate limit quota.',
      },
      RateLimitRemaining: {
        schema: {
          type: 'integer',
        },
        description: 'Remaining requests in the current window.',
      },
      RateLimitReset: {
        schema: {
          type: 'integer',
        },
        description: 'Epoch time when the rate limit resets.',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ConflictError: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      UnsupportedOperationError: {
        description: 'Unsupported operation for current rollout phase',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limited',
        headers: {
          'X-RateLimit-Limit': {
            $ref: '#/components/headers/RateLimitLimit',
          },
          'X-RateLimit-Remaining': {
            $ref: '#/components/headers/RateLimitRemaining',
          },
          'X-RateLimit-Reset': {
            $ref: '#/components/headers/RateLimitReset',
          },
          'Retry-After': {
            schema: {
              type: 'integer',
            },
            description: 'Seconds to wait before retrying.',
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      InternalError: {
        description: 'Internal error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
    schemas: {
      ApiMeta: {
        type: 'object',
        required: ['request_id', 'timestamp'],
        properties: {
          request_id: {
            type: 'string',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ApiError: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            enum: [
              'unauthorized',
              'forbidden',
              'not_found',
              'validation_error',
              'conflict',
              'unsupported_operation',
              'invalid_reminder_window',
              'rate_limited',
              'internal_error',
            ],
          },
          message: {
            type: 'string',
          },
          details: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error', 'meta'],
        properties: {
          error: {
            $ref: '#/components/schemas/ApiError',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      Pagination: {
        type: 'object',
        required: ['has_more', 'next_cursor'],
        properties: {
          has_more: {
            type: 'boolean',
          },
          next_cursor: {
            type: 'string',
            nullable: true,
          },
          total_count: {
            type: 'integer',
          },
        },
      },
      DreamBoardStatus: {
        type: 'string',
        enum: ['draft', 'active', 'funded', 'closed', 'paid_out', 'expired', 'cancelled'],
      },
      GiftType: {
        type: 'string',
        enum: ['manual'],
      },
      PayoutMethod: {
        type: 'string',
        enum: LOCKED_PAYOUT_METHODS,
        description:
          'UX v2 enum set. Legacy clients that assumed karri_card-only responses must handle bank values.',
      },
      CharitySplitType: {
        type: 'string',
        enum: LOCKED_CHARITY_SPLIT_MODES,
      },
      DisplayMode: {
        type: 'string',
        enum: ['gift'],
      },
      GiftData: {
        type: 'object',
        required: ['gift_name', 'gift_image_url'],
        properties: {
          gift_name: {
            type: 'string',
          },
          gift_icon_id: {
            type: 'string',
            nullable: true,
            description: 'Gift icon identifier when gift imagery is sourced from the curated icon library.',
          },
          gift_image_url: {
            type: 'string',
            format: 'uri',
            description: 'Absolute URL to the resolved gift icon asset.',
          },
          gift_image_prompt: {
            type: 'string',
            nullable: true,
            description: 'Deprecated. Legacy AI prompt data, null for icon-based boards.',
          },
        },
      },
      DreamBoard: {
        type: 'object',
        required: [
          'id',
          'slug',
          'child_name',
          'child_photo_url',
          'child_age',
          'birthday_date',
          'party_date',
          'campaign_end_date',
          'gift_data',
          'gift_description',
          'payout_method',
          'karri_card_holder_name',
          'bank_name',
          'bank_account_last4',
          'bank_branch_code',
          'bank_account_holder',
          'payout_email',
          'charity_enabled',
          'charity_id',
          'charity_split_type',
          'charity_percentage_bps',
          'charity_threshold_cents',
          'goal_cents',
          'raised_cents',
          'message',
          'status',
          'display_mode',
          'contribution_count',
          'public_url',
          'created_at',
          'updated_at',
        ],
        properties: {
          id: {
            type: 'string',
            example: 'db_abc123',
          },
          slug: {
            type: 'string',
          },
          child_name: {
            type: 'string',
          },
          child_photo_url: {
            type: 'string',
            format: 'uri',
          },
          child_age: {
            type: 'integer',
            nullable: true,
          },
          birthday_date: {
            type: 'string',
            format: 'date',
            nullable: true,
          },
          party_date: {
            type: 'string',
            format: 'date',
          },
          campaign_end_date: {
            type: 'string',
            format: 'date',
            nullable: true,
          },
          gift_data: {
            $ref: '#/components/schemas/GiftData',
          },
          gift_description: {
            type: 'string',
            nullable: true,
          },
          payout_method: {
            $ref: '#/components/schemas/PayoutMethod',
          },
          karri_card_holder_name: {
            type: 'string',
            nullable: true,
          },
          bank_name: {
            type: 'string',
            nullable: true,
          },
          bank_account_last4: {
            type: 'string',
            nullable: true,
          },
          bank_branch_code: {
            type: 'string',
            nullable: true,
          },
          bank_account_holder: {
            type: 'string',
            nullable: true,
          },
          payout_email: {
            type: 'string',
            format: 'email',
          },
          charity_enabled: {
            type: 'boolean',
          },
          charity_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          charity_split_type: {
            allOf: [{ $ref: '#/components/schemas/CharitySplitType' }],
            nullable: true,
          },
          charity_percentage_bps: {
            type: 'integer',
            nullable: true,
          },
          charity_threshold_cents: {
            type: 'integer',
            nullable: true,
          },
          goal_cents: {
            type: 'integer',
          },
          raised_cents: {
            type: 'integer',
          },
          message: {
            type: 'string',
            nullable: true,
          },
          status: {
            $ref: '#/components/schemas/DreamBoardStatus',
          },
          display_mode: {
            $ref: '#/components/schemas/DisplayMode',
          },
          contribution_count: {
            type: 'integer',
          },
          public_url: {
            type: 'string',
            format: 'uri',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      DreamBoardCreateRequest: {
        type: 'object',
        required: [
          'child_name',
          'child_photo_url',
          'party_date',
          'gift_name',
          'goal_cents',
          'payout_email',
          'host_whatsapp_number',
        ],
        properties: {
          child_name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
          },
          child_age: {
            type: 'integer',
            minimum: 1,
            maximum: 18,
          },
          child_photo_url: {
            type: 'string',
            format: 'uri',
          },
          birthday_date: {
            type: 'string',
            format: 'date',
          },
          party_date: {
            type: 'string',
            format: 'date',
          },
          campaign_end_date: {
            type: 'string',
            format: 'date',
          },
          gift_name: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
          },
          gift_description: {
            type: 'string',
            maxLength: 500,
          },
          gift_icon_id: {
            type: 'string',
            description:
              'Curated icon id. Required when gift_image_url is omitted. Preferred for new clients.',
          },
          gift_image_url: {
            type: 'string',
            description:
              'Gift icon path or URL. Must map to a supported icon in /icons/gifts/. Required when gift_icon_id is omitted.',
          },
          gift_image_prompt: {
            type: 'string',
            nullable: true,
            description: 'Deprecated. Legacy AI prompt value.',
          },
          goal_cents: {
            type: 'integer',
            minimum: 2000,
          },
          payout_method: {
            $ref: '#/components/schemas/PayoutMethod',
          },
          payout_email: {
            type: 'string',
            format: 'email',
          },
          host_whatsapp_number: {
            type: 'string',
          },
          karri_card_number: {
            type: 'string',
          },
          karri_card_holder_name: {
            type: 'string',
          },
          bank_name: {
            type: 'string',
          },
          bank_account_number: {
            type: 'string',
          },
          bank_branch_code: {
            type: 'string',
          },
          bank_account_holder: {
            type: 'string',
          },
          charity_enabled: {
            type: 'boolean',
          },
          charity_id: {
            type: 'string',
            format: 'uuid',
          },
          charity_split_type: {
            $ref: '#/components/schemas/CharitySplitType',
          },
          charity_percentage_bps: {
            type: 'integer',
            minimum: 500,
            maximum: 5000,
          },
          charity_threshold_cents: {
            type: 'integer',
            minimum: 5000,
          },
          message: {
            type: 'string',
            maxLength: 280,
          },
        },
        description:
          'Creates a dream board. Bank and charity write paths are accepted in schema but return unsupported_operation (422) until Phase B2 runtime gating is enabled.',
      },
      DreamBoardUpdateRequest: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            maxLength: 280,
            nullable: true,
          },
          party_date: {
            type: 'string',
            format: 'date',
          },
          status: {
            $ref: '#/components/schemas/DreamBoardStatus',
          },
          payout_method: {
            $ref: '#/components/schemas/PayoutMethod',
          },
          karri_card_number: {
            type: 'string',
          },
          karri_card_holder_name: {
            type: 'string',
          },
          bank_name: {
            type: 'string',
          },
          bank_account_number: {
            type: 'string',
          },
          bank_branch_code: {
            type: 'string',
          },
          bank_account_holder: {
            type: 'string',
          },
          charity_enabled: {
            type: 'boolean',
          },
          charity_id: {
            type: 'string',
            format: 'uuid',
          },
          charity_split_type: {
            $ref: '#/components/schemas/CharitySplitType',
          },
          charity_percentage_bps: {
            type: 'integer',
            minimum: 500,
            maximum: 5000,
          },
          charity_threshold_cents: {
            type: 'integer',
            minimum: 5000,
          },
        },
        description:
          'Updates a dream board. Payout and charity mutation paths currently return unsupported_operation (422) until Phase B2.',
      },
      DreamBoardResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            $ref: '#/components/schemas/DreamBoard',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      DreamBoardListResponse: {
        type: 'object',
        required: ['data', 'pagination', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/DreamBoard',
            },
          },
          pagination: {
            $ref: '#/components/schemas/Pagination',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      ContributionStatus: {
        type: 'string',
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      },
      Contribution: {
        type: 'object',
        required: [
          'id',
          'dream_board_id',
          'amount_cents',
          'fee_cents',
          'net_cents',
          'charity_cents',
          'payment_status',
          'created_at',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          dream_board_id: {
            type: 'string',
          },
          contributor_name: {
            type: 'string',
            nullable: true,
          },
          message: {
            type: 'string',
            nullable: true,
          },
          amount_cents: {
            type: 'integer',
          },
          fee_cents: {
            type: 'integer',
          },
          net_cents: {
            type: 'integer',
          },
          charity_cents: {
            type: 'integer',
            nullable: true,
          },
          payment_status: {
            $ref: '#/components/schemas/ContributionStatus',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ContributionResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            $ref: '#/components/schemas/Contribution',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      ContributionListResponse: {
        type: 'object',
        required: ['data', 'pagination', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Contribution',
            },
          },
          pagination: {
            $ref: '#/components/schemas/Pagination',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      PayoutType: {
        type: 'string',
        enum: LOCKED_PAYOUT_TYPES,
        description:
          'UX v2 enum set. Legacy clients that assumed karri_card-only payout types must handle bank and charity.',
      },
      PayoutStatus: {
        type: 'string',
        enum: ['pending', 'processing', 'completed', 'failed'],
      },
      PayoutRecipientData: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          child_name: {
            type: 'string',
          },
          payout_method: {
            $ref: '#/components/schemas/PayoutMethod',
          },
          karri_card_holder_name: {
            type: 'string',
            nullable: true,
          },
          bank_name: {
            type: 'string',
            nullable: true,
          },
          bank_account_last4: {
            type: 'string',
            nullable: true,
          },
          bank_branch_code: {
            type: 'string',
            nullable: true,
          },
          bank_account_holder: {
            type: 'string',
            nullable: true,
          },
          charity_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          charity_name: {
            type: 'string',
            nullable: true,
          },
          charity_split_type: {
            allOf: [{ $ref: '#/components/schemas/CharitySplitType' }],
            nullable: true,
          },
          charity_percentage_bps: {
            type: 'integer',
            nullable: true,
          },
          charity_threshold_cents: {
            type: 'integer',
            nullable: true,
          },
          gift_data: {
            $ref: '#/components/schemas/GiftData',
            nullable: true,
          },
          card_number_last4: {
            type: 'string',
            nullable: true,
          },
          card_number_masked: {
            type: 'string',
            nullable: true,
          },
        },
      },
      Payout: {
        type: 'object',
        required: [
          'id',
          'dream_board_id',
          'type',
          'gross_cents',
          'fee_cents',
          'charity_cents',
          'net_cents',
          'status',
          'created_at',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          dream_board_id: {
            type: 'string',
          },
          type: {
            $ref: '#/components/schemas/PayoutType',
          },
          gross_cents: {
            type: 'integer',
          },
          fee_cents: {
            type: 'integer',
          },
          charity_cents: {
            type: 'integer',
          },
          net_cents: {
            type: 'integer',
          },
          recipient_data: {
            $ref: '#/components/schemas/PayoutRecipientData',
            nullable: true,
          },
          status: {
            $ref: '#/components/schemas/PayoutStatus',
          },
          external_ref: {
            type: 'string',
            nullable: true,
          },
          error_message: {
            type: 'string',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          completed_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      PayoutResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            $ref: '#/components/schemas/Payout',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      PayoutListResponse: {
        type: 'object',
        required: ['data', 'pagination', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Payout',
            },
          },
          pagination: {
            $ref: '#/components/schemas/Pagination',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      PayoutConfirmRequest: {
        type: 'object',
        required: ['external_ref'],
        properties: {
          external_ref: {
            type: 'string',
          },
          completed_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      PayoutFailRequest: {
        type: 'object',
        required: ['error_message'],
        properties: {
          error_code: {
            type: 'string',
          },
          error_message: {
            type: 'string',
          },
        },
      },
      WebhookEvent: {
        type: 'string',
        enum: [
          'dreamboard.created',
          'dreamboard.updated',
          'contribution.received',
          'pot.funded',
          'pot.closed',
          'payout.ready',
          'payout.completed',
          'payout.failed',
        ],
      },
      WebhookEndpoint: {
        type: 'object',
        required: ['id', 'url', 'events', 'is_active', 'created_at'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          url: {
            type: 'string',
            format: 'uri',
          },
          events: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WebhookEvent',
            },
          },
          is_active: {
            type: 'boolean',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      WebhookCreateRequest: {
        type: 'object',
        required: ['url', 'events', 'secret'],
        properties: {
          url: {
            type: 'string',
            format: 'uri',
          },
          events: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WebhookEvent',
            },
          },
          secret: {
            type: 'string',
            minLength: 8,
          },
        },
      },
      WebhookResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            $ref: '#/components/schemas/WebhookEndpoint',
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      WebhookListResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WebhookEndpoint',
            },
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
      WebhookDeleteResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
            },
          },
          meta: {
            $ref: '#/components/schemas/ApiMeta',
          },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
