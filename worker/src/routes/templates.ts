import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const templates = new Hono<{ Bindings: Env }>();

// All template routes require auth + admin
templates.use('*', authMiddleware);
templates.use('*', requireAdmin);

/**
 * Validate template input
 */
function validateTemplateInput(data: any, requireAll = true): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (requireAll || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    }
  }

  if (requireAll || data.subject !== undefined) {
    if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length === 0) {
      errors.push('subject is required and must be a non-empty string');
    }
  }

  if (requireAll || data.body !== undefined) {
    if (!data.body || typeof data.body !== 'string' || data.body.trim().length === 0) {
      errors.push('body is required and must be a non-empty string');
    }
  }

  if (data.variables !== undefined) {
    if (!Array.isArray(data.variables)) {
      errors.push('variables must be an array');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * GET /api/templates
 * List all email templates
 */
templates.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, subject, description, variables, is_active, created_by, created_at, updated_at
       FROM email_templates
       ORDER BY created_at DESC`
    ).all();

    const parsed = results.map((row: any) => ({
      ...row,
      is_active: Boolean(row.is_active),
      variables: row.variables ? JSON.parse(row.variables) : [],
    }));

    return c.json({ templates: parsed });
  } catch (err) {
    console.error('GET /api/templates error:', err);
    return c.json({ error: 'Failed to fetch templates' }, 500);
  }
});

/**
 * GET /api/templates/:id
 * Get a single template
 */
templates.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const row = await c.env.DB.prepare(
      `SELECT * FROM email_templates WHERE id = ?`
    ).bind(id).first();

    if (!row) {
      return c.json({ error: 'Template not found' }, 404);
    }

    return c.json({
      template: {
        ...row,
        is_active: Boolean((row as any).is_active),
        variables: (row as any).variables ? JSON.parse((row as any).variables as string) : [],
      },
    });
  } catch (err) {
    console.error('GET /api/templates/:id error:', err);
    return c.json({ error: 'Failed to fetch template' }, 500);
  }
});

/**
 * POST /api/templates
 * Create a new email template
 */
templates.post('/', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { valid, errors } = validateTemplateInput(body, true);
  if (!valid) {
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }

  const user = c.get('user');
  const id = generateId();
  const now = getTimestamp();

  try {
    await c.env.DB.prepare(
      `INSERT INTO email_templates (id, name, subject, body, description, variables, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.name.trim(),
      body.subject.trim(),
      body.body.trim(),
      body.description?.trim() ?? null,
      body.variables ? JSON.stringify(body.variables) : null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      user.userId,
      now,
      now
    ).run();

    const created = await c.env.DB.prepare(
      `SELECT * FROM email_templates WHERE id = ?`
    ).bind(id).first();

    return c.json(
      {
        template: {
          ...created,
          is_active: Boolean((created as any).is_active),
          variables: (created as any).variables ? JSON.parse((created as any).variables as string) : [],
        },
      },
      201
    );
  } catch (err) {
    console.error('POST /api/templates error:', err);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

/**
 * PATCH /api/templates/:id
 * Update an email template (partial update)
 */
templates.patch('/:id', async (c) => {
  const id = c.req.param('id');

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { valid, errors } = validateTemplateInput(body, false);
  if (!valid) {
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }

  try {
    const existing = await c.env.DB.prepare(
      `SELECT * FROM email_templates WHERE id = ?`
    ).bind(id).first();

    if (!existing) {
      return c.json({ error: 'Template not found' }, 404);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name.trim()); }
    if (body.subject !== undefined) { fields.push('subject = ?'); values.push(body.subject.trim()); }
    if (body.body !== undefined) { fields.push('body = ?'); values.push(body.body.trim()); }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description?.trim() ?? null); }
    if (body.variables !== undefined) { fields.push('variables = ?'); values.push(JSON.stringify(body.variables)); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active ? 1 : 0); }

    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    fields.push('updated_at = ?');
    values.push(getTimestamp());
    values.push(id);

    await c.env.DB.prepare(
      `UPDATE email_templates SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    const updated = await c.env.DB.prepare(
      `SELECT * FROM email_templates WHERE id = ?`
    ).bind(id).first();

    return c.json({
      template: {
        ...updated,
        is_active: Boolean((updated as any).is_active),
        variables: (updated as any).variables ? JSON.parse((updated as any).variables as string) : [],
      },
    });
  } catch (err) {
    console.error('PATCH /api/templates/:id error:', err);
    return c.json({ error: 'Failed to update template' }, 500);
  }
});

/**
 * DELETE /api/templates/:id
 * Remove an email template
 */
templates.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const existing = await c.env.DB.prepare(
      `SELECT id FROM email_templates WHERE id = ?`
    ).bind(id).first();

    if (!existing) {
      return c.json({ error: 'Template not found' }, 404);
    }

    await c.env.DB.prepare(
      `DELETE FROM email_templates WHERE id = ?`
    ).bind(id).run();

    return c.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/templates/:id error:', err);
    return c.json({ error: 'Failed to delete template' }, 500);
  }
});

export default templates;
