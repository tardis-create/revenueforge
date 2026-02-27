import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
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

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
