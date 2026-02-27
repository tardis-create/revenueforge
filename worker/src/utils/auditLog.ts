import type { D1Database } from '@cloudflare/workers-types';
import type { Env } from '../types';
import { getTimestamp } from '../db';

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

function generateAuditId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'aud_';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Log an auditable action to the audit_logs table.
 * Fire-and-forget: errors are logged to console but NOT thrown.
 */
export async function logAction(
  env: Env,
  db: D1Database,
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  meta: Record<string, unknown> | null = null
): Promise<void> {
  try {
    const id = generateAuditId();
    const now = getTimestamp();
    const metadata = meta ? JSON.stringify(meta) : null;

    await db
      .prepare(
        'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, userId, action, resourceType, resourceId, metadata, now)
      .run();
  } catch (err) {
    console.error('[auditLog] Failed to write audit log:', err);
  }
}
