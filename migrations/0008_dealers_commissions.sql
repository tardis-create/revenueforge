-- Migration: Dealers and Commissions tables
-- RF-B08

CREATE TABLE IF NOT EXISTS dealers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  region TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  commission_rate REAL NOT NULL DEFAULT 0.0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);

CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  lead_id TEXT,
  amount REAL NOT NULL,
  rate REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  description TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commissions_dealer_id ON commissions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- Add dealer_id to leads table if it exists (may or may not exist)
-- Using a safe approach: alter only if column doesn't exist
-- D1/SQLite doesn't support IF NOT EXISTS for columns, handled in app logic
