import type { D1Database } from '@cloudflare/workers-types';

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

function generateAuditLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `audit_${timestamp}${random}`;
}

/**
 * Log an action to the audit_log table.
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
