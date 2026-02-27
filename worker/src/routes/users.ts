import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const users = new Hono<{ Bindings: Env }>();

type Role = 'admin' | 'dealer' | 'viewer';

/** Simple SHA-256 hash using Web Crypto (available in CF Workers) */
async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function validateUserInput(
  data: any,
  requirePassword = true
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid email is required');
  }

  if (requirePassword) {
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      errors.push('Password is required and must be at least 6 characters');
    }
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  const validRoles: Role[] = ['admin', 'dealer', 'viewer'];
  if (data.role !== undefined && !validRoles.includes(data.role)) {
    errors.push(`Role must be one of: ${validRoles.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * GET /api/users — List all users
 * Requires auth; admin sees all, dealer/viewer see only themselves.
 */
users.get('/', requireAuth, async (c) => {
  const caller = c.get('user');
  const db = c.env.DB;

  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let rows, total;

    if (caller.role === 'admin') {
      const countResult = await db
        .prepare('SELECT COUNT(*) as total FROM users')
        .first();
      total = (countResult?.total as number) || 0;

      rows = await db
        .prepare(
          'SELECT id, email, name, role, active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
        )
        .bind(limit, offset)
        .all();
    } else {
      // Non-admins can only see themselves
      total = 1;
      rows = await db
        .prepare(
          'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ? LIMIT 1'
        )
        .bind(caller.userId)
        .all();
    }

    return c.json({
      data: rows.results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/users error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/users/:id — Get a single user
 * Admin can get any user; others can only get themselves.
 */
users.get('/:id', requireAuth, async (c) => {
  const caller = c.get('user');
  const { id } = c.req.param();
  const db = c.env.DB;

  if (caller.role !== 'admin' && caller.userId !== id) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  try {
    const row = await db
      .prepare(
        'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ?'
      )
      .bind(id)
      .first();

    if (!row) return c.json({ error: 'User not found' }, 404);
    return c.json({ data: row });
  } catch (err) {
    console.error('GET /api/users/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/users — Create a new user
 * Admin only.
 */
users.post('/', requireAuth, requireRole('admin'), async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { valid, errors } = validateUserInput(body);
  if (!valid) return c.json({ error: 'Validation failed', details: errors }, 400);

  // Check duplicate email
  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first();
  if (existing) return c.json({ error: 'Email already in use' }, 409);

  const id = generateId('usr');
  const now = getTimestamp();
  const passwordHash = await hashPassword(body.password);
  const role: Role = body.role || 'viewer';

  try {
    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, name, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
      )
      .bind(id, body.email.toLowerCase(), passwordHash, body.name.trim(), role, now, now)
      .run();

    const created = await db
      .prepare(
        'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ?'
      )
      .bind(id)
      .first();

    return c.json({ data: created }, 201);
  } catch (err) {
    console.error('POST /api/users error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * PUT /api/users/:id — Update a user (full replace of mutable fields)
 * Admin can update anyone; users can update their own name/password.
 */
users.put('/:id', requireAuth, async (c) => {
  const caller = c.get('user');
  const { id } = c.req.param();
  const db = c.env.DB;

  if (caller.role !== 'admin' && caller.userId !== id) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Only admins may change roles
  if (body.role !== undefined && caller.role !== 'admin') {
    return c.json({ error: 'Forbidden: only admins can change roles' }, 403);
  }

  const { valid, errors } = validateUserInput(body, !!body.password);
  if (!valid) return c.json({ error: 'Validation failed', details: errors }, 400);

  // Verify user exists
  const existing = await db
    .prepare('SELECT id FROM users WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return c.json({ error: 'User not found' }, 404);

  const now = getTimestamp();

  try {
    let query = 'UPDATE users SET name = ?, updated_at = ?';
    const params: any[] = [body.name.trim(), now];

    if (body.password) {
      query += ', password_hash = ?';
      params.push(await hashPassword(body.password));
    }
    if (body.role && caller.role === 'admin') {
      query += ', role = ?';
      params.push(body.role);
    }
    if (typeof body.active === 'boolean' && caller.role === 'admin') {
      query += ', active = ?';
      params.push(body.active ? 1 : 0);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.prepare(query).bind(...params).run();

    const updated = await db
      .prepare(
        'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ?'
      )
      .bind(id)
      .first();

    return c.json({ data: updated });
  } catch (err) {
    console.error('PUT /api/users/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * PATCH /api/users/:id — Partial update
 * Admin can patch anyone; users can patch their own name/password.
 */
users.patch('/:id', requireAuth, async (c) => {
  const caller = c.get('user');
  const { id } = c.req.param();
  const db = c.env.DB;

  if (caller.role !== 'admin' && caller.userId !== id) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (Object.keys(body).length === 0) {
    return c.json({ error: 'No fields provided to update' }, 400);
  }

  if (body.role !== undefined && caller.role !== 'admin') {
    return c.json({ error: 'Forbidden: only admins can change roles' }, 403);
  }

  const validRoles: Role[] = ['admin', 'dealer', 'viewer'];
  if (body.role && !validRoles.includes(body.role)) {
    return c.json({ error: `Role must be one of: ${validRoles.join(', ')}` }, 400);
  }

  const existing = await db
    .prepare('SELECT id FROM users WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return c.json({ error: 'User not found' }, 404);

  const now = getTimestamp();
  const setClauses: string[] = ['updated_at = ?'];
  const params: any[] = [now];

  if (body.name) { setClauses.push('name = ?'); params.push(body.name.trim()); }
  if (body.password) { setClauses.push('password_hash = ?'); params.push(await hashPassword(body.password)); }
  if (body.role && caller.role === 'admin') { setClauses.push('role = ?'); params.push(body.role); }
  if (typeof body.active === 'boolean' && caller.role === 'admin') { setClauses.push('active = ?'); params.push(body.active ? 1 : 0); }

  params.push(id);

  try {
    await db
      .prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const updated = await db
      .prepare(
        'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ?'
      )
      .bind(id)
      .first();

    return c.json({ data: updated });
  } catch (err) {
    console.error('PATCH /api/users/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * DELETE /api/users/:id — Delete a user
 * Admin only.
 */
users.delete('/:id', requireAuth, requireRole('admin'), async (c) => {
  const { id } = c.req.param();
  const db = c.env.DB;

  const existing = await db
    .prepare('SELECT id FROM users WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) return c.json({ error: 'User not found' }, 404);

  try {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return c.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default users;
