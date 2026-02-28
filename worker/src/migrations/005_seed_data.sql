-- Migration: 005_seed_data.sql
-- Seed initial data for development / staging environments.
-- Safe to re-run: all inserts use INSERT OR IGNORE.

-- ── Products ──────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO products (id, name, description, price, category, in_stock)
VALUES
  ('prod-001', 'Solar Panel 400W',      'High-efficiency monocrystalline solar panel, 400W output',      450.00, 'solar',    1),
  ('prod-002', 'Solar Panel 600W',      'Premium monocrystalline solar panel, 600W output',              650.00, 'solar',    1),
  ('prod-003', 'Lithium Battery 100Ah', 'Deep-cycle lithium iron phosphate battery, 100Ah / 48V',        800.00, 'storage',  1),
  ('prod-004', 'Lithium Battery 200Ah', 'Deep-cycle lithium iron phosphate battery, 200Ah / 48V',       1500.00, 'storage',  1),
  ('prod-005', 'Hybrid Inverter 5kW',   'Grid-tied/off-grid hybrid inverter with MPPT charger, 5kW',   1200.00, 'inverter', 1),
  ('prod-006', 'Hybrid Inverter 10kW',  'Grid-tied/off-grid hybrid inverter with MPPT charger, 10kW',  2200.00, 'inverter', 1),
  ('prod-007', 'Mounting Rail Kit',     'Heavy-duty aluminium rail kit for roof or ground mount',        120.00, 'mounting', 1),
  ('prod-008', 'EV Charger 7kW',        'Smart single-phase AC EV charger with app control, 7kW',       600.00, 'ev',       1);

-- ── Users ─────────────────────────────────────────────────────────────────────
-- Passwords are bcrypt hashes of "admin123" (cost 10).
-- CHANGE THESE before any production deployment.
INSERT OR IGNORE INTO users (id, email, password_hash, name, role)
VALUES
  ('user-001', 'admin@revenueforge.io',   '$2b$10$K5GbSKSxY9iNdjM3W1e2GeWu4IaEE9P6fILW9pJ9UG7mKflbv2yGi', 'Admin User',    'admin'),
  ('user-002', 'dealer@revenueforge.io',  '$2b$10$K5GbSKSxY9iNdjM3W1e2GeWu4IaEE9P6fILW9pJ9UG7mKflbv2yGi', 'Demo Dealer',   'dealer'),
  ('user-003', 'viewer@revenueforge.io',  '$2b$10$K5GbSKSxY9iNdjM3W1e2GeWu4IaEE9P6fILW9pJ9UG7mKflbv2yGi', 'Read-only User','viewer');
