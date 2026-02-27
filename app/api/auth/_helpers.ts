/**
 * Auth helpers for Next.js API routes
 * Re-exports from lib/auth for convenience
 */

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
  getTokenExpiry,
  checkRateLimit,
  recordLoginAttempt,
  clearRateLimit,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  getUserByEmail,
  getUserById,
  nanoid,
  type JWTPayload,
  type AuthUser
} from '@/lib/auth';

// Re-export everything
export {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
  getTokenExpiry,
  checkRateLimit,
  recordLoginAttempt,
  clearRateLimit,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  getUserByEmail,
  getUserById,
  nanoid,
  type JWTPayload,
  type AuthUser
};

/**
 * Create a new user
 */
export async function createUser(
  db: D1Database,
  email: string,
  password: string,
  name?: string,
  role: string = 'viewer'
): Promise<{ id: string }> {
  const userId = `user_${nanoid(16)}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  
  await db.prepare(
    `INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, email, name || null, role, passwordHash, now, now).run();
  
  return { id: userId };
}
