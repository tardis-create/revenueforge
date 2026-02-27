/**
 * POST /api/auth/forgot-password
 * Generate password reset token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getTokenExpiry, nanoid } from '@/app/api/auth/_helpers';

export const runtime = 'edge';

interface ForgotPasswordBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestEnv = request as unknown as { env?: { DB: D1Database; JWT_SECRET?: string } };
    const db = requestEnv.env?.DB;
    const JWT_SECRET = requestEnv.env?.JWT_SECRET;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json() as ForgotPasswordBody;
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user
    const user = await getUserByEmail(db, email);
    
    // Always return 200 to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = nanoid(32);
    const resetExpiry = getTokenExpiry(60 * 60); // 1 hour
    
    await db.prepare(
      `UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?`
    ).bind(resetToken, resetExpiry, user.id).run();
    
    // In production, send email with reset link
    // For now, return the token (remove in production!)
    const isProduction = !!JWT_SECRET;
    
    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent',
      ...(isProduction ? {} : { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
