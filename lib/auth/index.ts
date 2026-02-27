/**
 * Auth utilities for RevenueForge
 * Combines JWT, password hashing, and rate limiting
 */

import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

// Token expiration times
export const ACCESS_TOKEN_EXPIRY = '24h';
export const REFRESH_TOKEN_EXPIRY = '7d';

// Password hashing constants
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION_MINUTES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 15;

/**
 * Generate a secret key from environment variable
 */
async function getSecretKey(JWT_SECRET: string | undefined): Promise<Uint8Array> {
  const secret = JWT_SECRET || 'revenueforge-default-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * User payload for JWT
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type?: string; // 'refresh' for refresh tokens
}

/**
 * Generate access token (expires in 24h)
 */
export async function generateAccessToken(payload: JWTPayload, JWT_SECRET?: string): Promise<string> {
  const secret = await getSecretKey(JWT_SECRET);
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('revenueforge')
    .setAudience('revenueforge-api')
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
  
  return token;
}

/**
 * Generate refresh token (expires in 7d)
 */
export async function generateRefreshToken(payload: JWTPayload, JWT_SECRET?: string): Promise<string> {
  const secret = await getSecretKey(JWT_SECRET);
  
  const token = await new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('revenueforge')
    .setAudience('revenueforge-api')
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret);
  
  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string, JWT_SECRET?: string): Promise<JWTPayload | null> {
  try {
    const secret = await getSecretKey(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'revenueforge',
      audience: 'revenueforge-api'
    });
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      type: payload.type as string | undefined
    };
  } catch {
    return null;
  }
}

/**
 * Generate token expiry timestamp
 */
export function getTokenExpiry(seconds: number): string {
  const date = new Date();
  date.setTime(date.getTime() + seconds * 1000);
  return date.toISOString();
}

/**
 * Cookie options for JWT tokens
 */
export function getCookieOptions(isProduction: boolean = false) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60 // 24 hours in seconds
  };
}

/**
 * Set auth cookie on response headers
 */
export function setAuthCookie(
  headers: Headers,
  accessToken: string,
  isProduction: boolean
): void {
  const options = getCookieOptions(isProduction);
  const maxAge = 24 * 60 * 60;
  
  const cookieString = `access_token=${accessToken}; Path=/; HttpOnly; SameSite=lax${isProduction ? '; Secure' : ''}; Max-Age=${maxAge}`;
  headers.set('Set-Cookie', cookieString);
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(headers: Headers): void {
  headers.set('Set-Cookie', 'access_token=; Path=/; HttpOnly; Max-Age=0');
}

/**
 * Get token from request (Authorization header or cookie)
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...rest] = c.split('=');
        return [key, rest.join('=')];
      })
    );
    if (cookies.access_token) {
      return cookies.access_token;
    }
  }
  
  return null;
}

/**
 * Generate a random salt for password hashing
 */
async function generateSalt(): Promise<string> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return bufferToHex(salt);
}

/**
 * Hash a password using PBKDF2 (Web Crypto API for Cloudflare Workers)
 * Note: bcrypt is not available in Workers, so we use PBKDF2-SHA512
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const saltBytes = salt ? hexToBuffer(salt) : hexToBuffer(await generateSalt());
  const saltHex = bufferToHex(saltBytes);
  
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-512'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  
  const hashHex = bufferToHex(new Uint8Array(hashBuffer as ArrayBuffer));
  
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return false;
    
    const saltBytes = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes as unknown as BufferSource,
        iterations: ITERATIONS,
        hash: 'SHA-512'
      },
      keyMaterial,
      KEY_LENGTH * 8
    );
    
    const computedHashHex = bufferToHex(new Uint8Array(hashBuffer as ArrayBuffer));
    
    // Constant-time comparison to prevent timing attacks
    return constantTimeCompare(computedHashHex, hashHex);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Uses byte-by-byte XOR to ensure comparison time is not affected by input
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Convert buffer to hex string
 */
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to buffer
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  resetAt: Date;
  attemptsRemaining: number;
}

/**
 * Check rate limit for login attempts
 */
export async function checkRateLimit(
  db: D1Database,
  email: string,
  ip: string
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  
  // Count recent failed attempts
  const result = await db.prepare(
    `SELECT COUNT(*) as count FROM login_attempts 
     WHERE (email = ? OR ip_address = ?) 
     AND timestamp > ?`
  ).bind(email, ip, windowStart).first<{ count: number }>();
  
  const attempts = result?.count || 0;
  const resetAt = new Date(Date.now() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  
  return {
    allowed: attempts < MAX_LOGIN_ATTEMPTS,
    resetAt,
    attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts)
  };
}

/**
 * Record a failed login attempt
 */
export async function recordLoginAttempt(
  db: D1Database,
  email: string,
  ip: string
): Promise<void> {
  const id = `attempt_${nanoid(16)}`;
  const timestamp = new Date().toISOString();
  
  await db.prepare(
    `INSERT INTO login_attempts (id, email, ip_address, timestamp)
     VALUES (?, ?, ?, ?)`
  ).bind(id, email, ip, timestamp).run();
}

/**
 * Clear rate limit on successful login
 */
export async function clearRateLimit(
  db: D1Database,
  email: string,
  ip: string
): Promise<void> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  
  await db.prepare(
    `DELETE FROM login_attempts 
     WHERE (email = ? OR ip_address = ?) 
     AND timestamp > ?`
  ).bind(email, ip, windowStart).run();
}

/**
 * User type from database
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string | null;
  locked_until: string | null;
  failed_login_attempts: number;
  is_active: number;
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<AuthUser | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE email = ? AND is_active = 1'
  ).bind(email).first<AuthUser>();
  return result || null;
}

/**
 * Get user from database by ID
 */
export async function getUserById(db: D1Database, userId: string): Promise<AuthUser | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).first<AuthUser>();
  return result || null;
}

// Re-export nanoid for convenience
export { nanoid };
