/**
 * POST /api/auth/reset-password
 * Reset password using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/app/api/auth/_helpers';

export const runtime = 'edge';

interface ResetPasswordBody {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json() as ResetPasswordBody;
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }
    
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    
    // Find user with valid reset token
    const user = await db.prepare(
      `SELECT id FROM users 
       WHERE reset_token = ? 
       AND reset_token_expires_at > ? 
       AND is_active = 1`
    ).bind(token, new Date().toISOString()).first<{ id: string }>();
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    
    // Update password and clear reset token
    await db.prepare(
      `UPDATE users 
       SET password_hash = ?, 
           reset_token = NULL, 
           reset_token_expires_at = NULL,
           refresh_token = NULL,
           refresh_token_expires_at = NULL,
           updated_at = ?
       WHERE id = ?`
    ).bind(passwordHash, now, user.id).run();
    
    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
