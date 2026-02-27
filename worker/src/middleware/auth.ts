import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { JWTPayload } from '../types';

/**
 * Extend Hono's context to include user
 */
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

/**
 * Extract and verify JWT token from Authorization header
 * Also exported as requireAuth for semantic clarity.
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const secret = c.env.JWT_SECRET; // guaranteed non-null by global startup guard
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    // Verify the payload has required fields
    if (!payload.userId || !payload.email || !payload.role) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    // Set user in context
    c.set('user', {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'dealer' | 'viewer',
      iat: payload.iat,
      exp: payload.exp,
    });

    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

/** Alias for semantic clarity */
export const requireAuth = authMiddleware;

/**
 * Middleware factory: require one of the given roles.
 *
 * Usage:
 *   app.get('/admin-only', requireAuth, requireRole('admin'), handler)
 *   app.get('/staff',      requireAuth, requireRole('admin', 'dealer'), handler)
 */
export function requireRole(...roles: Array<'admin' | 'dealer' | 'viewer'>) {
  return async function roleMiddleware(c: Context, next: Next) {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json(
        { error: `Forbidden: Requires one of [${roles.join(', ')}]` },
        403
      );
    }

    await next();
  };
}

/**
 * Require admin role (convenience shorthand)
 */
export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('user');

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
}

/**
 * Get current user from context
 */
export function getCurrentUser(c: Context): JWTPayload | null {
  return c.get('user') || null;
}
