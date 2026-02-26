# RF-B14: D1 Schema Migration

## Overview
RevenueForge has been migrated from mock data to Cloudflare D1 database schema.

## Architecture

### Frontend (this repository)
- **Framework:** Next.js 15.5.2
- **Deployment:** Cloudflare Pages
- **API:** Calls Worker API at `https://revenueforge-api.pronitopenclaw.workers.dev`
- **Database Binding:** D1 (for future server-side rendering features)

### Backend API (separate repository)
- **Repository:** `/home/pronit/workspace/revenueforge-workers`
- **Framework:** Hono.js
- **Runtime:** Cloudflare Workers
- **Database:** D1 (SQLite)

### Database
- **Name:** revenueforge-db
- **ID:** da0624be-7f9c-4fc7-809a-c79c5641896b
- **Type:** Cloudflare D1 (SQLite)
- **Region:** OC (Sydney)

## Database Schema

### Core Tables

#### 1. products
Product catalog with full details.
```sql
- id (TEXT, PRIMARY KEY)
- name, sku, category, industry
- description, technical_specs (JSON)
- price_range, price, image_url
- stock, is_active
- created_at, updated_at
```
**Records:** 8 products seeded

#### 2. users
User authentication and RBAC.
```sql
- id (TEXT, PRIMARY KEY)
- email (UNIQUE)
- name, role (admin/dealer/viewer)
- password_hash (bcrypt)
- is_active
- created_at, updated_at
```
**Records:** 5 users (3 test users with password: admin123)

#### 3. rfq_submissions
RFQ form submissions.
```sql
- id (TEXT, PRIMARY KEY)
- company_name, contact_name, email, phone
- service_type, project_description
- estimated_budget, timeline
- status (new/reviewing/quoted/accepted/rejected)
- notes, created_at, updated_at
```
**Records:** 3 sample submissions

#### 4. quotes
Quotation management.
```sql
- id (TEXT, PRIMARY KEY)
- rfq_id (FK → rfq_submissions)
- amount, currency, validity_days, valid_until
- terms, status (draft/sent/accepted/rejected/expired)
- pdf_url, notes
- created_at, updated_at, sent_at, accepted_at, rejected_at
```
**Records:** 2 sample quotes

#### 5. quote_items
Line items for quotes.
```sql
- id (TEXT, PRIMARY KEY)
- quote_id (FK → quotes)
- product_id (FK → products)
- description, quantity
- unit_price, total_price
- created_at
```
**Records:** 6 line items

#### 6. leads
CRM pipeline leads.
```sql
- id (TEXT, PRIMARY KEY)
- company_name, contact_name, email, phone
- status (new/qualified/rfq/quoted/won/lost)
- assigned_to, source, estimated_value
- notes, created_at, updated_at
```
**Records:** 3 sample leads

### Supporting Tables

#### 7. lead_activities
Activity tracking for leads.
```sql
- id, lead_id (FK), type, description
- created_at, created_by
```

#### 8. follow_ups
Scheduled follow-ups.
```sql
- id, lead_id (FK), scheduled_at, notes
- completed, completed_at
```

#### 9. dealers
Dealer/partner management.
```sql
- id, company_name, contact_name, email, phone
- territory, commission_rate, is_active
- created_at, updated_at
```
**Records:** 3 dealers

#### 10. dealer_orders
Order attribution to dealers.
```sql
- id, dealer_id (FK), order_id, order_type
- commission_amount, status
- created_at
```

#### 11. email_templates
Email template library.
```sql
- id, name, subject, body (HTML)
- variables (JSON), is_active
- created_at, updated_at
```
**Records:** 3 templates (quote, RFQ, lead assignment)

#### 12. rate_limit
D1-based rate limiting.
```sql
- email (UNIQUE), attempts, window_start
```

## Migrations

### Frontend Repository (`/home/pronit/workspace/revenueforge/migrations/`)
These migrations define the schema structure:
1. `0001_products.sql` - Product catalog
2. `0002_crm_schema.sql` - Leads, activities, follow-ups
3. `0003_rfq_submissions.sql` - RFQ submissions
4. `0004_quotes.sql` - Quotes and line items
5. `0005_rbac_audit.sql` - Users and audit logging

### Worker API Repository (`/home/pronit/workspace/revenueforge-workers/migrations/`)
These migrations were applied to production:
1. `0001_rate_limit_table.sql` - Rate limiting
2. `0002_leads_crm_tables.sql` - CRM tables
3. `0003_quotes_tables.sql` - Quotes system
4. `0004_email_templates_dealers.sql` - Email and dealers
5. `0005_seed_data.sql` - Initial seed data

## API Integration

The frontend makes API calls to the Worker:
```typescript
// lib/api.ts
export const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev'

// Example usage
const response = await fetch(`${API_BASE_URL}/api/products`)
```

All API routes in the Worker use D1 queries:
```typescript
// In revenueforge-workers/index.ts
const result = await c.env.DB.prepare(
  'SELECT * FROM products WHERE is_active = 1'
).all()
```

## Test Credentials

All test users have password: `admin123`

| Email | Role | Access Level |
|-------|------|--------------|
| admin@revenueforge.local | admin | Full access |
| dealer@revenueforge.local | dealer | Dealer portal |
| viewer@revenueforge.local | viewer | Read-only |

## Acceptance Criteria

- ✅ Create D1 database schema for RevenueForge
- ✅ Write migrations for: products, users, rfqs, quotes
- ✅ Seed initial data
- ✅ API routes read from D1 instead of mock data
- ✅ Schema supports: products catalog, user auth, RFQ submissions, quote management

## Database Status

| Table | Records | Status |
|-------|---------|--------|
| products | 8 | ✅ Seeded |
| users | 5 | ✅ Seeded |
| leads | 3 | ✅ Seeded |
| rfq_submissions | 3 | ✅ Seeded |
| quotes | 2 | ✅ Seeded |
| quote_items | 6 | ✅ Seeded |
| dealers | 3 | ✅ Seeded |
| email_templates | 3 | ✅ Seeded |
| lead_activities | 0 | ✅ Ready |
| follow_ups | 0 | ✅ Ready |
| dealer_orders | 0 | ✅ Ready |
| rate_limit | 0 | ✅ Ready |

## Deployment

### Local Development
```bash
# Frontend
npm run dev

# Worker API (separate terminal)
cd /home/pronit/workspace/revenueforge-workers
npm run dev
```

### Production
- **Frontend:** Deployed on Cloudflare Pages
- **Worker API:** Deployed on Cloudflare Workers
- **Database:** D1 production database (region: OC)

## Notes

1. **No Mock Data:** All API routes use D1 queries. No in-memory mock data.
2. **Separation of Concerns:** Frontend (Next.js) calls Worker API (Hono.js) which uses D1.
3. **Shared Database:** Both repositories use the same D1 database instance.
4. **Rate Limiting:** Implemented in D1 (no in-memory state).
5. **Soft Deletes:** Tables support soft delete with `deleted_at` columns.

## Related Documentation

- [revenueforge-workers/RF-B14_MIGRATION_COMPLETE.md](../revenueforge-workers/RF-B14_MIGRATION_COMPLETE.md)
- [revenueforge-workers/TASK_COMPLETE.json](../revenueforge-workers/TASK_COMPLETE.json)

---

**Task ID:** horfojle1smsddj
**Branch:** feat/rf-b14-schema-migration
**Status:** ✅ COMPLETE
**Date:** 2026-02-27
