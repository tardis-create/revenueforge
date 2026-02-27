import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Env } from '../types';
import type { AuditLogEntry } from '../utils/auditLog';

const auditLog = new Hono<{ Bindings: Env }>();

/**
 * GET /api/audit-log — List audit log entries with optional filters.
 * Admin only.
 * Query params: user_id, action, resource_type, resource_id, start_date, end_date, page, limit
 */
auditLog.get('/', requireAuth, requireRole('admin'), async (c) => {
  const db = c.env.DB;

  const { user_id, action, resource_type, resource_id, start_date, end_date } = c.req.query();
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (user_id) { conditions.push('user_id = ?'); params.push(user_id); }
  if (action) { conditions.push('action = ?'); params.push(action); }
  if (resource_type) { conditions.push('resource_type = ?'); params.push(resource_type); }
  if (resource_id) { conditions.push('resource_id = ?'); params.push(resource_id); }
  if (start_date) { conditions.push('timestamp >= ?'); params.push(start_date); }
  if (end_date) { conditions.push('timestamp <= ?'); params.push(end_date); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM audit_log ${where}`)
      .bind(...params)
      .first<{ total: number }>();

    const rows = await db
      .prepare(`SELECT * FROM audit_log ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`)
      .bind(...params, limit, offset)
      .all<AuditLogEntry>();

    const entries = rows.results.map((e) => ({
      ...e,
      details: e.details ? JSON.parse(e.details as string) : undefined,
    }));

    return c.json({
      data: entries,
      pagination: {
        page,
        limit,
        total: countResult?.total ?? 0,
        pages: Math.ceil((countResult?.total ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/audit-log error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/audit-log/resource/:type/:id — Get audit history for a specific resource.
 * Admin only.
 */
auditLog.get('/resource/:type/:id', requireAuth, requireRole('admin'), async (c) => {
  const db = c.env.DB;
  const { type, id } = c.req.param();
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);

  try {
    const rows = await db
      .prepare(
        `SELECT * FROM audit_log WHERE resource_type = ? AND resource_id = ? ORDER BY timestamp DESC LIMIT ?`
      )
      .bind(type, id, limit)
      .all<AuditLogEntry>();

    const entries = rows.results.map((e) => ({
      ...e,
      details: e.details ? JSON.parse(e.details as string) : undefined,
    }));

    return c.json({ data: entries });
  } catch (err) {
    console.error('GET /api/audit-log/resource/:type/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default auditLog;
