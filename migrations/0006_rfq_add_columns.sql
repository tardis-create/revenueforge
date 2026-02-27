-- Migration 0006: Add quantity, unit, and lead_id columns to rfq_submissions
-- Fixes RF-F11: Missing columns causing HTTP 500 on RFQ submission

ALTER TABLE rfq_submissions ADD COLUMN quantity INTEGER;
ALTER TABLE rfq_submissions ADD COLUMN unit TEXT;
ALTER TABLE rfq_submissions ADD COLUMN lead_id TEXT;
