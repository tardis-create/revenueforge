-- Migration: Orders table for dealer portal
-- RF-DealerOrders

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount REAL NOT NULL,
  commission REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_dealer_id ON orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
