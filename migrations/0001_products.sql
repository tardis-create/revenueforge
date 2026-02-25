-- RevenueForge Products Schema
-- Migration: 0001_products.sql

-- Products table for product catalog
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  technical_specs TEXT, -- JSON string
  price_range TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_industry ON products(industry);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Insert sample products for testing
INSERT INTO products (id, name, sku, category, industry, description, technical_specs, price_range, image_url, is_active)
VALUES 
  ('prod_001', 'Industrial Sensor Pro', 'ISP-001', 'Sensors', 'Manufacturing', 'High-precision industrial sensor for real-time monitoring', '{"accuracy": "0.01%", "range": "-40C to 85C", "connectivity": "WiFi, Bluetooth"}', '$500-$800', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400', 1),
  ('prod_002', 'Smart Valve Controller', 'SVC-002', 'Controllers', 'Oil & Gas', 'Automated valve control system with remote monitoring', '{"pressure_rating": "3000 PSI", "response_time": "<50ms", "protocol": "Modbus RTU"}', '$1,200-$1,800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 1),
  ('prod_003', 'Pressure Gauge Digital', 'PGD-003', 'Measurement', 'Manufacturing', 'Digital pressure gauge with LCD display and data logging', '{"range": "0-1000 PSI", "resolution": "0.1 PSI", "memory": "1000 readings"}', '$150-$300', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', 1),
  ('prod_004', 'Flow Meter Ultrasonic', 'FMU-004', 'Measurement', 'Water Treatment', 'Non-invasive ultrasonic flow meter for liquids', '{"accuracy": "±1%", "pipe_size": "0.5-4 inch", "output": "4-20mA"}', '$800-$1,500', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400', 1),
  ('prod_005', 'Safety Switch Emergency', 'SSE-005', 'Safety', 'All Industries', 'Emergency stop switch with lockout capability', '{"rating": "IP67", "contacts": "2NO+2NC", "certification": "CE, UL"}', '$50-$120', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400', 1),
  ('prod_006', 'Temperature Controller', 'TMC-006', 'Controllers', 'Food & Beverage', 'PID temperature controller for process automation', '{"channels": "2", "accuracy": "±0.1C", "alarms": "4 programmable"}', '$250-$450', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 1),
  ('prod_007', 'Vibration Analyzer', 'VBA-007', 'Analysis', 'Manufacturing', 'Portable vibration analyzer for predictive maintenance', '{"frequency": "0-20kHz", "channels": "4", "battery": "8 hours"}', '$2,500-$4,000', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400', 1),
  ('prod_008', 'Level Sensor Radar', 'LSR-008', 'Sensors', 'Chemical', 'Radar level sensor for tanks and silos', '{"range": "0-30m", "accuracy": "±3mm", "output": "4-20mA, HART"}', '$1,800-$2,500', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400', 1);
