import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  inet,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const dreamBoardStatusEnum = pgEnum('dream_board_status', [
  'draft',
  'active',
  'funded',
  'closed',
  'paid_out',
  'expired',
  'cancelled',
]);

// v2.0: Karri Card is the sole payout method
export const payoutMethodEnum = pgEnum('payout_method', ['karri_card']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

export const paymentProviderEnum = pgEnum('payment_provider', ['payfast', 'ozow', 'snapscan']);

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

// v2.0: Karri Card is the sole payout type
export const payoutTypeEnum = pgEnum('payout_type', ['karri_card']);

// v2.0: No charity overflow in simplified model
export const payoutItemTypeEnum = pgEnum('payout_item_type', ['gift']);

export const auditActorTypeEnum = pgEnum('audit_actor_type', ['admin', 'host', 'system']);

export const hosts = pgTable(
  'hosts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    clerkUserId: varchar('clerk_user_id', { length: 255 }),
    name: varchar('name', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('idx_hosts_email').on(table.email),
    clerkUserIdIdx: uniqueIndex('unique_hosts_clerk_user_id').on(table.clerkUserId),
  })
);

export const partners = pgTable(
  'partners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex('unique_partners_name').on(table.name),
  })
);

export const dreamBoards = pgTable(
  'dream_boards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'restrict' }),
    hostId: uuid('host_id')
      .notNull()
      .references(() => hosts.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 100 }).notNull().unique(),

    // Child details
    childName: varchar('child_name', { length: 50 }).notNull(),
    childPhotoUrl: text('child_photo_url').notNull(),
    partyDate: date('party_date').notNull(), // v2.0: serves as pot close date

    // v2.0: Manual gift definition with AI artwork
    giftName: varchar('gift_name', { length: 200 }).notNull(),
    giftImageUrl: text('gift_image_url').notNull(),
    giftImagePrompt: text('gift_image_prompt'),
    goalCents: integer('goal_cents').notNull(),

    // v2.0: Karri Card is sole payout method
    payoutMethod: payoutMethodEnum('payout_method').notNull().default('karri_card'),
    karriCardNumber: text('karri_card_number').notNull(),
    karriCardHolderName: varchar('karri_card_holder_name', { length: 100 }).notNull(),
    payoutEmail: varchar('payout_email', { length: 255 }).notNull(),

    // v2.0: WhatsApp notifications
    hostWhatsAppNumber: varchar('host_whatsapp_number', { length: 20 }).notNull(),

    // Content
    message: text('message'),

    // Status
    status: dreamBoardStatusEnum('status').notNull().default('draft'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  },
  (table) => ({
    hostIdx: index('idx_dream_boards_host').on(table.hostId),
    partnerIdx: index('idx_dream_boards_partner').on(table.partnerId),
    slugIdx: index('idx_dream_boards_slug').on(table.slug),
    statusIdx: index('idx_dream_boards_status').on(table.status),
    partyDateIdx: index('idx_dream_boards_party_date')
      .on(table.partyDate)
      .where(sql`${table.status} = 'active'`),
    validGoal: check('valid_goal', sql`${table.goalCents} >= 2000`), // R20 minimum (kept for backward compat)
  })
);

export const contributions = pgTable(
  'contributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'restrict' }),
    dreamBoardId: uuid('dream_board_id')
      .notNull()
      .references(() => dreamBoards.id, { onDelete: 'cascade' }),
    contributorName: varchar('contributor_name', { length: 100 }),
    message: text('message'),
    amountCents: integer('amount_cents').notNull(),
    feeCents: integer('fee_cents').notNull(),
    netCents: integer('net_cents').generatedAlwaysAs(sql`(amount_cents - fee_cents)`),
    paymentProvider: paymentProviderEnum('payment_provider').notNull(),
    paymentRef: varchar('payment_ref', { length: 255 }).notNull(),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
    paymentErrorMessage: text('payment_error_message'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dreamBoardIdx: index('idx_contributions_dream_board').on(table.dreamBoardId),
    dreamBoardCreatedAtIdx: index('idx_contributions_dream_board_created_at').on(
      table.dreamBoardId,
      table.createdAt
    ),
    partnerIdx: index('idx_contributions_partner').on(table.partnerId),
    statusIdx: index('idx_contributions_status').on(table.paymentStatus),
    pendingProcessingIdx: index('idx_contributions_pending_processing')
      .on(table.paymentStatus, table.createdAt)
      .where(sql`${table.paymentStatus} IN ('pending', 'processing')`),
    paymentRefIdx: index('idx_contributions_payment_ref').on(
      table.paymentProvider,
      table.paymentRef
    ),
    uniquePaymentRef: uniqueIndex('unique_payment_ref').on(table.paymentProvider, table.paymentRef),
    validAmount: check('valid_amount', sql`${table.amountCents} >= 2000`),
  })
);

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'restrict' }),
    dreamBoardId: uuid('dream_board_id')
      .notNull()
      .references(() => dreamBoards.id),
    type: payoutTypeEnum('type').notNull(),
    grossCents: integer('gross_cents').notNull(),
    feeCents: integer('fee_cents').notNull(),
    netCents: integer('net_cents').notNull(),
    recipientData: jsonb('recipient_data').notNull(),
    status: payoutStatusEnum('status').notNull().default('pending'),
    externalRef: varchar('external_ref', { length: 255 }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index('idx_payouts_status').on(table.status),
    statusCreatedAtIdx: index('idx_payouts_status_created_at').on(table.status, table.createdAt),
    dreamBoardIdx: index('idx_payouts_dream_board').on(table.dreamBoardId),
    partnerIdx: index('idx_payouts_partner').on(table.partnerId),
    uniqueDreamBoardType: uniqueIndex('unique_payout_dream_board_type').on(
      table.dreamBoardId,
      table.type
    ),
    validAmounts: check(
      'valid_amounts',
      sql`${table.grossCents} >= ${table.netCents} AND ${table.netCents} >= 0`
    ),
  })
);

