-- Add Clerk user id to hosts
ALTER TABLE hosts ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS unique_hosts_clerk_user_id ON hosts(clerk_user_id);
