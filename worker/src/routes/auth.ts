import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { requireAuth } from '../middleware/auth';
import { logAction } from '../utils/auditLog';
import type { Env } from '../types';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/auth/login — Authenticate user, return JWT.
 */
auth.post('/login', async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { email, password } = body;
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  try {
    const user = await db
      .prepare('SELECT id, email, name, role, active, password_hash, password_salt FROM users WHERE email = ?')
      .bind(email.toLowerCase())
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
      { name: 'PBKDF2', salt: saltBytes as BufferSource, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hash = bytesToHex(new Uint8Array(derivedBits));

    if (hash !== user.password_hash) {
      await logAction(db, {
        user_id: user.id,
        action: 'login',
        resource_type: 'auth',
        details: { success: false, reason: 'wrong_password' },
        ip_address: c.req.header('cf-connecting-ip') ?? undefined,
        user_agent: c.req.header('user-agent') ?? undefined,
      });
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'default-secret-change-in-production');
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    await logAction(db, {
      user_id: user.id,
      action: 'login',
      resource_type: 'auth',
      details: { success: true },
      ip_address: c.req.header('cf-connecting-ip') ?? undefined,
      user_agent: c.req.header('user-agent') ?? undefined,
    });

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
    await logAction(db, {
      user_id: caller.userId,
      action: 'logout',
      resource_type: 'auth',
      details: { email: caller.email },
      ip_address: c.req.header('cf-connecting-ip') ?? undefined,
      user_agent: c.req.header('user-agent') ?? undefined,
    });
  } catch (err) {
    console.error('Audit log error on logout:', err);
    // Non-blocking: still return success
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