export const payoutItems = pgTable(
  'payout_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    payoutId: uuid('payout_id')
      .notNull()
      .references(() => payouts.id, { onDelete: 'cascade' }),
    dreamBoardId: uuid('dream_board_id')
      .notNull()
      .references(() => dreamBoards.id, { onDelete: 'cascade' }),
    type: payoutItemTypeEnum('type').notNull(),
    amountCents: integer('amount_cents').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    payoutIdx: index('idx_payout_items_payout').on(table.payoutId),
    dreamBoardIdx: index('idx_payout_items_dream_board').on(table.dreamBoardId),
    typeIdx: index('idx_payout_items_type').on(table.type),
    uniquePayoutType: uniqueIndex('unique_payout_item_type').on(table.payoutId, table.type),
    validAmount: check('valid_payout_item_amount', sql`${table.amountCents} >= 0`),
  })
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorType: auditActorTypeEnum('actor_type').notNull(),
    actorId: uuid('actor_id'),
    actorEmail: varchar('actor_email', { length: 255 }),
    action: varchar('action', { length: 100 }).notNull(),
    targetType: varchar('target_type', { length: 50 }).notNull(),
    targetId: varchar('target_id', { length: 100 }).notNull(),
    metadata: jsonb('metadata'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    actionIdx: index('idx_audit_logs_action').on(table.action),
    targetIdx: index('idx_audit_logs_target').on(table.targetType, table.targetId),
    actorIdx: index('idx_audit_logs_actor').on(table.actorType, table.actorId),
  })
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'restrict' }),
    partnerName: varchar('partner_name', { length: 100 }).notNull(),
    keyHash: varchar('key_hash', { length: 255 }).notNull(),
    keyPrefix: varchar('key_prefix', { length: 12 }).notNull(),
    scopes: text('scopes')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    rateLimit: integer('rate_limit').notNull().default(1000),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (table) => ({
    prefixIdx: index('idx_api_keys_prefix').on(table.keyPrefix),
    partnerIdx: index('idx_api_keys_partner').on(table.partnerId),
    activeIdx: index('idx_api_keys_active')
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
  })
);

export const webhookEndpoints = pgTable(
  'webhook_endpoints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiKeyId: uuid('api_key_id')
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    events: text('events')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    secret: text('secret').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    apiKeyIdx: index('idx_webhook_endpoints_api_key').on(table.apiKeyId),
    activeIdx: index('idx_webhook_endpoints_active')
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
  })
);

export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    lastResponseCode: integer('last_response_code'),
    lastResponseBody: text('last_response_body'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('idx_webhook_events_status')
      .on(table.status)
      .where(sql`${table.status} = 'pending'`),
    apiKeyIdx: index('idx_webhook_events_api_key').on(table.apiKeyId),
  })
);

// v2.0: Karri Credit Queue for batch processing
export const karriCreditQueue = pgTable(
  'karri_credit_queue',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dreamBoardId: uuid('dream_board_id')
      .notNull()
      .references(() => dreamBoards.id),
    karriCardNumber: text('karri_card_number').notNull(),
    amountCents: integer('amount_cents').notNull(),
    reference: varchar('reference', { length: 100 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('idx_karri_queue_status').on(table.status),
    createdIdx: index('idx_karri_queue_created').on(table.createdAt),
    dreamBoardIdx: index('idx_karri_queue_dream_board').on(table.dreamBoardId),
  })
);
