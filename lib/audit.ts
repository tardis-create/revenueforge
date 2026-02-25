// Audit Logging Utilities for RevenueForge

import type { D1Database } from '@cloudflare/workers-types';

export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown> | string;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'unassign'
  | 'api_call';

export interface AuditLogFilters {
  user_id?: string;
  action?: AuditAction;
  resource_type?: string;
  resource_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Generate a unique audit log ID
 */
export function generateAuditLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `audit_${timestamp}${random}`;
}

/**
 * Log an action to the audit log
 */
export async function logAction(
  db: D1Database,
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<void> {
  const id = generateAuditLogId();
  const timestamp = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO audit_log (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      entry.user_id ?? null,
      entry.action,
      entry.resource_type,
      entry.resource_id ?? null,
      entry.details ? JSON.stringify(entry.details) : null,
      entry.ip_address ?? null,
      entry.user_agent ?? null,
      timestamp
    )
    .run();
}

/**
 * Query audit log entries with filters
 */
export async function queryAuditLog(
  db: D1Database,
  filters: AuditLogFilters = {}
): Promise<{ entries: AuditLogEntry[]; total: number }> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.user_id) {
    conditions.push('user_id = ?');
    params.push(filters.user_id);
  }
  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }
  if (filters.resource_type) {
    conditions.push('resource_type = ?');
    params.push(filters.resource_type);
  }
  if (filters.resource_id) {
    conditions.push('resource_id = ?');
    params.push(filters.resource_id);
  }
  if (filters.start_date) {
    conditions.push('timestamp >= ?');
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    conditions.push('timestamp <= ?');
    params.push(filters.end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM audit_log ${whereClause}`)
    .bind(...params)
    .first<{ total: number }>();

  // Get entries
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const entriesResult = await db
    .prepare(
      `SELECT * FROM audit_log ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all<AuditLogEntry>();

  return {
    entries: entriesResult.results.map((entry) => ({
      ...entry,
      details: entry.details ? JSON.parse(entry.details as string) : undefined,
    })),
    total: countResult?.total ?? 0,
  };
}

/**
 * Get recent audit log entries for a resource
 */
export async function getResourceAuditHistory(
  db: D1Database,
  resource_type: string,
  resource_id: string,
  limit: number = 10
): Promise<AuditLogEntry[]> {
  const result = await db
    .prepare(
      `SELECT * FROM audit_log 
       WHERE resource_type = ? AND resource_id = ? 
       ORDER BY timestamp DESC LIMIT ?`
    )
    .bind(resource_type, resource_id, limit)
    .all<AuditLogEntry>();

  return result.results.map((entry) => ({
    ...entry,
    details: entry.details ? JSON.parse(entry.details as string) : undefined,
  }));
}

/**
 * Create an audit log middleware for API routes
 * Extracts user info from request and logs the action
 */
export function createAuditMiddleware(
  db: D1Database,
  action: AuditAction,
  resource_type: string,
  getResourceId?: (request: Request) => string | undefined
) {
  return async function auditMiddleware(request: Request, userId?: string) {
    const url = new URL(request.url);
    const resource_id = getResourceId?.(request);

    await logAction(db, {
      user_id: userId,
      action,
      resource_type,
      resource_id,
      details: {
        method: request.method,
        path: url.pathname,
        query: url.search,
      },
      ip_address: request.headers.get('cf-connecting-ip') ?? undefined,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });
  };
}
