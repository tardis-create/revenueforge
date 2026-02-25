-- RFQ Submissions Schema for RevenueForge
-- Migration 0003: Request for Quote submissions

-- RFQ Submissions table: Stores quote requests from the RFQ form
CREATE TABLE IF NOT EXISTS rfq_submissions (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_type TEXT,
    project_description TEXT,
    estimated_budget TEXT,
    timeline TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewing', 'quoted', 'accepted', 'rejected')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfq_submissions_status ON rfq_submissions(status);
CREATE INDEX IF NOT EXISTS idx_rfq_submissions_email ON rfq_submissions(email);
CREATE INDEX IF NOT EXISTS idx_rfq_submissions_created_at ON rfq_submissions(created_at);
