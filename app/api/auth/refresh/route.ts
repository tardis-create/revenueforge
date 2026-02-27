/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateAccessToken, setAuthCookie } from '@/app/api/auth/_helpers';

export const runtime = 'edge';

interface RefreshBody {
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json() as RefreshBody;
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }
    
    // Verify refresh token
    const payload = await verifyToken(refreshToken, JWT_SECRET);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
    
    // Ensure this is actually a refresh token, not an access token
    if (payload.type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid token type. Access tokens cannot be used for refresh.' }, { status: 401 });
    }
    
    // Check if refresh token matches database and is not expired
    const user = await db.prepare(
      `SELECT id, email, role, refresh_token, refresh_token_expires_at 
       FROM users 
       WHERE id = ? AND is_active = 1`
    ).bind(payload.userId).first<{
      id: string;
      email: string;
      role: string;
      refresh_token: string | null;
      refresh_token_expires_at: string | null;
    }>();
    
    if (!user || user.refresh_token !== refreshToken) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
    
    if (user.refresh_token_expires_at && new Date(user.refresh_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 });
    }
    
    // Generate new access token
    const accessToken = await generateAccessToken(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );
    
    // Create response with cookie
    const response = NextResponse.json({ accessToken });
    
    // Set cookie
    setAuthCookie(response.headers, accessToken, !!JWT_SECRET);
    
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
