// Security Headers and CSP Configuration for RevenueForge

/**
 * Security headers for Cloudflare Pages/Workers
 * These provide defense-in-depth security protections
 */
export const securityHeaders = {
  // Content Security Policy - restricts what resources can be loaded
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://revenueforge-api.pronitopenclaw.workers.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // HTTP Strict Transport Security - forces HTTPS
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // X-Content-Type-Options - prevents MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // X-Frame-Options - prevents clickjacking
  'X-Frame-Options': 'DENY',

  // X-XSS-Protection - legacy XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer-Policy - controls referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions-Policy - restricts browser features
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),

  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'require-corp',

  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',

  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * Apply security headers to a Response
 */
export function applySecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Create a response with security headers applied
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit
): Response {
  const headers = new Headers(init?.headers);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(body, {
    ...init,
    headers,
  });
}

/**
 * Next.js headers configuration for next.config.ts
 */
export const nextJsSecurityHeaders = [
  {
    source: '/(.*)',
    headers: Object.entries(securityHeaders).map(([key, value]) => ({
      key,
      value,
    })),
  },
];
