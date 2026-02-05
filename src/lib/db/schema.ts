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

export const payoutMethodEnum = pgEnum('payout_method', ['karri_card', 'bank']);

export const charitySplitTypeEnum = pgEnum('charity_split_type', ['percentage', 'threshold']);

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

export const payoutTypeEnum = pgEnum('payout_type', ['karri_card', 'bank', 'charity']);

export const payoutItemTypeEnum = pgEnum('payout_item_type', ['gift', 'charity']);

export const auditActorTypeEnum = pgEnum('audit_actor_type', ['admin', 'host', 'system']);

export const hosts = pgTable(
  'hosts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    clerkUserId: varchar('clerk_user_id', { length: 255 }),
    name: varchar('name', { length: 100 }),
    phone: varchar('phone', { length: 30 }),
    notificationPreferences: jsonb('notification_preferences')
      .notNull()
      .default(sql`'{}'::jsonb`),
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

export const charities = pgTable(
  'charities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 80 }).notNull(),
    logoUrl: text('logo_url').notNull(),
    website: text('website'),
    bankDetailsEncrypted: jsonb('bank_details_encrypted').notNull(),
    contactName: varchar('contact_name', { length: 120 }).notNull(),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex('unique_charities_name').on(table.name),
    categoryIdx: index('idx_charities_category').on(table.category),
    activeIdx: index('idx_charities_active')
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
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
    childAge: integer('child_age'),
    birthdayDate: date('birthday_date'),
    partyDate: date('party_date').notNull(),
    campaignEndDate: date('campaign_end_date'),

    // v2.0: Manual gift definition with AI artwork
    giftName: varchar('gift_name', { length: 200 }).notNull(),
    giftDescription: text('gift_description'),
    giftImageUrl: text('gift_image_url').notNull(),
    giftImagePrompt: text('gift_image_prompt'),
    goalCents: integer('goal_cents').notNull(),

    // v3.0: Karri Card or bank transfer payout
    payoutMethod: payoutMethodEnum('payout_method').notNull().default('karri_card'),
    karriCardNumber: text('karri_card_number'),
    karriCardHolderName: varchar('karri_card_holder_name', { length: 100 }),
    bankName: varchar('bank_name', { length: 120 }),
    bankAccountNumberEncrypted: text('bank_account_number_encrypted'),
    bankAccountLast4: varchar('bank_account_last4', { length: 4 }),
    bankBranchCode: varchar('bank_branch_code', { length: 20 }),
    bankAccountHolder: varchar('bank_account_holder', { length: 120 }),
    payoutEmail: varchar('payout_email', { length: 255 }).notNull(),

    // Charity split (Option A representation)
    charityEnabled: boolean('charity_enabled').notNull().default(false),
    charityId: uuid('charity_id').references(() => charities.id, { onDelete: 'set null' }),
    charitySplitType: charitySplitTypeEnum('charity_split_type'),
    charityPercentageBps: integer('charity_percentage_bps'),
    charityThresholdCents: integer('charity_threshold_cents'),

    // Notifications
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
    campaignEndDateIdx: index('idx_dream_boards_campaign_end_date')
      .on(table.campaignEndDate)
      .where(sql`${table.status} = 'active'`),
    charityEnabledIdx: index('idx_dream_boards_charity_enabled').on(table.charityEnabled),
    payoutMethodIdx: index('idx_dream_boards_payout_method').on(table.payoutMethod),
    validGoal: check('valid_goal', sql`${table.goalCents} >= 2000`), // R20 minimum (kept for backward compat)
    validDates: check(
      'valid_dream_board_dates',
      sql`(${table.birthdayDate} IS NULL OR ${table.partyDate} >= ${table.birthdayDate})
      AND (${table.campaignEndDate} IS NULL OR ${table.campaignEndDate} <= ${table.partyDate})`
    ),
    validCharitySplitConfig: check(
      'valid_charity_split_config',
      sql`(
        ${table.charityEnabled} = false
        AND ${table.charityId} IS NULL
        AND ${table.charitySplitType} IS NULL
        AND ${table.charityPercentageBps} IS NULL
        AND ${table.charityThresholdCents} IS NULL
      )
      OR (
        ${table.charityEnabled} = true
        AND ${table.charityId} IS NOT NULL
        AND (
          (
            ${table.charitySplitType} = 'percentage'
            AND ${table.charityPercentageBps} BETWEEN 500 AND 5000
            AND ${table.charityThresholdCents} IS NULL
          )
          OR (
            ${table.charitySplitType} = 'threshold'
            AND ${table.charityThresholdCents} >= 5000
            AND ${table.charityPercentageBps} IS NULL
          )
        )
      )`
    ),
    validPayoutMethodData: check(
      'valid_dream_board_payout_data',
      sql`(
        ${table.payoutMethod} = 'karri_card'
        AND ${table.karriCardNumber} IS NOT NULL
        AND ${table.karriCardHolderName} IS NOT NULL
      )
      OR (
        ${table.payoutMethod} = 'bank'
        AND ${table.bankName} IS NOT NULL
        AND ${table.bankAccountNumberEncrypted} IS NOT NULL
        AND ${table.bankAccountLast4} IS NOT NULL
        AND ${table.bankBranchCode} IS NOT NULL
        AND ${table.bankAccountHolder} IS NOT NULL
      )`
    ),
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
    contributorEmail: varchar('contributor_email', { length: 255 }),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    message: text('message'),
    amountCents: integer('amount_cents').notNull(),
    feeCents: integer('fee_cents').notNull(),
    netCents: integer('net_cents').generatedAlwaysAs(sql`(amount_cents - fee_cents)`),
    charityCents: integer('charity_cents'),
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
    validCharityAmount: check(
      'valid_charity_amount',
      sql`${table.charityCents} IS NULL
      OR (${table.charityCents} >= 0 AND ${table.charityCents} <= ${table.amountCents})`
    ),
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
    charityCents: integer('charity_cents').notNull().default(0),
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
      sql`${table.grossCents} >= ${table.netCents}
      AND ${table.charityCents} >= 0
      AND ${table.netCents} >= 0`
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

export const contributionReminders = pgTable(
  'contribution_reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dreamBoardId: uuid('dream_board_id')
      .notNull()
      .references(() => dreamBoards.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    remindAt: timestamp('remind_at', { withTimezone: true }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dreamBoardIdx: index('idx_contribution_reminders_dream_board').on(table.dreamBoardId),
    dueIdx: index('idx_contribution_reminders_due')
      .on(table.remindAt)
      .where(sql`${table.sentAt} IS NULL`),
    uniqueReminder: uniqueIndex('unique_contribution_reminder').on(
      table.dreamBoardId,
      table.email,
      table.remindAt
    ),
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
