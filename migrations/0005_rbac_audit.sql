-- Non-Functional Requirements Schema for RevenueForge
-- Migration 0004: RBAC, Audit Logging, and Security

-- Users table for authentication and RBAC
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('admin', 'dealer', 'viewer')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit Log table: Records all API actions
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT, -- JSON string with additional context
    ip_address TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- API Keys table for service-to-service authentication
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('admin', 'dealer', 'viewer')),
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Rate Limit Log table for tracking rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    identifier TEXT NOT NULL,
    tier TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit_log(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_timestamp ON rate_limit_log(timestamp);

-- Insert default admin user (for development)
INSERT INTO users (id, email, name, role)
VALUES ('admin_001', 'admin@revenueforge.local', 'System Admin', 'admin')
ON CONFLICT DO NOTHING;

-- Insert default dealer user (for development)
INSERT INTO users (id, email, name, role)
VALUES ('dealer_001', 'dealer@revenueforge.local', 'Demo Dealer', 'dealer')
ON CONFLICT DO NOTHING;

-- Insert default viewer user (for development)
INSERT INTO users (id, email, name, role)
VALUES ('viewer_001', 'viewer@revenueforge.local', 'Demo Viewer', 'viewer')
ON CONFLICT DO NOTHING;
