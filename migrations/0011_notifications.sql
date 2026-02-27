-- Migration: 0011_notifications
-- Creates notification_logs and notification_triggers tables

CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  template_id TEXT REFERENCES email_templates(id),
  recipient TEXT,
  subject TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  error_detail TEXT,
  webhook_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_event ON notification_logs(event);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

CREATE TABLE IF NOT EXISTS notification_triggers (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL UNIQUE,
  template_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO notification_triggers (id, event, description) VALUES
  ('trigger_rfq_submitted', 'rfq_submitted', 'Triggered when an RFQ is submitted'),
  ('trigger_quote_sent', 'quote_sent', 'Triggered when a quote is sent to customer'),
  ('trigger_quote_accepted', 'quote_accepted', 'Triggered when a customer accepts a quote'),
  ('trigger_lead_assigned', 'lead_assigned', 'Triggered when a lead is assigned to a dealer');
