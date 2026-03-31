import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

/**
 * Middleware to protect admin and dealer routes
 * Redirects unauthenticated users to login pages
 */

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/analytics',
  '/dealers',
  '/leads',
  '/notifications',
  '/products',
  '/quotes',
  '/settings',
  '/templates',
  '/users',
];

// Dealer routes that require dealer authentication
const dealerProtectedRoutes = [
  '/dealer',
];

// Routes that should be accessible without authentication (login pages)
const publicRoutes = [
  '/login',
  '/admin/login',
  '/dealer/login',
];

// Get JWT secret from environment (must be set in production)
function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[middleware] JWT_SECRET not configured - auth will fail');
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a public route - allow access
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check if this is a dealer protected route
  const isDealerRoute = dealerProtectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isDealerRoute) {
    // For dealer routes, check for auth
    const jwtCookie = request.cookies.get('jwt') || 
                      request.cookies.get('token') || 
                      request.cookies.get('auth_token') ||
                      request.cookies.get('pb_auth');

    if (!jwtCookie || !jwtCookie.value) {
      const loginUrl = new URL('/dealer/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Check for JWT cookie (check multiple possible cookie names)
  const jwtCookie = request.cookies.get('jwt') || 
                    request.cookies.get('token') || 
                    request.cookies.get('auth_token') ||
                    request.cookies.get('pb_auth'); // PocketBase auth

  // If no JWT cookie present, redirect to login
  if (!jwtCookie || !jwtCookie.value) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL for redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate JWT token
  const secret = getJwtSecret();
  if (!secret) {
    // No secret configured - deny access (shouldn't happen in production)
    console.error('[middleware] JWT_SECRET not set, rejecting request');
    return NextResponse.json({ error: 'Server configuration error' }, 500);
  }

  try {
    // Verify the JWT token signature and claims
    const { payload } = await jwtVerify(jwtCookie.value, secret);
    
    // Check if token has required claims
    if (!payload.userId) {
      console.warn('[middleware] JWT missing userId claim');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Token is valid - allow access
    // Optionally: you could set request headers with user info for downstream use
    // request.headers.set('x-user-id', payload.userId as string);
    // request.headers.set('x-user-role', payload.role as string);
    
    return NextResponse.next();
  } catch (err: any) {
    // JWT verification failed - token is invalid/expired
    console.warn('[middleware] JWT verification failed:', err.message);
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (they have their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};