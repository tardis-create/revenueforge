import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const users = new Hono<{ Bindings: Env }>();

type Role = 'admin' | 'dealer' | 'viewer';

/**
 * Hash a password using PBKDF2 via Web Crypto API.
 * Returns { hash, salt } — both stored in the database.
 */
async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  // Generate a random 16-byte salt, or use provided one (for verification)
  const saltBytes = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));

  const salt = saltHex ?? bytesToHex(saltBytes);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 310000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hash = bytesToHex(new Uint8Array(derivedBits));
  return { hash, salt };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
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
 * Admin only.
 */
users.get('/', requireAuth, requireRole('admin'), async (c) => {
  const db = c.env.DB;

  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM users')
      .first();
    const total = (countResult?.total as number) || 0;

    const rows = await db
      .prepare(
        'SELECT id, email, name, role, active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .bind(limit, offset)
      .all();

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
  const { hash: passwordHash, salt: passwordSalt } = await hashPassword(body.password);
  const role: Role = body.role || 'viewer';

  try {
    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, password_salt, name, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
      )
      .bind(id, body.email.toLowerCase(), passwordHash, passwordSalt, body.name.trim(), role, now, now)
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

  // Reject email change attempts
  if (body.email !== undefined) {
    return c.json({ error: 'Email cannot be changed' }, 400);
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
      const { hash, salt } = await hashPassword(body.password);
      query += ', password_hash = ?, password_salt = ?';
      params.push(hash, salt);
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

  // Reject email change attempts
  if (body.email !== undefined) {
    return c.json({ error: 'Email cannot be changed' }, 400);
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
  if (body.password) {
    const { hash, salt } = await hashPassword(body.password);
    setClauses.push('password_hash = ?');
    params.push(hash);
    setClauses.push('password_salt = ?');
    params.push(salt);
  }
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
 * DELETE /api/users/:id — Soft-delete (deactivate) a user
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
    await db
      .prepare('UPDATE users SET active = 0, updated_at = ? WHERE id = ?')
      .bind(getTimestamp(), id)
      .run();
    return c.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default users;
