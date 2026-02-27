/**
 * POST /api/auth/register
 * Create a new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createUser,
  getUserByEmail,
  setAuthCookie,
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiry
} from '@/app/api/auth/_helpers';

export const runtime = 'edge';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json() as RegisterBody;
    const { email, password, name } = body;
    
    // Always default to 'viewer' role for new registrations
    // Never trust user input for roles
    const role = 'viewer';
    
    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(db, email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    // Create user
    const { id: userId } = await createUser(db, email, password, name, role);
    
    // Generate tokens
    const accessToken = await generateAccessToken(
      { userId, email, role },
      JWT_SECRET
    );
    const refreshToken = await generateRefreshToken(
      { userId, email, role },
      JWT_SECRET
    );
    
    // Store refresh token
    const refreshExpiry = getTokenExpiry(7 * 24 * 60 * 60);
    await db.prepare(
      `UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?`
    ).bind(refreshToken, refreshExpiry, userId).run();
    
    // Create response with cookie
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: { id: userId, email, name, role },
      accessToken
    }, { status: 201 });
    
    // Set cookie
    setAuthCookie(response.headers, accessToken, !!JWT_SECRET);
    
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
