import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { requireAuth } from '../middleware/auth';
import { logAction } from '../utils/auditLog';
import { authRateLimiter } from '../middleware/rateLimiter';
import { stripHtml } from '../utils/sanitize';
import { LoginSchema, validate } from '../schemas';
import { z } from 'zod';
import type { Env } from '../types';

const auth = new Hono<{ Bindings: Env }>();

// ── Schemas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
  name: z.string().min(1).max(255),
  role: z.enum(['admin', 'dealer', 'viewer']).default('viewer'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getTimestamp(): string {
  return new Date().toISOString();
}

/** Hash a password with PBKDF2-SHA256 (310,000 iterations). Returns { hash, salt } as hex strings. */
async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(32));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return { hash: bytesToHex(new Uint8Array(derivedBits)), salt: bytesToHex(saltBytes) };
}

/** Hash a plain reset token for storage (SHA-256). */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

/** Generate a cryptographically random hex token. */
function generateToken(bytes = 32): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login — Authenticate user, return JWT.
 */
auth.post('/login', authRateLimiter, async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validate(LoginSchema, body);
  if ('error' in validation) return c.json(validation, 400);

  const email = stripHtml(validation.data.email).toLowerCase();
  const password = validation.data.password;

  try {
    const user = await db
      .prepare('SELECT id, email, name, role, active, password_hash, password_salt FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; name: string; role: 'admin' | 'dealer' | 'viewer'; active: number; password_hash: string; password_salt: string }>();

    if (!user || !user.active) return c.json({ error: 'Invalid credentials' }, 401);

    const { hash } = await hashPassword(password, user.password_salt);
    if (hash !== user.password_hash) {
      await logAction(c.env, db, user.id, 'login', 'auth', null, { success: false, reason: 'wrong_password' });
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const now = getTimestamp();
    await db.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(now, user.id).run().catch(() => {});
    await logAction(c.env, db, user.id, 'login', 'auth', null, { success: true });

    return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/auth/register — Create a new user account.
 */
auth.post('/register', authRateLimiter, async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validate(RegisterSchema, body);
  if ('error' in validation) return c.json(validation, 400);

  const email = stripHtml(validation.data.email).toLowerCase();
  const name = stripHtml(validation.data.name);
  const { password, role } = validation.data;

  try {
    // Check duplicate
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
    if (existing) return c.json({ error: 'Email already registered' }, 409);

    const { hash, salt } = await hashPassword(password);
    const id = generateToken(16); // 32-char hex id
    const now = getTimestamp();

    await db
      .prepare('INSERT INTO users (id, email, name, password_hash, password_salt, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)')
      .bind(id, email, name, hash, salt, role, now, now)
      .run();

    await logAction(c.env, db, id, 'register', 'auth', null, { email, role });

    return c.json({ message: 'User registered successfully', user: { id, email, name, role } }, 201);
  } catch (err) {
    console.error('POST /api/auth/register error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/auth/forgot-password — Issue password reset token and (log) send email.
 * Always returns 200 to prevent email enumeration.
 */
auth.post('/forgot-password', authRateLimiter, async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validate(ForgotPasswordSchema, body);
  if ('error' in validation) return c.json(validation, 400);

  const email = stripHtml(validation.data.email).toLowerCase();

  try {
    const user = await db.prepare('SELECT id FROM users WHERE email = ? AND active = 1').bind(email).first<{ id: string }>();

    if (user) {
      // Invalidate any existing unused tokens for this user
      await db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0").bind(user.id).run();

      const rawToken = generateToken(32); // 64-char hex
      const tokenHash = await hashToken(rawToken);
      const tokenId = generateToken(16);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      const now = getTimestamp();

      await db
        .prepare('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)')
        .bind(tokenId, user.id, tokenHash, expiresAt, now)
        .run();

      // In a real deployment, send email here via email service.
      // For now, we log the reset token (visible in wrangler tail).
      console.log(`[PASSWORD_RESET] user=${user.id} email=${email} token=${rawToken} expires=${expiresAt}`);

      await logAction(c.env, db, user.id, 'forgot-password', 'auth', null, { email });
    }

    // Always return 200 to prevent email enumeration
    return c.json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (err) {
    console.error('POST /api/auth/forgot-password error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/auth/reset-password — Reset password using a valid reset token.
 */
auth.post('/reset-password', authRateLimiter, async (c) => {
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validate(ResetPasswordSchema, body);
  if ('error' in validation) return c.json(validation, 400);

  const { token: rawToken, password } = validation.data;

  try {
    const tokenHash = await hashToken(rawToken);
    const now = getTimestamp();

    const record = await db
      .prepare("SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = ?")
      .bind(tokenHash)
      .first<{ id: string; user_id: string; expires_at: string; used: number }>();

    if (!record || record.used || record.expires_at < now) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Hash new password
    const { hash, salt } = await hashPassword(password);

    await db
      .prepare('UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?')
      .bind(hash, salt, now, record.user_id)
      .run();

    // Mark token as used
    await db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').bind(record.id).run();

    await logAction(c.env, db, record.user_id, 'reset-password', 'auth', null, { success: true });

    return c.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('POST /api/auth/reset-password error:', err);
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

export default auth;
