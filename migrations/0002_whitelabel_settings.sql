-- Migration: White-Label Settings
-- Creates the white_label_settings table for per-tenant customization

CREATE TABLE IF NOT EXISTS white_label_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id TEXT NOT NULL UNIQUE,
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  company_name TEXT NOT NULL DEFAULT 'RevenueForge',
  -- Colors (stored as hex strings e.g. #RRGGBB)
  primary_color TEXT NOT NULL DEFAULT '#6366f1',
  secondary_color TEXT NOT NULL DEFAULT '#8b5cf6',
  accent_color TEXT NOT NULL DEFAULT '#06b6d4',
  background_color TEXT NOT NULL DEFAULT '#0f172a',
  text_color TEXT NOT NULL DEFAULT '#f8fafc',
  -- Custom domain
  custom_domain TEXT,
  -- Additional settings
  custom_css TEXT,
  support_email TEXT,
  support_url TEXT,
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_whitelabel_tenant ON white_label_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_domain ON white_label_settings(custom_domain);
