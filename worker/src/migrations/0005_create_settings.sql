-- Create Settings table for White-label tenant configuration
-- Migration: 0005_create_settings

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_public INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
);

-- Index for faster category-based queries
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON settings(is_public);

-- Insert default settings
INSERT INTO settings (key, value, category, is_public) VALUES
    -- Branding settings (public)
    ('company_name', '"RevenueForge"', 'branding', 1),
    ('logo_url', '"/logo.svg"', 'branding', 1),
    ('primary_color', '"#3b82f6"', 'branding', 1),
    ('accent_color', '"#8b5cf6"', 'branding', 1),
    ('tagline', '"Industrial Solutions, Delivered"', 'branding', 1),
    
    -- Contact settings (public)
    ('address', '"123 Industrial Way, Tech Park"', 'contact', 1),
    ('phone', '"+1 (555) 123-4567"', 'contact', 1),
    ('email', '"contact@revenueforge.com"', 'contact', 1),
    
    -- PDF generation settings (public)
    ('gst_number', '""', 'contact', 1),
    ('signatory_name', '""', 'contact', 1),
    ('signatory_designation', '""', 'contact', 1),
    ('quote_terms', '"Payment due within 30 days of invoice. Quote valid for 30 days from date of issue."', 'terms', 1),
    ('invoice_terms', '"Payment due within 30 days of invoice."', 'terms', 1),
    
    -- SMTP settings (private - admin only)
    ('smtp_host', '""', 'smtp', 0),
    ('smtp_port', '"587"', 'smtp', 0),
    ('smtp_user', '""', 'smtp', 0),
    ('smtp_password', '""', 'smtp', 0),
    ('smtp_from', '""', 'smtp', 0),
    
    -- Feature flags (private - admin only)
    ('feature_dealer_portal', '"enabled"', 'features', 0),
    ('feature_analytics', '"enabled"', 'features', 0),
    ('feature_rfq_form', '"enabled"', 'features', 0);