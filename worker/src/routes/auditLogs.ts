import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Env } from '../types';

const auditLogs = new Hono<{ Bindings: Env }>();

/**
 * GET /api/audit-logs
 * List audit logs with pagination and filters.
 * Admin only.
 */
auditLogs.get('/', requireAuth, requireRole('admin'), async (c) => {
  const db = c.env.DB;

  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const offset = (page - 1) * limit;

  // Filters
  const userId = c.req.query('user_id') || null;
  const action = c.req.query('action') || null;
  const dateFrom = c.req.query('date_from') || null; // ISO string e.g. 2025-01-01T00:00:00Z
  const dateTo = c.req.query('date_to') || null;

  // Build WHERE clauses dynamically
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (userId) { conditions.push('user_id = ?'); params.push(userId); }
  if (action) { conditions.push('action = ?'); params.push(action); }
  if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
  if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM audit_logs ${where}`)
      .bind(...params)
      .first();
    const total = (countResult?.total as number) || 0;

    const rows = await db
      .prepare(
        `SELECT id, user_id, action, resource_type, resource_id, metadata, created_at
         FROM audit_logs ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all();

    // Parse metadata JSON for each row
    const data = rows.results.map((row: any) => ({
      ...row,
      metadata: row.metadata ? (() => { try { return JSON.parse(row.metadata); } catch { return row.metadata; } })() : null,
    }));

    return c.json({
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/audit-logs error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default auditLogs;
