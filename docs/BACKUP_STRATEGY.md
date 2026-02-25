# D1 Backup Strategy for RevenueForge

## Overview

This document outlines the backup strategy for RevenueForge's Cloudflare D1 database.

## Automated Backups

Cloudflare D1 provides **automatic daily backups** with the following characteristics:

- **Retention Period**: 30 days
- **Backup Time**: Daily snapshots taken automatically
- **Recovery**: Point-in-time recovery available via Cloudflare Dashboard or API
- **Cost**: Included in D1 pricing

## Manual Backup Procedures

### Option 1: Using Wrangler CLI (Recommended)

```bash
# Export the entire database to SQL
npx wrangler d1 export revenueforge-db --output=./backups/revenueforge-backup-$(date +%Y%m%d).sql

# Or use the database ID directly
npx wrangler d1 export da0624be-7f9c-4fc7-809a-c79c5641896b --output=./backups/revenueforge-backup-$(date +%Y%m%d).sql
```

### Option 2: Using Cloudflare Dashboard

1. Navigate to Workers & Pages → D1
2. Select `revenueforge-db`
3. Click "Export" → "Export as SQL"
4. Download the `.sql` file

### Option 3: Scheduled Automated Exports

Create a GitHub Action or Cron job for regular exports:

```yaml
# .github/workflows/backup.yml
name: D1 Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: d1 export revenueforge-db --output=./backups/revenueforge-backup-$(date +%Y%m%d).sql
```

## Backup Retention Policy

| Backup Type | Retention | Storage Location |
|-------------|-----------|------------------|
| Cloudflare Auto | 30 days | Cloudflare infrastructure |
| Manual (Dev) | 7 days | Local dev machine |
| GitHub Actions | 90 days | GitHub Artifacts |

## Restore Procedures

### Restore from Cloudflare Backup

1. Contact Cloudflare Support for point-in-time recovery
2. Or create a new database from backup via Dashboard

### Restore from SQL Export

```bash
# Create a new D1 database for testing
npx wrangler d1 create revenueforge-db-restore

# Import the SQL backup
npx wrangler d1 execute revenueforge-db-restore --file=./backups/revenueforge-backup-20240226.sql
```

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 24 hours

### Steps for Full Disaster Recovery:

1. **Assess Damage** (15 min)
   - Determine scope of data loss/corruption
   - Check Cloudflare status page for incidents

2. **Create New Database** (5 min)
   ```bash
   npx wrangler d1 create revenueforge-db-recovery
   ```

3. **Restore Data** (30-60 min)
   - Use latest valid backup
   - Apply any pending migrations

4. **Update Configuration** (5 min)
   - Update `wrangler.toml` with new database_id
   - Redeploy Worker with new binding

5. **Verify Data Integrity** (30 min)
   - Run health checks
   - Verify critical data tables

6. **Notify Stakeholders** (ongoing)
   - Update status page
   - Notify users of recovery

## Audit Table Backup Considerations

The `audit_log` table grows over time. Consider:

- **Archiving old audit logs** (older than 1 year) to R2
- **Partitioning strategy** by month/year
- **Separate audit database** for high-volume logging

## Monitoring

Set up monitoring for:

- Database size growth
- Failed backup notifications
- Restore test results (monthly drills)

## Contact

For backup/restore issues:
- Primary: DevOps team
- Escalation: Cloudflare Support
