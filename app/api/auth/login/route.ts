/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  setAuthCookie,
  checkRateLimit,
  recordLoginAttempt,
  clearRateLimit,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiry
} from '@/app/api/auth/_helpers';

export const runtime = 'edge';

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json() as LoginBody;
    const { email, password } = body;
    
    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    const rateLimit = await checkRateLimit(db, email, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
      }, { status: 429 });
    }
    
    // Find user
    const user = await getUserByEmail(db, email);
    
    if (!user || !user.password_hash) {
      await recordLoginAttempt(db, email, ip);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account is temporarily locked' }, { status: 423 });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      await recordLoginAttempt(db, email, ip);
      
      // Increment failed attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil: string | null = null;
      
      // Lock account after 10 failed attempts
      if (failedAttempts >= 10) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }
      
      await db.prepare(
        `UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`
      ).bind(failedAttempts, lockedUntil, user.id).run();
      
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Clear rate limit on successful login
    await clearRateLimit(db, email, ip);
    
    // Generate tokens
    const accessToken = await generateAccessToken(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );
    const refreshToken = await generateRefreshToken(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );
    
    // Update user with tokens and reset failed attempts
    const now = new Date().toISOString();
    const refreshExpiry = getTokenExpiry(7 * 24 * 60 * 60);
    
    await db.prepare(
      `UPDATE users 
       SET refresh_token = ?, 
           refresh_token_expires_at = ?, 
           last_login_at = ?,
           failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = ?
       WHERE id = ?`
    ).bind(refreshToken, refreshExpiry, now, now, user.id).run();
    
    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken
    });
    
    // Set cookie
    setAuthCookie(response.headers, accessToken, !!JWT_SECRET);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
