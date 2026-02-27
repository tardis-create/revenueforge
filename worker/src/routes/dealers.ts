import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const dealers = new Hono<{ Bindings: Env }>();

// All dealer routes require authentication
dealers.use('*', authMiddleware);

// ─── Validation ──────────────────────────────────────────────────────────────

function validateDealerInput(data: any, partial = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partial || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    }
  }

  if (!partial || data.email !== undefined) {
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      errors.push('email is required and must be a valid email address');
    }
  }

  if (data.commission_rate !== undefined) {
    const rate = parseFloat(data.commission_rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.push('commission_rate must be a number between 0 and 100');
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateCommissionInput(data: any, partial = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partial || data.amount !== undefined) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('amount is required and must be a non-negative number');
    }
  }

  if (!partial || data.rate !== undefined) {
    const rate = parseFloat(data.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.push('rate is required and must be a number between 0 and 100');
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['pending', 'approved', 'paid', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Dealer CRUD ─────────────────────────────────────────────────────────────

/**
 * GET /api/dealers - List all dealers (admin only)
 */
dealers.get('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = 'SELECT * FROM dealers';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM dealers WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM dealers';
    const countParams = status ? [status] : [];

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    return c.json({
      data: rows.results,
      pagination: {
        page,
        limit,
        total: countRow?.total ?? 0,
        pages: Math.ceil((countRow?.total ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/dealers error:', err);
    return c.json({ error: 'Failed to fetch dealers' }, 500);
  }
});

/**
 * GET /api/dealers/:id - Get single dealer with embedded leads and commissions
 */
dealers.get('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const dealer = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    if (!dealer) return c.json({ error: 'Dealer not found' }, 404);

    // Embed assigned leads
    let leads: any[] = [];
    try {
      const leadsResult = await db
        .prepare('SELECT * FROM leads WHERE dealer_id = ? ORDER BY created_at DESC')
        .bind(id)
        .all();
      leads = leadsResult.results as any[];
    } catch (_e) {
      // leads table missing dealer_id column or doesn't exist yet
    }

    // Embed commissions
    let commissions: any[] = [];
    try {
      const commissionsResult = await db
        .prepare('SELECT * FROM commissions WHERE dealer_id = ? ORDER BY created_at DESC')
        .bind(id)
        .all();
      commissions = commissionsResult.results as any[];
    } catch (_e) {
      // commissions table doesn't exist yet
    }

    return c.json({ data: { ...dealer, leads, commissions } });
  } catch (err) {
    console.error('GET /api/dealers/:id error:', err);
    return c.json({ error: 'Failed to fetch dealer' }, 500);
  }
});

/**
 * POST /api/dealers - Create dealer (admin only)
 */
dealers.post('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { valid, errors } = validateDealerInput(body);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const id = generateId();
    const now = getTimestamp();

    await db
      .prepare(
        `INSERT INTO dealers (id, name, email, phone, company, region, status, commission_rate, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        body.name.trim(),
        body.email.trim().toLowerCase(),
        body.phone || null,
        body.company || null,
        body.region || null,
        body.status || 'active',
        parseFloat(body.commission_rate ?? 0),
        body.notes || null,
        now,
        now
      )
      .run();

    const dealer = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    return c.json({ data: dealer }, 201);
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return c.json({ error: 'A dealer with this email already exists' }, 409);
    }
    console.error('POST /api/dealers error:', err);
    return c.json({ error: 'Failed to create dealer' }, 500);
  }
});

/**
 * PUT /api/dealers/:id - Full update dealer (admin only)
 */
dealers.put('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Dealer not found' }, 404);

    const { valid, errors } = validateDealerInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body, id, updated_at: now };

    await db
      .prepare(
        `UPDATE dealers SET name=?, email=?, phone=?, company=?, region=?, status=?, commission_rate=?, notes=?, updated_at=?
         WHERE id=?`
      )
      .bind(
        merged.name,
        typeof merged.email === 'string' ? merged.email.toLowerCase() : merged.email,
        merged.phone ?? null,
        merged.company ?? null,
        merged.region ?? null,
        merged.status,
        parseFloat(merged.commission_rate ?? 0),
        merged.notes ?? null,
        now,
        id
      )
      .run();

    const dealer = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    return c.json({ data: dealer });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return c.json({ error: 'A dealer with this email already exists' }, 409);
    }
    console.error('PUT /api/dealers/:id error:', err);
    return c.json({ error: 'Failed to update dealer' }, 500);
  }
});

/**
 * PATCH /api/dealers/:id - Partial update dealer (admin only)
 */
dealers.patch('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Dealer not found' }, 404);

    const { valid, errors } = validateDealerInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body, id, updated_at: now };

    await db
      .prepare(
        `UPDATE dealers SET name=?, email=?, phone=?, company=?, region=?, status=?, commission_rate=?, notes=?, updated_at=?
         WHERE id=?`
      )
      .bind(
        merged.name,
        typeof merged.email === 'string' ? merged.email.toLowerCase() : merged.email,
        merged.phone ?? null,
        merged.company ?? null,
        merged.region ?? null,
        merged.status,
        parseFloat(merged.commission_rate ?? 0),
        merged.notes ?? null,
        now,
        id
      )
      .run();

    const dealer = await db.prepare('SELECT * FROM dealers WHERE id = ?').bind(id).first();
    return c.json({ data: dealer });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return c.json({ error: 'A dealer with this email already exists' }, 409);
    }
    console.error('PATCH /api/dealers/:id error:', err);
    return c.json({ error: 'Failed to update dealer' }, 500);
  }
});

/**
 * DELETE /api/dealers/:id - Soft-delete dealer by setting status='inactive' (admin only)
 */
dealers.delete('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const existing = await db.prepare('SELECT id FROM dealers WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Dealer not found' }, 404);

    const now = getTimestamp();
    await db
      .prepare("UPDATE dealers SET status='inactive', updated_at=? WHERE id=?")
      .bind(now, id)
      .run();

    return c.json({ message: 'Dealer deactivated successfully' });
  } catch (err) {
    console.error('DELETE /api/dealers/:id error:', err);
    return c.json({ error: 'Failed to deactivate dealer' }, 500);
  }
});

// ─── Dealer Leads ─────────────────────────────────────────────────────────────

/**
 * GET /api/dealers/:id/leads - Get leads assigned to a dealer
 */
dealers.get('/:id/leads', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const dealerId = c.req.param('id');

    const dealer = await db.prepare('SELECT id FROM dealers WHERE id = ?').bind(dealerId).first();
    if (!dealer) return c.json({ error: 'Dealer not found' }, 404);

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;

    let leads: any[] = [];
    let total = 0;
    try {
      const [rows, countRow] = await Promise.all([
        db
          .prepare('SELECT * FROM leads WHERE dealer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
          .bind(dealerId, limit, offset)
          .all(),
        db
          .prepare('SELECT COUNT(*) as total FROM leads WHERE dealer_id = ?')
          .bind(dealerId)
          .first<{ total: number }>(),
      ]);
      leads = rows.results as any[];
      total = countRow?.total ?? 0;
    } catch (_e) {
      // leads table doesn't exist or has no dealer_id column
    }

    return c.json({
      data: leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/dealers/:id/leads error:', err);
    return c.json({ error: 'Failed to fetch dealer leads' }, 500);
  }
});

// ─── Dealer Commissions ───────────────────────────────────────────────────────

/**
 * GET /api/dealers/:id/commissions - List commissions for a dealer
 */
dealers.get('/:id/commissions', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const dealerId = c.req.param('id');

    const dealer = await db.prepare('SELECT id FROM dealers WHERE id = ?').bind(dealerId).first();
    if (!dealer) return c.json({ error: 'Dealer not found' }, 404);

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = 'SELECT * FROM commissions WHERE dealer_id = ?';
    const params: any[] = [dealerId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM commissions WHERE dealer_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM commissions WHERE dealer_id = ?';
    const countParams = status ? [dealerId, status] : [dealerId];

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    const total = countRow?.total ?? 0;
    return c.json({
      data: rows.results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/dealers/:id/commissions error:', err);
    return c.json({ error: 'Failed to fetch commissions' }, 500);
  }
});

/**
 * POST /api/dealers/:id/commissions - Create a commission record
 */
dealers.post('/:id/commissions', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const dealerId = c.req.param('id');

    const dealer = await db.prepare('SELECT id FROM dealers WHERE id = ?').bind(dealerId).first();
    if (!dealer) return c.json({ error: 'Dealer not found' }, 404);

    const body = await c.req.json();
    const { valid, errors } = validateCommissionInput(body);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const id = generateId();
    const now = getTimestamp();

    await db
      .prepare(
        `INSERT INTO commissions (id, dealer_id, lead_id, amount, rate, status, description, paid_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        dealerId,
        body.lead_id || null,
        parseFloat(body.amount),
        parseFloat(body.rate),
        body.status || 'pending',
        body.description || null,
        body.paid_at || null,
        now,
        now
      )
      .run();

    const commission = await db.prepare('SELECT * FROM commissions WHERE id = ?').bind(id).first();
    return c.json({ data: commission }, 201);
  } catch (err) {
    console.error('POST /api/dealers/:id/commissions error:', err);
    return c.json({ error: 'Failed to create commission' }, 500);
  }
});

/**
 * PUT /api/dealers/:id/commissions/:commissionId - Update a commission
 */
dealers.put('/:id/commissions/:commissionId', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const dealerId = c.req.param('id');
    const commissionId = c.req.param('commissionId');
    const body = await c.req.json();

    const existing = await db
      .prepare('SELECT * FROM commissions WHERE id = ? AND dealer_id = ?')
      .bind(commissionId, dealerId)
      .first();
    if (!existing) return c.json({ error: 'Commission not found' }, 404);

    const { valid, errors } = validateCommissionInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body };

    // If status is 'paid', auto-set paid_at; otherwise clear it
    const paidAt = merged.status === 'paid' ? (merged.paid_at || now) : null;

    await db
      .prepare(
        `UPDATE commissions SET lead_id=?, amount=?, rate=?, status=?, description=?, paid_at=?, updated_at=?
         WHERE id=? AND dealer_id=?`
      )
      .bind(
        merged.lead_id ?? null,
        parseFloat(merged.amount),
        parseFloat(merged.rate),
        merged.status,
        merged.description ?? null,
        paidAt ?? null,
        now,
        commissionId,
        dealerId
      )
      .run();

    const commission = await db.prepare('SELECT * FROM commissions WHERE id = ?').bind(commissionId).first();
    return c.json({ data: commission });
  } catch (err) {
    console.error('PUT /api/dealers/:id/commissions/:commissionId error:', err);
    return c.json({ error: 'Failed to update commission' }, 500);
  }
});

/**
 * DELETE /api/dealers/:id/commissions/:commissionId - Delete a commission
 */
dealers.delete('/:id/commissions/:commissionId', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const dealerId = c.req.param('id');
    const commissionId = c.req.param('commissionId');

    const existing = await db
      .prepare('SELECT id FROM commissions WHERE id = ? AND dealer_id = ?')
      .bind(commissionId, dealerId)
      .first();
    if (!existing) return c.json({ error: 'Commission not found' }, 404);

    await db.prepare('DELETE FROM commissions WHERE id = ?').bind(commissionId).run();
    return c.json({ message: 'Commission deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/dealers/:id/commissions/:commissionId error:', err);
    return c.json({ error: 'Failed to delete commission' }, 500);
  }
});

export default dealers;
