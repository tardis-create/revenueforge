import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes based on authentication and role
 * - Redirects unauthenticated users to appropriate login
 * - Prevents dealers from accessing admin routes
 * - Prevents non-dealers from accessing dealer routes
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

// Admin-only routes (dealers cannot access)
const adminOnlyRoutes = [
  '/admin',
  '/analytics',
  '/dealers',
  '/leads',
  '/notifications',
  '/quotes',
  '/settings',
  '/templates',
  '/users',
];

// Dealer routes
const dealerRoutes = [
  '/dealer',
];

// Routes that should be accessible without authentication (login pages)
const publicRoutes = [
  '/login',
  '/admin/login',
  '/dealer/login',
  '/forgot-password',
  '/reset-password',
  '/register',
  '/catalog',
];

/**
 * Decode JWT payload (without verification - just for role checking)
 * This is safe for route protection since actual API calls verify the token
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Get user role from token
 */
function getUserRole(request: NextRequest): string | null {
  // Check for auth token in cookies
  const jwtCookie = request.cookies.get('jwt') || 
                    request.cookies.get('token') || 
                    request.cookies.get('auth_token') ||
                    request.cookies.get('pb_auth');
  
  if (!jwtCookie || !jwtCookie.value) return null;
  
  // Try to decode JWT to get role
  const payload = decodeJwtPayload(jwtCookie.value);
  if (payload && payload.role) {
    return payload.role as string;
  }
  
  // For PocketBase auth, check the stored user data
  return null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(request: NextRequest): boolean {
  const jwtCookie = request.cookies.get('jwt') || 
                    request.cookies.get('token') || 
                    request.cookies.get('auth_token') ||
                    request.cookies.get('pb_auth');
  return !!(jwtCookie && jwtCookie.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a public route - allow access
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check if this is a dealer route
  const isDealerRoute = dealerRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is an admin-only route
  const isAdminRoute = adminOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  ) || isDealerRoute;

  if (!isProtectedRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Check authentication
  const authenticated = isAuthenticated(request);
  const userRole = getUserRole(request);

  // If not authenticated, redirect to appropriate login
  if (!authenticated) {
    if (isDealerRoute) {
      const loginUrl = new URL('/dealer/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  
  // Prevent dealers from accessing admin routes
  if (userRole === 'dealer' && isAdminRoute) {
    const dealerUrl = new URL('/dealer', request.url);
    return NextResponse.redirect(dealerUrl);
  }

  // Prevent non-dealers from accessing dealer routes (except admins who can see everything)
  if (isDealerRoute && userRole && userRole !== 'dealer' && userRole !== 'admin') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated and has appropriate access
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
