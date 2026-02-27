import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 * Redirects unauthenticated users to /login
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

// Routes that should be accessible without authentication (login pages)
const publicRoutes = [
  '/login',
  '/admin/login',
  '/dealer/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a public route - allow access
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
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

  // Check for JWT cookie
  const jwtCookie = request.cookies.get('access_token') ||
                    request.cookies.get('jwt') || 
                    request.cookies.get('token') || 
                    request.cookies.get('auth_token') ||
                    request.cookies.get('pb_auth'); // PocketBase auth

  // If no valid JWT cookie, redirect to login
  if (!jwtCookie || !jwtCookie.value) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL for redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
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
