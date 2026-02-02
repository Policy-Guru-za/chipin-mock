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
  party_date = COALESCE(birthday_date, deadline::date)
WHERE gift_name IS NULL OR party_date IS NULL;

-- Make required columns NOT NULL after data migration
-- Note: In production, verify data is migrated before running these
ALTER TABLE dream_boards ALTER COLUMN gift_name SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN party_date SET NOT NULL;

-- Update payout_method enum (used in dream_boards)
-- Note: Drizzle handles enum changes differently, this is for reference
-- The actual enum change is managed by Drizzle schema

-- Create Karri credit queue table for batch processing
CREATE TABLE IF NOT EXISTS karri_credit_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_board_id UUID NOT NULL REFERENCES dream_boards(id),
  karri_card_number VARCHAR(20) NOT NULL,
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
