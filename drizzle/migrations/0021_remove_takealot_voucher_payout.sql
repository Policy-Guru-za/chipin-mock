DO $$
DECLARE
  voucher_board_count integer;
  voucher_payout_count integer;
BEGIN
  SELECT COUNT(*)
  INTO voucher_board_count
  FROM dream_boards
  WHERE payout_method::text = 'takealot_voucher';

  SELECT COUNT(*)
  INTO voucher_payout_count
  FROM payouts
  WHERE type::text = 'takealot_voucher';

  IF voucher_board_count > 0 OR voucher_payout_count > 0 THEN
    RAISE EXCEPTION
      '0021_remove_takealot_voucher_payout aborted: found % voucher dream_boards and % voucher payouts. Preserve voucher-era data via manual remediation before removing enum values.',
      voucher_board_count,
      voucher_payout_count;
  END IF;
END $$;

DROP VIEW IF EXISTS dream_boards_with_totals;

ALTER TABLE dream_boards
  ALTER COLUMN payout_method SET DEFAULT 'bank';

ALTER TABLE dream_boards DROP CONSTRAINT IF EXISTS valid_dream_board_payout_data;

ALTER TYPE payout_method RENAME TO payout_method_old;
CREATE TYPE payout_method AS ENUM ('karri_card', 'bank');
ALTER TABLE dream_boards ALTER COLUMN payout_method DROP DEFAULT;
ALTER TABLE dream_boards ALTER COLUMN payout_method TYPE payout_method
  USING (payout_method::text)::payout_method;
ALTER TABLE dream_boards ALTER COLUMN payout_method SET DEFAULT 'bank';
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
DROP TYPE payout_method_old;

ALTER TYPE payout_type RENAME TO payout_type_old;
CREATE TYPE payout_type AS ENUM ('karri_card', 'bank', 'charity');
ALTER TABLE payouts ALTER COLUMN type TYPE payout_type USING (type::text)::payout_type;
DROP TYPE payout_type_old;

CREATE OR REPLACE VIEW dream_boards_with_totals AS
SELECT
  db.id,
  db.slug,
  db.partner_id,
  db.host_id,
  db.child_name,
  db.child_photo_url,
  db.party_date,
  db.gift_name,
  db.gift_image_url,
  db.gift_image_prompt,
  db.payout_method,
  db.goal_cents,
  db.message,
  db.status,
  db.payout_email,
  db.created_at,
  db.updated_at,
  COALESCE(SUM(c.net_cents) FILTER (WHERE c.payment_status = 'completed'), 0) AS raised_cents,
  COUNT(c.id) FILTER (WHERE c.payment_status = 'completed') AS contribution_count,
  GREATEST(
    0,
    COALESCE(SUM(c.net_cents) FILTER (WHERE c.payment_status = 'completed'), 0) - db.goal_cents
  ) AS overflow_cents
FROM dream_boards db
LEFT JOIN contributions c ON c.dream_board_id = db.id
GROUP BY db.id;
