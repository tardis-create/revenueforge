// Email API routes for Hono - templates, queue, logs, and event trigger
import { Hono } from 'hono';
import { renderTemplate, extractVariables, generateSampleData } from './template-engine';
import { enqueueEmail, enqueueFromTemplate, triggerEmailEvent, processEmailQueue } from './queue';
import type { EmailTemplate, EmailQueueItem, EmailLog } from './types';

type Env = {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  SMTP_FROM?: string;
  SMTP_FROM_NAME?: string;
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getDb(c: { env: Env }): D1Database | null {
  return c.env?.DB ?? null;
}

function getSmtpConfig(c: { env: Env }) {
  return {
    resend_api_key: c.env?.RESEND_API_KEY,
    smtp_from: c.env?.SMTP_FROM,
    smtp_from_name: c.env?.SMTP_FROM_NAME,
  };
}

export function createEmailRoutes() {
  const email = new Hono<{ Bindings: Env }>();

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE ROUTES
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/email/templates
   * List all email templates
   */
  email.get('/templates', async (c) => {
    const db = getDb(c as any);
    if (!db) {
      // Return seeded templates when no DB (dev mode)
      return c.json({ templates: DEFAULT_TEMPLATES });
    }

    try {
      const { results } = await db
        .prepare('SELECT * FROM email_templates ORDER BY created_at DESC')
        .all();
      const templates = results.map(parseTemplate);
      return c.json({ templates });
    } catch {
      return c.json({ templates: DEFAULT_TEMPLATES });
    }
  });

  /**
   * GET /api/email/templates/:id
   * Get a single template
   */
  email.get('/templates/:id', async (c) => {
    const id = c.req.param('id');
    const db = getDb(c as any);

    if (!db) {
      const tpl = DEFAULT_TEMPLATES.find((t) => t.id === id);
      if (!tpl) return c.json({ error: 'Template not found' }, 404);
      return c.json({ template: tpl });
    }

    try {
      const row = await db.prepare('SELECT * FROM email_templates WHERE id = ?').bind(id).first();
      if (!row) return c.json({ error: 'Template not found' }, 404);
      return c.json({ template: parseTemplate(row) });
    } catch (err) {
      return c.json({ error: 'Failed to fetch template' }, 500);
    }
  });

  /**
   * GET /api/email/templates/:id/preview
   * Preview template with sample data
   */
  email.get('/templates/:id/preview', async (c) => {
    const id = c.req.param('id');
    const db = getDb(c as any);
    let template: EmailTemplate | null = null;

    if (db) {
      const row = await db.prepare('SELECT * FROM email_templates WHERE id = ?').bind(id).first();
      if (row) template = parseTemplate(row);
    } else {
      template = DEFAULT_TEMPLATES.find((t) => t.id === id) ?? null;
    }

    if (!template) return c.json({ error: 'Template not found' }, 404);

    const sampleData = generateSampleData(template.variables);
    const renderedSubject = renderTemplate(template.subject, sampleData);
    const renderedBody = renderTemplate(template.body, sampleData);

    return c.json({
      template,
      preview: {
        subject: renderedSubject,
        body: renderedBody,
        variables_used: sampleData,
      },
    });
  });

  /**
   * POST /api/email/templates
   * Create a new template
   */
  email.post('/templates', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { name, subject, body: tplBody, description, event_trigger } = body as any;

    if (!name || !subject || !tplBody) {
      return c.json({ error: 'name, subject, and body are required' }, 400);
    }

    const variables = extractVariables(`${subject} ${tplBody}`);
    const id = generateId('tpl');
    const ts = now();

    const template: EmailTemplate = {
      id,
      name,
      subject,
      body: tplBody,
      description: description || undefined,
      variables,
      event_trigger: event_trigger || undefined,
      is_active: true,
      created_at: ts,
      updated_at: ts,
    };

    const db = getDb(c as any);
    if (db) {
      try {
        await db
          .prepare(
            `INSERT INTO email_templates (id, name, subject, body, description, variables, event_trigger, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
          )
          .bind(id, name, subject, tplBody, description ?? null, JSON.stringify(variables), event_trigger ?? null, ts, ts)
          .run();
      } catch (err: any) {
        if (err?.message?.includes('UNIQUE')) {
          return c.json({ error: 'Template name already exists' }, 409);
        }
        return c.json({ error: 'Failed to create template' }, 500);
      }
    }

    return c.json({ template }, 201);
  });

  /**
   * PUT /api/email/templates/:id
   * Update a template
   */
  email.put('/templates/:id', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { name, subject, body: tplBody, description, event_trigger, is_active } = body as any;
    const db = getDb(c as any);

    if (!db) {
      return c.json({ error: 'Database not available' }, 503);
    }

    const existing = await db.prepare('SELECT * FROM email_templates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Template not found' }, 404);

    const newSubject = subject ?? (existing as any).subject;
    const newBody = tplBody ?? (existing as any).body;
    const variables = extractVariables(`${newSubject} ${newBody}`);
    const ts = now();

    try {
      await db
        .prepare(
          `UPDATE email_templates SET name = ?, subject = ?, body = ?, description = ?, variables = ?, event_trigger = ?, is_active = ?, updated_at = ? WHERE id = ?`
        )
        .bind(
          name ?? (existing as any).name,
          newSubject,
          newBody,
          description ?? (existing as any).description,
          JSON.stringify(variables),
          event_trigger ?? (existing as any).event_trigger,
          is_active !== undefined ? (is_active ? 1 : 0) : (existing as any).is_active,
          ts,
          id
        )
        .run();
    } catch (err: any) {
      if (err?.message?.includes('UNIQUE')) {
        return c.json({ error: 'Template name already exists' }, 409);
      }
      return c.json({ error: 'Failed to update template' }, 500);
    }

    const updated = await db.prepare('SELECT * FROM email_templates WHERE id = ?').bind(id).first();
    return c.json({ template: parseTemplate(updated) });
  });

  /**
   * DELETE /api/email/templates/:id
   */
  email.delete('/templates/:id', async (c) => {
    const id = c.req.param('id');
    const db = getDb(c as any);

    if (!db) return c.json({ error: 'Database not available' }, 503);

    const existing = await db.prepare('SELECT id FROM email_templates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Template not found' }, 404);

    await db.prepare('DELETE FROM email_templates WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Template deleted' });
  });

  // ─────────────────────────────────────────────────────────────
  // EMAIL QUEUE ROUTES
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/email/queue
   * List queue items (with optional status filter)
   */
  email.get('/queue', async (c) => {
    const db = getDb(c as any);
    if (!db) return c.json({ queue: [], total: 0 });

    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') ?? '50');

    let query = 'SELECT * FROM email_queue';
    const params: (string | number)[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    try {
      const { results } = await db.prepare(query).bind(...params).all();
      const queue = results.map(parseQueueItem);
      return c.json({ queue, total: queue.length });
    } catch {
      return c.json({ error: 'Failed to fetch queue' }, 500);
    }
  });

  /**
   * POST /api/email/queue/send
   * Send email directly (without template)
   */
  email.post('/queue/send', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { to, to_name, subject, html } = body as any;
    if (!to || !subject || !html) {
      return c.json({ error: 'to, subject, and html are required' }, 400);
    }

    const db = getDb(c as any);

    if (db) {
      const queueId = await enqueueEmail(db, {
        to,
        toName: to_name,
        subject,
        body: html,
      });
      return c.json({ success: true, queue_id: queueId, status: 'queued' }, 201);
    }

    // No DB - send immediately
    const { sendEmail } = await import('./sender');
    const result = await sendEmail({ to, toName: to_name, subject, html }, getSmtpConfig(c as any));
    return c.json({ success: result.success, provider: result.provider, message_id: result.messageId });
  });

  /**
   * POST /api/email/queue/send-template
   * Queue email from a template
   */
  email.post('/queue/send-template', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { template_id, to, to_name, variables, scheduled_at } = body as any;
    if (!template_id || !to) {
      return c.json({ error: 'template_id and to are required' }, 400);
    }

    const db = getDb(c as any);
    if (!db) return c.json({ error: 'Database not available' }, 503);

    const queueId = await enqueueFromTemplate(db, {
      templateId: template_id,
      to,
      toName: to_name,
      variables: variables ?? {},
      scheduledAt: scheduled_at,
    });

    if (!queueId) {
      return c.json({ error: 'Template not found or inactive' }, 404);
    }

    return c.json({ success: true, queue_id: queueId, status: 'queued' }, 201);
  });

  /**
   * POST /api/email/queue/process
   * Process pending queue items (called by cron or admin)
   */
  email.post('/queue/process', async (c) => {
    const db = getDb(c as any);
    if (!db) return c.json({ error: 'Database not available' }, 503);

    const smtpConfig = getSmtpConfig(c as any);
    const batch = parseInt(c.req.query('batch') ?? '10');

    try {
      const result = await processEmailQueue(db, smtpConfig, batch);
      return c.json({ success: true, ...result });
    } catch (err: any) {
      return c.json({ error: 'Queue processing failed', details: err?.message }, 500);
    }
  });

  /**
   * DELETE /api/email/queue/:id
   * Cancel a queued email
   */
  email.delete('/queue/:id', async (c) => {
    const id = c.req.param('id');
    const db = getDb(c as any);
    if (!db) return c.json({ error: 'Database not available' }, 503);

    const item = await db.prepare("SELECT id, status FROM email_queue WHERE id = ?").bind(id).first() as any;
    if (!item) return c.json({ error: 'Queue item not found' }, 404);
    if (item.status !== 'pending') return c.json({ error: 'Only pending items can be cancelled' }, 400);

    await db.prepare("UPDATE email_queue SET status = 'cancelled', updated_at = ? WHERE id = ?").bind(now(), id).run();
    return c.json({ success: true, message: 'Email cancelled' });
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT TRIGGER ROUTE
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/email/trigger
   * Trigger email by event name
   */
  email.post('/trigger', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { event, to, to_name, variables } = body as any;
    if (!event || !to) {
      return c.json({ error: 'event and to are required' }, 400);
    }

    const db = getDb(c as any);
    if (!db) {
      console.log(`[EMAIL TRIGGER] event=${event} to=${to} variables=${JSON.stringify(variables ?? {})}`);
      return c.json({ success: true, message: 'Event logged (no DB)', queue_id: null });
    }

    const queueId = await triggerEmailEvent(db, {
      event,
      to,
      toName: to_name,
      variables: variables ?? {},
    });

    if (!queueId) {
      return c.json({
        success: false,
        message: `No active template found for event: ${event}`,
        queue_id: null,
      }, 404);
    }

    return c.json({ success: true, queue_id: queueId, event, status: 'queued' }, 201);
  });

  // ─────────────────────────────────────────────────────────────
  // EMAIL LOGS ROUTE
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/email/logs
   * List email send logs
   */
  email.get('/logs', async (c) => {
    const db = getDb(c as any);
    if (!db) return c.json({ logs: [], total: 0 });

    const limit = parseInt(c.req.query('limit') ?? '50');
    const status = c.req.query('status');

    let query = 'SELECT * FROM email_logs';
    const params: (string | number)[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY sent_at DESC LIMIT ?';
    params.push(limit);

    try {
      const { results } = await db.prepare(query).bind(...params).all();
      return c.json({ logs: results, total: results.length });
    } catch {
      return c.json({ error: 'Failed to fetch logs' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // STATS ROUTE
  // ─────────────────────────────────────────────────────────────

  /**
   * GET /api/email/stats
   * Email system stats
   */
  email.get('/stats', async (c) => {
    const db = getDb(c as any);
    if (!db) return c.json({ stats: { templates: 5, queue: {}, logs: {} } });

    try {
      const [tplCount, queueStats, logStats] = await Promise.all([
        db.prepare('SELECT COUNT(*) as count FROM email_templates WHERE is_active = 1').first<{ count: number }>(),
        db.prepare(`SELECT status, COUNT(*) as count FROM email_queue GROUP BY status`).all(),
        db.prepare(`SELECT status, COUNT(*) as count FROM email_logs WHERE sent_at >= datetime('now', '-30 days') GROUP BY status`).all(),
      ]);

      const queueByStatus: Record<string, number> = {};
      for (const row of (queueStats.results as any[])) queueByStatus[row.status] = row.count;

      const logByStatus: Record<string, number> = {};
      for (const row of (logStats.results as any[])) logByStatus[row.status] = row.count;

      return c.json({
        stats: {
          active_templates: tplCount?.count ?? 0,
          queue: queueByStatus,
          logs_last_30_days: logByStatus,
        },
      });
    } catch {
      return c.json({ error: 'Failed to fetch stats' }, 500);
    }
  });

  return email;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function parseTemplate(row: unknown): EmailTemplate {
  const r = row as any;
  return {
    ...r,
    is_active: Boolean(r.is_active),
    variables: typeof r.variables === 'string' ? JSON.parse(r.variables) : (r.variables ?? []),
  };
}

function parseQueueItem(row: unknown): EmailQueueItem {
  const r = row as any;
  return {
    ...r,
    variables: typeof r.variables === 'string' ? JSON.parse(r.variables) : (r.variables ?? {}),
  };
}

// Default templates for dev mode (no DB)
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}, {{user_name}}!',
    body: '<h1>Welcome, {{user_name}}!</h1><p>Thank you for joining {{company_name}}.</p>',
    description: 'Sent when a new user registers',
    variables: ['user_name', 'company_name', 'login_url', 'support_email'],
    event_trigger: 'user.registered',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_quote_created',
    name: 'Quote Created',
    subject: 'Your Quote #{{quote_number}} is Ready',
    body: '<h1>Hi {{customer_name}},</h1><p>Your quote <strong>#{{quote_number}}</strong> for <strong>{{total_amount}}</strong> is ready.</p>',
    description: 'Sent when a quote is created',
    variables: ['customer_name', 'quote_number', 'total_amount', 'valid_until', 'quote_url', 'company_name'],
    event_trigger: 'quote.created',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_rfq_received',
    name: 'RFQ Received',
    subject: 'We Received Your Request for Quote',
    body: '<h1>RFQ Received</h1><p>Hi {{customer_name}}, your RFQ <strong>{{rfq_number}}</strong> has been received.</p>',
    description: 'Sent when an RFQ is submitted',
    variables: ['customer_name', 'rfq_number', 'submitted_at', 'response_time', 'company_name'],
    event_trigger: 'rfq.submitted',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_password_reset',
    name: 'Password Reset',
    subject: 'Reset Your {{company_name}} Password',
    body: '<h1>Password Reset</h1><p>Hi {{user_name}}, <a href="{{reset_url}}">click here</a> to reset your password. Expires in {{expiry}}.</p>',
    description: 'Sent on password reset request',
    variables: ['user_name', 'company_name', 'reset_url', 'expiry'],
    event_trigger: 'user.password_reset',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_dealer_approved',
    name: 'Dealer Account Approved',
    subject: 'Your Dealer Account is Approved!',
    body: '<h1>Approved!</h1><p>Hi {{dealer_name}}, your dealer account with {{company_name}} is approved. <a href="{{portal_url}}">Access Portal</a>. Code: {{dealer_code}}.</p>',
    description: 'Sent when a dealer account is approved',
    variables: ['dealer_name', 'company_name', 'portal_url', 'dealer_code', 'account_manager_email'],
    event_trigger: 'dealer.approved',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
