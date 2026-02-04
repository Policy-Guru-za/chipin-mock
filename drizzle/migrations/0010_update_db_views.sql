-- Update views to match simplified dream board schema
DROP VIEW IF EXISTS dream_boards_with_totals;
DROP VIEW IF EXISTS expiring_dream_boards;

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
  GREATEST(0, COALESCE(SUM(c.net_cents) FILTER (WHERE c.payment_status = 'completed'), 0) - db.goal_cents) AS overflow_cents
FROM dream_boards db
LEFT JOIN contributions c ON c.dream_board_id = db.id
GROUP BY db.id;

CREATE OR REPLACE VIEW expiring_dream_boards AS
SELECT
  id,
  slug,
  child_name,
  party_date,
  status
FROM dream_boards
WHERE status = 'active'
  AND party_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';
