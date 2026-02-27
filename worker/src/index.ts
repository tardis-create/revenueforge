import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import products from './routes/products';
import auditLogs from './routes/auditLogs';
import templates from './routes/templates';
import users from './routes/users';
import analytics from './routes/analytics';
import dealers from './routes/dealers';
import leads from './routes/leads';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Configure appropriately for production
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'RevenueForge Products API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      leads: '/api/leads',
      health: '/health'
    }
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount product routes under /api/products
app.route('/api/products', products);

// Mount leads routes under /api/leads
app.route('/api/leads', leads);

// Mount audit log routes under /api/audit-logs
app.route('/api/audit-logs', auditLogs);

// Mount email template routes under /api/templates
app.route('/api/templates', templates);

// Mount user routes under /api/users
app.route('/api/users', users);

// Mount analytics routes under /api/analytics
app.route('/api/analytics', analytics);

// Mount dealer routes under /api/dealers
app.route('/api/dealers', dealers);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Export for Cloudflare Workers
export default app;
