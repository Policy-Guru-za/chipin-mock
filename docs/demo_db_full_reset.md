```sql
-- Demo DB full reset (DESTRUCTIVE)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO PUBLIC;

-- 0000_lonely_ronan.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dream_board_status" AS ENUM('draft', 'active', 'funded', 'closed', 'paid_out', 'expired', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."gift_type" AS ENUM('takealot_product', 'philanthropy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_provider" AS ENUM('payfast', 'ozow', 'snapscan');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payout_method" AS ENUM('takealot_gift_card', 'karri_card_topup', 'philanthropy_donation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payout_type" AS ENUM('takealot_gift_card', 'philanthropy_donation', 'karri_card_topup');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_name" varchar(100) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(12) NOT NULL,
	"scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"rate_limit" integer DEFAULT 1000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dream_board_id" uuid NOT NULL,
	"contributor_name" varchar(100),
	"message" text,
	"amount_cents" integer NOT NULL,
	"fee_cents" integer NOT NULL,
	"net_cents" integer GENERATED ALWAYS AS ((amount_cents - fee_cents)) STORED,
	"payment_provider" "payment_provider" NOT NULL,
	"payment_ref" varchar(255) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valid_amount" CHECK ("amount_cents" >= 2000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dream_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"child_name" varchar(50) NOT NULL,
	"child_photo_url" text NOT NULL,
	"birthday_date" date NOT NULL,
	"gift_type" "gift_type" NOT NULL,
	"gift_data" jsonb NOT NULL,
	"goal_cents" integer NOT NULL,
	"payout_method" "payout_method" NOT NULL,
	"overflow_gift_data" jsonb,
	"message" text,
	"deadline" timestamp with time zone NOT NULL,
	"status" "dream_board_status" DEFAULT 'draft' NOT NULL,
	"payout_email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valid_goal" CHECK ("goal_cents" >= 2000),
	CONSTRAINT "valid_deadline" CHECK ("deadline" > "created_at"),
	CONSTRAINT "payout_method_valid" CHECK (("gift_type" = 'takealot_product' AND "payout_method" IN ('takealot_gift_card', 'karri_card_topup')) OR ("gift_type" = 'philanthropy' AND "payout_method" = 'philanthropy_donation')),
	CONSTRAINT "overflow_required" CHECK (("gift_type" = 'takealot_product' AND "overflow_gift_data" IS NOT NULL) OR ("gift_type" = 'philanthropy')),
	CONSTRAINT "dream_boards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hosts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dream_board_id" uuid NOT NULL,
	"type" "payout_type" NOT NULL,
	"gross_cents" integer NOT NULL,
	"fee_cents" integer NOT NULL,
	"net_cents" integer NOT NULL,
	"recipient_data" jsonb NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"external_ref" varchar(255),
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"event_type" varchar(50) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"last_response_code" integer,
	"last_response_body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contributions" ADD CONSTRAINT "contributions_dream_board_id_dream_boards_id_fk" FOREIGN KEY ("dream_board_id") REFERENCES "public"."dream_boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dream_boards" ADD CONSTRAINT "dream_boards_host_id_hosts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."hosts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_dream_board_id_dream_boards_id_fk" FOREIGN KEY ("dream_board_id") REFERENCES "public"."dream_boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_api_keys_prefix" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_api_keys_active" ON "api_keys" USING btree ("is_active") WHERE "api_keys"."is_active" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contributions_dream_board" ON "contributions" USING btree ("dream_board_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contributions_status" ON "contributions" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contributions_payment_ref" ON "contributions" USING btree ("payment_provider","payment_ref");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_payment_ref" ON "contributions" USING btree ("payment_provider","payment_ref");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dream_boards_host" ON "dream_boards" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dream_boards_slug" ON "dream_boards" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dream_boards_status" ON "dream_boards" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dream_boards_deadline" ON "dream_boards" USING btree ("deadline") WHERE "dream_boards"."status" = 'active';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hosts_email" ON "hosts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payouts_status" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payouts_dream_board" ON "payouts" USING btree ("dream_board_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_events_status" ON "webhook_events" USING btree ("status") WHERE "webhook_events"."status" = 'pending';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_events_api_key" ON "webhook_events" USING btree ("api_key_id");

-- 0001_workable_starbolt.sql
DO $$ BEGIN
 CREATE TYPE "public"."audit_actor_type" AS ENUM('admin', 'host', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payout_item_type" AS ENUM('gift', 'overflow');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" "audit_actor_type" NOT NULL,
	"actor_id" uuid,
	"actor_email" varchar(255),
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(100) NOT NULL,
	"metadata" jsonb,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payout_id" uuid NOT NULL,
	"dream_board_id" uuid NOT NULL,
	"type" "payout_item_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payout_items" ADD CONSTRAINT "valid_payout_item_amount" CHECK ("amount_cents" >= 0);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payout_items" ADD CONSTRAINT "payout_items_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payout_items" ADD CONSTRAINT "payout_items_dream_board_id_dream_boards_id_fk" FOREIGN KEY ("dream_board_id") REFERENCES "public"."dream_boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_target" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_actor" ON "audit_logs" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payout_items_payout" ON "payout_items" USING btree ("payout_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payout_items_dream_board" ON "payout_items" USING btree ("dream_board_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payout_items_type" ON "payout_items" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_payout_item_type" ON "payout_items" USING btree ("payout_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_payout_dream_board_type" ON "payouts" USING btree ("dream_board_id","type");

-- 0002_tranquil_firestar.sql
ALTER TABLE "dream_boards" ADD COLUMN "karri_card_number" text;
--> statement-breakpoint
ALTER TABLE "dream_boards" ADD CONSTRAINT "karri_card_required" CHECK ("payout_method" != 'karri_card_topup' OR "karri_card_number" IS NOT NULL);

-- 0003_sticky_logan.sql
CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"url" text NOT NULL,
	"events" text[] DEFAULT '{}'::text[] NOT NULL,
	"secret" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_endpoints_api_key" ON "webhook_endpoints" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_endpoints_active" ON "webhook_endpoints" USING btree ("is_active") WHERE "webhook_endpoints"."is_active" = true;

-- 0004_clumsy_dragon_lord.sql
CREATE TABLE IF NOT EXISTS "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "partners" ("id", "name", "created_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Partner', now())
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "partner_id" uuid;--> statement-breakpoint
ALTER TABLE "contributions" ADD COLUMN "partner_id" uuid;--> statement-breakpoint
ALTER TABLE "dream_boards" ADD COLUMN "partner_id" uuid;--> statement-breakpoint
ALTER TABLE "payouts" ADD COLUMN "partner_id" uuid;--> statement-breakpoint
UPDATE "api_keys" SET "partner_id" = '00000000-0000-0000-0000-000000000001' WHERE "partner_id" IS NULL;--> statement-breakpoint
UPDATE "dream_boards" SET "partner_id" = '00000000-0000-0000-0000-000000000001' WHERE "partner_id" IS NULL;--> statement-breakpoint
UPDATE "contributions" SET "partner_id" = '00000000-0000-0000-0000-000000000001' WHERE "partner_id" IS NULL;--> statement-breakpoint
UPDATE "payouts" SET "partner_id" = '00000000-0000-0000-0000-000000000001' WHERE "partner_id" IS NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "partner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contributions" ALTER COLUMN "partner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dream_boards" ALTER COLUMN "partner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payouts" ALTER COLUMN "partner_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_partners_name" ON "partners" USING btree ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contributions" ADD CONSTRAINT "contributions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dream_boards" ADD CONSTRAINT "dream_boards_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_api_keys_partner" ON "api_keys" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contributions_partner" ON "contributions" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dream_boards_partner" ON "dream_boards" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payouts_partner" ON "payouts" USING btree ("partner_id");

-- 0005_add_contributions_pending_processing_index.sql
CREATE INDEX IF NOT EXISTS "idx_contributions_pending_processing" ON "contributions" USING btree ("payment_status","created_at") WHERE "contributions"."payment_status" IN ('pending', 'processing');

-- 0006_add_pagination_indexes.sql
CREATE INDEX IF NOT EXISTS "idx_contributions_dream_board_created_at" ON "contributions" USING btree ("dream_board_id","created_at");
CREATE INDEX IF NOT EXISTS "idx_payouts_status_created_at" ON "payouts" USING btree ("status","created_at");

-- 0007_add_db_views.sql
-- Dream boards with computed totals view
CREATE OR REPLACE VIEW dream_boards_with_totals AS
SELECT
  db.id,
  db.slug,
  db.partner_id,
  db.host_id,
  db.child_name,
  db.child_photo_url,
  db.birthday_date,
  db.gift_type,
  db.gift_data,
  db.goal_cents,
  db.payout_method,
  db.overflow_gift_data,
  db.message,
  db.deadline,
  db.status,
  db.payout_email,
  db.created_at,
  db.updated_at,
  COALESCE(SUM(c.net_cents) FILTER (WHERE c.payment_status = 'completed'), 0) AS raised_cents,
  COUNT(c.id) FILTER (WHERE c.payment_status = 'completed') AS contribution_count,
  GREATEST(0, COALESCE(SUM(c.net_cents) FILTER (WHERE c.payment_status = 'completed'), 0) - db.goal_cents) AS overflow_cents
FROM dream_boards db
LEFT JOIN contributions c ON c.dream_board_id = db.id
GROUP BY db.id;

-- Expiring dream boards view (boards expiring within next 7 days)
CREATE OR REPLACE VIEW expiring_dream_boards AS
SELECT
  id,
  slug,
  child_name,
  deadline,
  status
FROM dream_boards
WHERE status = 'active'
  AND deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days';

-- 0008_chipin_simplification.sql
-- ChipIn Platform Simplification Migration
-- This migration implements the v2.0 schema changes:
-- - Removes Takealot and philanthropy integrations
-- - Adds manual gift definition with AI artwork
-- - Makes Karri Card the sole payout method
-- - Adds WhatsApp notification support

-- Add new columns for v2.0
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS gift_name VARCHAR(200);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS gift_image_url TEXT;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS gift_image_prompt TEXT;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS karri_card_number TEXT;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS karri_card_holder_name VARCHAR(100);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS host_whatsapp_number VARCHAR(20);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS party_date DATE;

-- Migrate existing data (if any Dream Boards exist)
UPDATE dream_boards
SET
  gift_name = COALESCE(
    gift_data->>'productName',
    gift_data->>'causeName',
    'Birthday Gift'
  ),
  gift_image_url = COALESCE(
    gift_data->>'productImage',
    gift_data->>'causeImage',
    child_photo_url
  ),
  party_date = COALESCE(birthday_date, deadline::date),
  karri_card_number = COALESCE(karri_card_number, 'legacy_unset'),
  karri_card_holder_name = COALESCE(karri_card_holder_name, 'Legacy host'),
  host_whatsapp_number = COALESCE(host_whatsapp_number, 'legacy_unset')
WHERE gift_name IS NULL
  OR gift_image_url IS NULL
  OR party_date IS NULL
  OR karri_card_number IS NULL
  OR karri_card_holder_name IS NULL
  OR host_whatsapp_number IS NULL;

ALTER TABLE dream_boards ALTER COLUMN gift_name SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN gift_image_url SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN party_date SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN karri_card_number SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN karri_card_holder_name SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN host_whatsapp_number SET NOT NULL;

ALTER TABLE dream_boards ALTER COLUMN karri_card_number TYPE TEXT;

-- Remove deprecated columns
ALTER TABLE dream_boards DROP COLUMN IF EXISTS overflow_gift_data;
ALTER TABLE dream_boards DROP COLUMN IF EXISTS gift_type;
ALTER TABLE dream_boards DROP COLUMN IF EXISTS gift_data;
ALTER TABLE dream_boards DROP COLUMN IF EXISTS birthday_date;
ALTER TABLE dream_boards DROP COLUMN IF EXISTS deadline;

-- Update payout_method enum (used in dream_boards)
ALTER TYPE payout_method RENAME TO payout_method_old;
CREATE TYPE payout_method AS ENUM ('karri_card');
ALTER TABLE dream_boards ALTER COLUMN payout_method DROP DEFAULT;
ALTER TABLE dream_boards ALTER COLUMN payout_method TYPE payout_method
  USING 'karri_card'::payout_method;
ALTER TABLE dream_boards ALTER COLUMN payout_method SET DEFAULT 'karri_card';
DROP TYPE payout_method_old;

-- Update payout_type enum (used in payouts)
ALTER TYPE payout_type RENAME TO payout_type_old;
CREATE TYPE payout_type AS ENUM ('karri_card');
ALTER TABLE payouts ALTER COLUMN type TYPE payout_type USING 'karri_card'::payout_type;
DROP TYPE payout_type_old;

-- Update payout_item_type enum (remove overflow)
ALTER TYPE payout_item_type RENAME TO payout_item_type_old;
CREATE TYPE payout_item_type AS ENUM ('gift');
ALTER TABLE payout_items ALTER COLUMN type TYPE payout_item_type USING 'gift'::payout_item_type;
DROP TYPE payout_item_type_old;

-- Remove unused gift_type enum
DROP TYPE IF EXISTS gift_type;

-- Create Karri credit queue table for batch processing
CREATE TABLE IF NOT EXISTS karri_credit_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_board_id UUID NOT NULL REFERENCES dream_boards(id),
  karri_card_number TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karri_queue_status ON karri_credit_queue(status);
CREATE INDEX IF NOT EXISTS idx_karri_queue_created ON karri_credit_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_karri_queue_dream_board ON karri_credit_queue(dream_board_id);

ALTER TABLE IF EXISTS karri_credit_queue
  ALTER COLUMN karri_card_number TYPE TEXT;
```
