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
