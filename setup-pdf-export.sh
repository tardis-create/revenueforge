#!/bin/bash
# Run this script to set up the PDF export feature
# Usage: bash setup-pdf-export.sh

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Setting up PDF Export feature..."

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Enter your Cloudflare API Token: "
    read -s CLOUDFLARE_API_TOKEN
fi

# Execute migration
cd "$SCRIPT_DIR/worker"

echo "Creating settings table..."
npx wrangler d1 execute revenueforge-db \
    --command="
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_public INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
);
" --remote

echo "Inserting default settings..."
npx wrangler d1 execute revenueforge-db \
    --command="
INSERT OR IGNORE INTO settings (key, value, category, is_public) VALUES
    ('company_name', '\"RevenueForge\"', 'branding', 1),
    ('primary_color', '\"#3b82f6\"', 'branding', 1),
    ('gst_number', '\"\"', 'contact', 1),
    ('signatory_name', '\"\"', 'contact', 1),
    ('signatory_designation', '\"\"', 'contact', 1),
    ('quote_terms', '\"Payment due within 30 days of invoice.\"', 'terms', 1);
" --remote

echo "Deploying worker..."
npx wrangler deploy --env production

echo "Done! PDF export is ready at POST /api/pdf/quotes/:id"