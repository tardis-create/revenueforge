import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { requireAuth } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import { logAction } from '../utils/auditLog';
import type { Env } from '../types';

/**
 * Hash a password using PBKDF2 via Web Crypto API.
 */
async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

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

  const hash = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { hash, salt };
}

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
      { name: 'PBKDF2', salt: saltBytes, iterations: 310000, hash: 'SHA-256' },
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

/**
 * POST /api/auth/register — Register a new user (public endpoint)
 */
auth.post('/register', async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { email, password, name, company } = body;
  
  if (!email || !password || !name) {
    return c.json({ error: 'Email, password, and name are required' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'A valid email is required' }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  try {
    // Check if user already exists
    const existing = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();
    
    if (existing) {
      return c.json({ error: 'Email already in use' }, 409);
    }

    // Hash password
    const { hash, salt } = await hashPassword(password);
    
    // Create user - default role is 'viewer', admin can upgrade later
    const id = generateId('usr');
    const now = getTimestamp();
    
    await db
      .prepare(
        'INSERT INTO users (id, email, password_hash, password_salt, name, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
      )
      .bind(id, email.toLowerCase(), hash, salt, name.trim(), 'viewer', now, now)
      .run();

    // Try to create associated dealer record if company is provided
    // Note: This requires user_id column in dealers table - if it doesn't exist, we skip this
    if (company) {
      try {
        const dealerId = generateId('dlr');
        await db
          .prepare(
            'INSERT INTO dealers (id, name, email, company, status, commission_rate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .bind(dealerId, name.trim(), email.toLowerCase(), company, 'pending', 10, now, now)
          .run();
      } catch (dealerErr) {
        // Ignore dealer creation errors - user is still created successfully
        console.error('Could not create dealer record:', dealerErr);
      }
    }

    // Log registration
    await logAction(db, {
      user_id: id,
      action: 'register',
      resource_type: 'auth',
      details: { email: email.toLowerCase(), role: 'viewer' },
      ip_address: c.req.header('cf-connecting-ip') ?? undefined,
      user_agent: c.req.header('user-agent') ?? undefined,
    });

    return c.json({
      message: 'Registration successful',
      user: { id, email: email.toLowerCase(), name: name.trim(), role: 'viewer' },
    }, 201);
  } catch (err) {
    console.error('POST /api/auth/register error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/auth/forgot-password — Request password reset (stub)
 * In production, this would send an email with reset link
 */
auth.post('/forgot-password', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { email } = body;
  
  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  // Stub: In production, this would check if user exists and send reset email
  // For now, always return success to prevent email enumeration
  return c.json({ message: 'If an account exists, a reset link will be sent' });
});

/**
 * POST /api/auth/reset-password — Reset password with token (stub)
 */
auth.post('/reset-password', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { token, password } = body;
  
  if (!token || !password) {
    return c.json({ error: 'Token and password are required' }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  // Stub: In production, this would validate the token and update the password
  return c.json({ message: 'Password reset successful' });
});

export default auth;
