import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { requireAuth } from '../middleware/auth';
import { logAction } from '../utils/auditLog';
import { authRateLimiter } from '../middleware/rateLimiter';
import { stripHtml } from '../utils/sanitize';
import type { Env } from '../types';

const auth = new Hono<{ Bindings: Env }>();

function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * POST /api/auth/login — Authenticate user, return JWT.
 * Rate limited: max 5 attempts per IP per 15 minutes.
 */
auth.post('/login', authRateLimiter, async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Sanitize: strip HTML from text fields
  const email = stripHtml(String(body.email ?? '')).toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  try {
    const user = await db
      .prepare('SELECT id, email, name, role, active, password_hash, password_salt FROM users WHERE email = ?')
      .bind(email)
      .first<{
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'dealer' | 'viewer';
        active: number;
        password_hash: string;
        password_salt: string;
      }>();

    if (!user || !user.active) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password via PBKDF2
    const saltBytes = hexToBytes(user.password_salt);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hash = bytesToHex(new Uint8Array(derivedBits));

    if (hash !== user.password_hash) {
      await logAction(c.env, db, user.id, 'login', 'auth', null, { success: false, reason: 'wrong_password' });
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'default-secret-change-in-production');
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Update last_login timestamp
    const now = getTimestamp();
    await db
      .prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(now, user.id)
      .run()
      .catch(() => {});

    await logAction(c.env, db, user.id, 'login', 'auth', null, { success: true });

    return c.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/auth/logout — Invalidate session (client-side; log the event).
 */
auth.post('/logout', requireAuth, async (c) => {
  const db = c.env.DB;
  const caller = c.get('user');

  try {
    await logAction(c.env, db, caller.userId, 'logout', 'auth', null, { email: caller.email });
  } catch (err) {
    console.error('Audit log error on logout:', err);
  }

  return c.json({ message: 'Logged out successfully' });
});

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default auth;
