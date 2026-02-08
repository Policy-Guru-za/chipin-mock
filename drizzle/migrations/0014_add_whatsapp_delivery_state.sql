ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_phone_e164 VARCHAR(20);

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_wa_id VARCHAR(32);

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out_at TIMESTAMPTZ;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMPTZ;

ALTER TABLE contribution_reminders
  ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_contribution_reminders_pending_whatsapp
  ON contribution_reminders(next_attempt_at, remind_at)
  WHERE sent_at IS NULL
    AND whatsapp_phone_e164 IS NOT NULL
    AND whatsapp_opt_in_at IS NOT NULL
    AND whatsapp_opt_out_at IS NULL
    AND whatsapp_sent_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_contribution_reminders_whatsapp_message_id
  ON contribution_reminders(whatsapp_message_id);

CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 VARCHAR(20) NOT NULL,
  wa_id VARCHAR(32),
  last_inbound_at TIMESTAMPTZ,
  csw_expires_at TIMESTAMPTZ,
  opt_in_at TIMESTAMPTZ,
  opt_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_whatsapp_contacts_phone
  ON whatsapp_contacts(phone_e164);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_wa_id
  ON whatsapp_contacts(wa_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_csw_expires_at
  ON whatsapp_contacts(csw_expires_at);

CREATE TABLE IF NOT EXISTS whatsapp_message_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id VARCHAR(255),
  direction VARCHAR(16) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  status VARCHAR(32),
  recipient_wa_id VARCHAR(32),
  recipient_phone_e164 VARCHAR(20),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_message_events_message_id
  ON whatsapp_message_events(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_events_status
  ON whatsapp_message_events(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_events_recipient_wa_id
  ON whatsapp_message_events(recipient_wa_id);
