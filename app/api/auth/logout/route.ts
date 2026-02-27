/**
 * POST /api/auth/logout
 * Clear tokens and cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest, clearAuthCookie } from '@/app/api/auth/_helpers';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    const token = getTokenFromRequest(request);
    
    if (token && db) {
      const payload = await verifyToken(token, JWT_SECRET);
      if (payload) {
        // Clear refresh token from database
        await db.prepare(
          'UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = ?'
        ).bind(payload.userId).run();
      }
    }
    
    // Create response and clear cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    clearAuthCookie(response.headers);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
