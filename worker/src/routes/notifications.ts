import { Hono } from 'hono';
import { Env } from '../types';

const notifications = new Hono<{ Bindings: Env }>();

// Template variable renderer
function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
}

// Get SMTP settings from DB
async function getSmtpSettings(db: D1Database) {
  const rows = await db.prepare(
    "SELECT key, value FROM settings WHERE category = 'smtp'"
  ).all();
  const settings: Record<string, string> = {};
  for (const row of rows.results as { key: string; value: string }[]) {
    try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
  }
  return settings;
}

// Send email via Resend API (fallback: log only)
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  smtp: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, smtp } = opts;

  // Use Resend if api key configured
  const resendKey = smtp['resend_api_key'];
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: smtp['smtp_from'] || 'noreply@revenueforge.com',
          to: [to],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Resend error ${res.status}: ${err}` };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // SMTP via MailChannels (available in CF Workers)
  const smtpHost = smtp['smtp_host'];
  if (smtpHost) {
    try {
      const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: smtp['smtp_from'] || smtp['smtp_user'] || 'noreply@revenueforge.com' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (!res.ok && res.status !== 202) {
        const err = await res.text();
        return { success: false, error: `MailChannels error ${res.status}: ${err}` };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // No email provider configured
  return { success: false, error: 'No email provider configured. Set resend_api_key or smtp_host in settings.' };
}

// POST /api/notifications/send
notifications.post('/send', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    event?: string;
    template_id?: string;
    recipient: string;
    data?: Record<string, string>;
  }>();

  if (!body.recipient) {
    return c.json({ error: 'recipient is required' }, 400);
  }

  const data: Record<string, string> = body.data || {};
  let templateId = body.template_id;
  let subject = '';
  let html = '';

  // If event provided, look up trigger → template
  if (body.event && !templateId) {
    const trigger = await db.prepare(
      'SELECT * FROM notification_triggers WHERE event = ? AND is_active = 1'
    ).bind(body.event).first<{ template_id: string }>();
    if (trigger?.template_id) templateId = trigger.template_id;
  }

  // Load template
  if (templateId) {
    const tpl = await db.prepare(
      'SELECT * FROM email_templates WHERE id = ? AND is_active = 1'
    ).bind(templateId).first<{ subject: string; body: string }>();
    if (tpl) {
      subject = renderTemplate(tpl.subject, data);
      html = renderTemplate(tpl.body, data);
    }
  }

  if (!subject && data.subject) subject = data.subject;
  if (!html && data.body) html = data.body;
  if (!subject) subject = `Notification: ${body.event || 'message'}`;
  if (!html) html = `<p>You have a new notification.</p>`;

  const smtp = await getSmtpSettings(db);
  const result = await sendEmail({ to: body.recipient, subject, html, smtp });

  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO notification_logs (id, event, template_id, recipient, subject, body, status, error_detail, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    id,
    body.event || 'manual',
    templateId || null,
    body.recipient,
    subject,
    html,
    result.success ? 'sent' : 'failed',
    result.error || null,
    JSON.stringify(data)
  ).run();

  if (!result.success) {
    return c.json({ success: false, id, error: result.error }, 502);
  }

  return c.json({ success: true, id, recipient: body.recipient, subject }, 201);
});

// GET /api/notifications — sent history
notifications.get('/', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');
  const event = c.req.query('event');

  let query = 'SELECT * FROM notification_logs';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (event) { conditions.push('event = ?'); params.push(event); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = await db.prepare(query).bind(...params).all();
  const countQ = 'SELECT COUNT(*) as total FROM notification_logs' +
    (conditions.length ? ' WHERE ' + conditions.join(' AND ') : '');
  const total = await db.prepare(countQ).bind(...params.slice(0, -2)).first<{ total: number }>();

  return c.json({ notifications: rows.results, total: total?.total || 0, limit, offset });
});

// GET /api/notifications/triggers — list event triggers
notifications.get('/triggers', async (c) => {
  const db = c.env.DB;
  const rows = await db.prepare('SELECT * FROM notification_triggers ORDER BY event').all();
  return c.json({ triggers: rows.results });
});

// PUT /api/notifications/triggers/:event — configure trigger
notifications.put('/triggers/:event', async (c) => {
  const db = c.env.DB;
  const event = c.req.param('event');
  const body = await c.req.json<{ template_id?: string; is_active?: boolean }>();

  const existing = await db.prepare(
    'SELECT * FROM notification_triggers WHERE event = ?'
  ).bind(event).first();
  if (!existing) return c.json({ error: 'Trigger not found' }, 404);

  await db.prepare(
    `UPDATE notification_triggers SET template_id = ?, is_active = ?, updated_at = datetime('now') WHERE event = ?`
  ).bind(
    body.template_id ?? (existing as any).template_id,
    body.is_active !== undefined ? (body.is_active ? 1 : 0) : (existing as any).is_active,
    event
  ).run();

  const updated = await db.prepare('SELECT * FROM notification_triggers WHERE event = ?').bind(event).first();
  return c.json({ trigger: updated });
});

// POST /api/notifications/webhook — send to external URL
notifications.post('/webhook', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    url: string;
    event: string;
    data?: Record<string, unknown>;
  }>();

  if (!body.url) return c.json({ error: 'url is required' }, 400);
  if (!body.event) return c.json({ error: 'event is required' }, 400);

  const payload = {
    event: body.event,
    data: body.data || {},
    timestamp: new Date().toISOString(),
  };

  let success = false;
  let errorDetail: string | null = null;

  try {
    const res = await fetch(body.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'RevenueForge-Webhooks/1.0' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      errorDetail = `HTTP ${res.status}: ${await res.text()}`;
    } else {
      success = true;
    }
  } catch (e: any) {
    errorDetail = e.message;
  }

  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO notification_logs (id, event, recipient, subject, body, status, error_detail, webhook_url, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    id,
    body.event,
    body.url,
    'webhook',
    JSON.stringify(payload),
    success ? 'sent' : 'failed',
    errorDetail,
    body.url,
    JSON.stringify(body.data || {})
  ).run();

  if (!success) {
    return c.json({ success: false, id, error: errorDetail }, 502);
  }

  return c.json({ success: true, id, url: body.url, event: body.event }, 201);
});

export default notifications;
