WITH normalized AS (
  SELECT
    id,
    ARRAY_REMOVE(
      ARRAY[
        CASE
          WHEN events @> ARRAY['*']::text[] OR events @> ARRAY['contribution.received']::text[] THEN 'contribution.received'
          ELSE NULL
        END,
        CASE
          WHEN events @> ARRAY['*']::text[] OR events @> ARRAY['pot.funded']::text[] THEN 'pot.funded'
          ELSE NULL
        END
      ],
      NULL
    ) AS normalized_events
  FROM "webhook_endpoints"
  WHERE
    events @> ARRAY['*']::text[]
    OR EXISTS (
      SELECT 1
      FROM unnest(events) AS event_name
      WHERE event_name NOT IN ('contribution.received', 'pot.funded')
    )
)
UPDATE "webhook_endpoints" AS target
SET
  "events" = normalized.normalized_events,
  "is_active" = CASE
    WHEN cardinality(normalized.normalized_events) = 0 THEN false
    ELSE target."is_active"
  END,
  "updated_at" = NOW()
FROM normalized
WHERE target."id" = normalized."id";
