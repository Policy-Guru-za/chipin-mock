ALTER TABLE dream_boards
  ALTER COLUMN goal_cents SET DEFAULT 0;

ALTER TABLE dream_boards
  DROP CONSTRAINT IF EXISTS valid_goal;

ALTER TABLE dream_boards
  ADD CONSTRAINT valid_goal CHECK (goal_cents >= 0);
