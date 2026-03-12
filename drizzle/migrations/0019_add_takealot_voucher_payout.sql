ALTER TYPE payout_method ADD VALUE IF NOT EXISTS 'takealot_voucher';
ALTER TYPE payout_type ADD VALUE IF NOT EXISTS 'takealot_voucher';

ALTER TABLE dream_boards
  ALTER COLUMN payout_method SET DEFAULT 'takealot_voucher';

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
    OR (
      payout_method = 'takealot_voucher'
      AND karri_card_number IS NULL
      AND karri_card_holder_name IS NULL
      AND bank_name IS NULL
      AND bank_account_number_encrypted IS NULL
      AND bank_account_last4 IS NULL
      AND bank_branch_code IS NULL
      AND bank_account_holder IS NULL
    )
  );
