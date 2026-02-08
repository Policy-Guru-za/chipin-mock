ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ;

UPDATE contribution_reminders
SET next_attempt_at = remind_at
WHERE next_attempt_at IS NULL;

ALTER TABLE contribution_reminders
  ALTER COLUMN next_attempt_at SET NOT NULL;

DROP INDEX IF EXISTS idx_contribution_reminders_due;

CREATE INDEX IF NOT EXISTS idx_contribution_reminders_due
  ON contribution_reminders(next_attempt_at, remind_at)
  WHERE sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contribution_reminders_pending_board_email
  ON contribution_reminders(dream_board_id, email, remind_at)
  WHERE sent_at IS NULL;
