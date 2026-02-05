-- Gifta UX v2 data model expansion
-- Adds schema support for:
-- - Internal host notification preferences
-- - Birthday + campaign date fields
-- - Bank payout method
-- - Charity split Option A (percentage bps OR threshold cents)
-- - Contribution reminders

-- Enums
ALTER TYPE payout_method ADD VALUE IF NOT EXISTS 'bank';
ALTER TYPE payout_type ADD VALUE IF NOT EXISTS 'bank';
ALTER TYPE payout_type ADD VALUE IF NOT EXISTS 'charity';
ALTER TYPE payout_item_type ADD VALUE IF NOT EXISTS 'charity';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'charity_split_type') THEN
    CREATE TYPE charity_split_type AS ENUM ('percentage', 'threshold');
  END IF;
END $$;

-- Hosts
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Charities
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  logo_url TEXT NOT NULL,
  website TEXT,
  bank_details_encrypted JSONB NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_charities_name ON charities(name);
CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);
CREATE INDEX IF NOT EXISTS idx_charities_active ON charities(is_active) WHERE is_active = true;

-- Dream boards
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS child_age INTEGER;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS birthday_date DATE;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS campaign_end_date DATE;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS gift_description TEXT;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS bank_name VARCHAR(120);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS bank_account_number_encrypted TEXT;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS bank_account_last4 VARCHAR(4);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS bank_branch_code VARCHAR(20);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(120);
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS charity_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS charity_id UUID REFERENCES charities(id) ON DELETE SET NULL;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS charity_split_type charity_split_type;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS charity_percentage_bps INTEGER;
ALTER TABLE dream_boards ADD COLUMN IF NOT EXISTS charity_threshold_cents INTEGER;

ALTER TABLE dream_boards ALTER COLUMN karri_card_number DROP NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN karri_card_holder_name DROP NOT NULL;

UPDATE dream_boards
SET campaign_end_date = party_date
WHERE campaign_end_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_dream_boards_campaign_end_date
  ON dream_boards(campaign_end_date)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_dream_boards_charity_enabled ON dream_boards(charity_enabled);
CREATE INDEX IF NOT EXISTS idx_dream_boards_payout_method ON dream_boards(payout_method);

ALTER TABLE dream_boards DROP CONSTRAINT IF EXISTS valid_dream_board_dates;
ALTER TABLE dream_boards
  ADD CONSTRAINT valid_dream_board_dates
  CHECK (
    (birthday_date IS NULL OR party_date >= birthday_date)
    AND (campaign_end_date IS NULL OR campaign_end_date <= party_date)
  );

ALTER TABLE dream_boards DROP CONSTRAINT IF EXISTS valid_charity_split_config;
ALTER TABLE dream_boards
  ADD CONSTRAINT valid_charity_split_config
  CHECK (
    (
      charity_enabled = false
      AND charity_id IS NULL
      AND charity_split_type IS NULL
      AND charity_percentage_bps IS NULL
      AND charity_threshold_cents IS NULL
    )
    OR (
      charity_enabled = true
      AND charity_id IS NOT NULL
      AND (
        (
          charity_split_type = 'percentage'
          AND charity_percentage_bps BETWEEN 500 AND 5000
          AND charity_threshold_cents IS NULL
        )
        OR (
          charity_split_type = 'threshold'
          AND charity_threshold_cents >= 5000
          AND charity_percentage_bps IS NULL
        )
      )
    )
  );

ALTER TABLE dream_boards DROP CONSTRAINT IF EXISTS valid_dream_board_payout_data;
ALTER TABLE dream_boards
  ADD CONSTRAINT valid_dream_board_payout_data
  CHECK (
    (
      payout_method = 'karri_card'
      AND karri_card_number IS NOT NULL
      AND karri_card_holder_name IS NOT NULL
    )
    OR (
      payout_method = 'bank'
      AND bank_name IS NOT NULL
      AND bank_account_number_encrypted IS NOT NULL
      AND bank_account_last4 IS NOT NULL
      AND bank_branch_code IS NOT NULL
      AND bank_account_holder IS NOT NULL
    )
  );

-- Contributions
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS contributor_email VARCHAR(255);
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS charity_cents INTEGER;

ALTER TABLE contributions DROP CONSTRAINT IF EXISTS valid_charity_amount;
ALTER TABLE contributions
  ADD CONSTRAINT valid_charity_amount
  CHECK (
    charity_cents IS NULL
    OR (charity_cents >= 0 AND charity_cents <= amount_cents)
  );

-- Payouts
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS charity_cents INTEGER NOT NULL DEFAULT 0;

ALTER TABLE payouts DROP CONSTRAINT IF EXISTS valid_amounts;
ALTER TABLE payouts
  ADD CONSTRAINT valid_amounts
  CHECK (
    gross_cents >= net_cents
    AND charity_cents >= 0
    AND net_cents >= 0
  );

-- Contribution reminders
CREATE TABLE IF NOT EXISTS contribution_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_board_id UUID NOT NULL REFERENCES dream_boards(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_reminders_dream_board
  ON contribution_reminders(dream_board_id);
CREATE INDEX IF NOT EXISTS idx_contribution_reminders_due
  ON contribution_reminders(remind_at)
  WHERE sent_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_contribution_reminder
  ON contribution_reminders(dream_board_id, email, remind_at);
