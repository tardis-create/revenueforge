import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import products from './routes/products';
import auditLogs from './routes/auditLogs';
import templates from './routes/templates';
import users from './routes/users';
import analytics from './routes/analytics';
import dealers from './routes/dealers';
import upload from './routes/upload';
import leads from './routes/leads';
import auditLog from './routes/auditLog';
import auth from './routes/auth';
import notifications from './routes/notifications';
import quotes from './routes/quotes';
import { createRateLimiter } from './middleware/rateLimiter';
import type { Env } from './types';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// ── Middleware ────────────────────────────────────────────────────────────────

// 1. Logger
app.use('*', logger());

// 2. Secure headers (HSTS, X-Content-Type-Options, X-XSS-Protection, CSP, X-Frame-Options)
app.use(
  '*',
  secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xContentTypeOptions: 'nosniff',
    xXssProtection: '1; mode=block',
    xFrameOptions: 'DENY',
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
);

// 3. CORS — restricted to known origins in production
app.use('*', async (c, next) => {
  const env = c.env.ENVIRONMENT ?? 'development';
  const allowedOrigins =
    env === 'production'
      ? ['https://revenueforge.pages.dev', 'https://revenueforge.com', 'https://www.revenueforge.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'https://revenueforge.pages.dev', 'https://revenueforge.com'];

  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next);
});

// 4. Guard: ensure JWT_SECRET is configured — fatal if missing
app.use('*', async (c, next) => {
  if (!c.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  }
  await next();
});

// 5. Global rate limiting
//    - Authenticated requests: 100 req/min (checked after auth middleware in routes)
//    - Anonymous requests: 20 req/min (applied globally here)
//    We apply the anonymous limiter globally; authenticated routes apply their own via requireAuth.
const anonRateLimiter = createRateLimiter(20, 60 * 1000, 'anon');
const authedRateLimiter = createRateLimiter(100, 60 * 1000, 'authed');

// Apply anonymous rate limit globally (all routes)
app.use('*', anonRateLimiter);

// Apply authenticated rate limit to all /api/* routes (stacks on top of anon)
app.use('/api/*', authedRateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (c) => {
  return c.json({
    message: 'RevenueForge API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      leads: '/api/leads',
      health: '/health',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/api/products', products);
app.route('/api/leads', leads);
app.route('/api/audit-logs', auditLogs);
app.route('/api/templates', templates);
app.route('/api/users', users);
app.route('/api/analytics', analytics);
app.route('/api/dealers', dealers);
app.route('/api/upload', upload);
app.route('/api/audit-log', auditLog);
app.route('/api/auth', auth);
app.route('/api/notifications', notifications);
app.route('/api/quotes', quotes);

// ── Error handlers ────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  // Propagate fatal config errors as 503
  if (err.message.startsWith('FATAL:')) {
    return c.json({ error: err.message }, 503);
  }
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
