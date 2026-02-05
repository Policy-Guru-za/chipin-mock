# Demo DB Full Reset (Destructive)

This resets a **demo/sandbox** Postgres database to match the current schema used by the app.

## Preconditions

- `DATABASE_URL` points at a **non-production** database.
- You have `psql` available locally.

## 1) Drop and recreate schema (DESTRUCTIVE)

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO PUBLIC;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 2) Push current Drizzle schema

```bash
pnpm drizzle:push
```

## 3) Apply SQL views

The app expects SQL views (e.g. `dream_boards_with_totals`, `expiring_dream_boards`) defined in `drizzle/migrations/*`.

```bash
psql "$DATABASE_URL" -f drizzle/migrations/0010_update_db_views.sql
```

## 4) Seed demo data

```bash
pnpm db:seed
```

## Notes

- If you add/modify views, update the `psql -f` step to run the latest view migration.
- If `CARD_DATA_ENCRYPTION_KEY` is required by your environment, set it before running seed flows.
