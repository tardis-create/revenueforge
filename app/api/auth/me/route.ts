/**
 * GET /api/auth/me
 * Get current user from JWT
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest, getUserById } from '@/app/api/auth/_helpers';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token, JWT_SECRET);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    // Get fresh user data
    const user = await getUserById(db, payload.userId);
    
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        is_active: !!user.is_active
      } 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
