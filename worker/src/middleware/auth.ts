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
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const secret = c.env?.JWT_SECRET || 'default-secret-change-in-production';
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
      exp: payload.exp
    });
    
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

/**
 * Require admin role
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
