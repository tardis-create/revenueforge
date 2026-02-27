-- Migration: Add dealer_id column to leads table
-- RF-B08 fix: enable dealer assignment for leads

ALTER TABLE leads ADD COLUMN dealer_id TEXT REFERENCES dealers(id);

CREATE INDEX IF NOT EXISTS idx_leads_dealer_id ON leads(dealer_id);
