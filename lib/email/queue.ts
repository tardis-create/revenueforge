// Email queue management - D1-backed queue processing
import { renderTemplate } from './template-engine';
import { sendEmail } from './sender';
import type { EmailQueueItem, EmailTemplate } from './types';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Enqueue an email for sending
 */
export async function enqueueEmail(
  db: D1Database,
  opts: {
    templateId?: string;
    to: string;
    toName?: string;
    subject: string;
    body: string;
    variables?: Record<string, string>;
    scheduledAt?: string;
  }
): Promise<string> {
  const id = `eq_${generateId()}`;
  const ts = now();
  const scheduledAt = opts.scheduledAt || ts;
  const variables = opts.variables || {};

  await db
    .prepare(
      `INSERT INTO email_queue
        (id, template_id, to_email, to_name, subject, body, variables, status, attempts, max_attempts, scheduled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, 3, ?, ?, ?)`
    )
    .bind(
      id,
      opts.templateId ?? null,
      opts.to,
      opts.toName ?? null,
      opts.subject,
      opts.body,
      JSON.stringify(variables),
      scheduledAt,
      ts,
      ts
    )
    .run();

  return id;
}

/**
 * Enqueue email from a template + variables
 */
export async function enqueueFromTemplate(
  db: D1Database,
  opts: {
    templateId: string;
    to: string;
    toName?: string;
    variables: Record<string, string>;
    scheduledAt?: string;
  }
): Promise<string | null> {
  const template = await db
    .prepare('SELECT * FROM email_templates WHERE id = ? AND is_active = 1')
    .bind(opts.templateId)
    .first() as EmailTemplate | null;

  if (!template) return null;

  const renderedSubject = renderTemplate(template.subject, opts.variables);
  const renderedBody = renderTemplate(template.body, opts.variables);

  return enqueueEmail(db, {
    templateId: opts.templateId,
    to: opts.to,
    toName: opts.toName,
    subject: renderedSubject,
    body: renderedBody,
    variables: opts.variables,
    scheduledAt: opts.scheduledAt,
  });
}

/**
 * Trigger email by event name - finds matching active template and queues it
 */
export async function triggerEmailEvent(
  db: D1Database,
  opts: {
    event: string;
    to: string;
    toName?: string;
    variables: Record<string, string>;
  }
): Promise<string | null> {
  const template = await db
    .prepare('SELECT * FROM email_templates WHERE event_trigger = ? AND is_active = 1 LIMIT 1')
    .bind(opts.event)
    .first() as EmailTemplate | null;

  if (!template) {
    console.log(`[EMAIL] No active template for event: ${opts.event}`);
    return null;
  }

  return enqueueFromTemplate(db, {
    templateId: template.id,
    to: opts.to,
    toName: opts.toName,
    variables: opts.variables,
  });
}

/**
 * Process pending emails in the queue
 * Returns { processed, sent, failed }
 */
export async function processEmailQueue(
  db: D1Database,
  smtpConfig: { resend_api_key?: string; smtp_from?: string; smtp_from_name?: string },
  maxBatch = 10
): Promise<{ processed: number; sent: number; failed: number }> {
  const ts = now();
  let sent = 0;
  let failed = 0;

  // Fetch pending items that are due
  const { results } = await db
    .prepare(
      `SELECT * FROM email_queue
       WHERE status = 'pending' AND scheduled_at <= ? AND attempts < max_attempts
       ORDER BY scheduled_at ASC
       LIMIT ?`
    )
    .bind(ts, maxBatch)
    .all();

  const items = results as unknown as EmailQueueItem[];

  for (const item of items) {
    // Mark as processing
    await db
      .prepare(
        `UPDATE email_queue SET status = 'processing', attempts = attempts + 1, updated_at = ? WHERE id = ?`
      )
      .bind(now(), item.id)
      .run();

    // Send email
    const result = await sendEmail(
      {
        to: item.to_email,
        toName: item.to_name,
        subject: item.subject,
        html: item.body,
        templateId: item.template_id,
        queueId: item.id,
      },
      smtpConfig
    );

    const processedAt = now();

    if (result.success) {
      await db
        .prepare(
          `UPDATE email_queue SET status = 'sent', processed_at = ?, updated_at = ? WHERE id = ?`
        )
        .bind(processedAt, processedAt, item.id)
        .run();
      sent++;
    } else {
      // Check if max attempts reached
      const newStatus = item.attempts + 1 >= item.max_attempts ? 'failed' : 'pending';
      await db
        .prepare(
          `UPDATE email_queue SET status = ?, error = ?, processed_at = ?, updated_at = ? WHERE id = ?`
        )
        .bind(newStatus, result.error, processedAt, processedAt, item.id)
        .run();
      failed++;
    }

    // Log the attempt
    const logId = `el_${generateId()}`;
    await db
      .prepare(
        `INSERT INTO email_logs (id, queue_id, template_id, to_email, subject, status, provider, provider_message_id, error, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        logId,
        item.id,
        item.template_id ?? null,
        item.to_email,
        item.subject,
        result.success ? 'sent' : 'failed',
        result.provider,
        result.messageId ?? null,
        result.error ?? null,
        processedAt
      )
      .run();
  }

  return { processed: items.length, sent, failed };
}
