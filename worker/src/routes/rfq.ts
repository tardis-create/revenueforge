import { Hono } from 'hono';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const rfq = new Hono<{ Bindings: Env }>();

// Public RFQ endpoint - no auth required

interface RFQSubmission {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  project_description: string | null;
  estimated_budget: string | null;
  timeline: string | null;
  quantity: number | null;
  unit: string | null;
  status: string;
  notes: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * POST /api/rfq - Create new RFQ submission (public, no auth)
 */
rfq.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();

    // Validate required fields
    const errors: string[] = [];
    
    if (!body.company_name || typeof body.company_name !== 'string' || body.company_name.trim().length === 0) {
      errors.push('company_name is required');
    }
    
    if (!body.contact_name || typeof body.contact_name !== 'string' || body.contact_name.trim().length === 0) {
      errors.push('contact_name is required');
    }
    
    if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
      errors.push('email is required');
    } else if (!body.email.includes('@')) {
      errors.push('email must be a valid email address');
    }

    if (errors.length > 0) {
      return c.json({ error: errors.join(', ') }, 422);
    }

    const id = generateId();
    const now = getTimestamp();

    await db
      .prepare(
        `INSERT INTO rfq_submissions (
          id, company_name, contact_name, email, phone, 
          service_type, project_description, estimated_budget, timeline,
          quantity, unit, status, notes, lead_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        body.company_name.trim(),
        body.contact_name.trim(),
        body.email.trim().toLowerCase(),
        body.phone?.trim() || null,
        body.service_type?.trim() || null,
        body.project_description?.trim() || null,
        body.estimated_budget?.trim() || null,
        body.timeline?.trim() || null,
        body.quantity ? parseInt(body.quantity) : null,
        body.unit?.trim() || null,
        'new',
        body.notes?.trim() || null,
        body.lead_id || null,
        now,
        now
      )
      .run();

    const rfq = await db.prepare('SELECT * FROM rfq_submissions WHERE id = ?').bind(id).first<RFQSubmission>();
    
    return c.json({ data: rfq }, 201);
  } catch (err) {
    console.error('POST /api/rfq error:', err);
    return c.json({ error: 'Failed to submit RFQ' }, 500);
  }
});

/**
 * GET /api/rfq - List RFQ submissions (admin only - would need auth middleware in production)
 * For now, this is a placeholder - in production, this should require admin auth
 */
rfq.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = 'SELECT * FROM rfq_submissions WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count query
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countRow = await db.prepare(countQuery).bind(...params).first<{ total: number }>();

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.prepare(query).bind(...params).all<RFQSubmission>();

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
    console.error('GET /api/rfq error:', err);
    return c.json({ error: 'Failed to fetch RFQs' }, 500);
  }
});

/**
 * GET /api/rfq/:id - Get single RFQ submission
 */
rfq.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    const rfq = await db.prepare('SELECT * FROM rfq_submissions WHERE id = ?').bind(id).first<RFQSubmission>();
    if (!rfq) {
      return c.json({ error: 'RFQ not found' }, 404);
    }

    return c.json({ data: rfq });
  } catch (err) {
    console.error('GET /api/rfq/:id error:', err);
    return c.json({ error: 'Failed to fetch RFQ' }, 500);
  }
});

/**
 * PATCH /api/rfq/:id - Update RFQ status (admin only - would need auth middleware in production)
 */
rfq.patch('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM rfq_submissions WHERE id = ?').bind(id).first<RFQSubmission>();
    if (!existing) {
      return c.json({ error: 'RFQ not found' }, 404);
    }

    const now = getTimestamp();
    const validStatuses = ['new', 'reviewing', 'quoted', 'accepted', 'rejected'];
    
    // Validate status if provided
    if (body.status && !validStatuses.includes(body.status)) {
      return c.json({ error: 'Invalid status' }, 422);
    }

    const merged = { 
      ...existing, 
      ...body, 
      id, 
      updated_at: now 
    };

    await db
      .prepare(
        `UPDATE rfq_submissions SET 
          company_name=?, contact_name=?, email=?, phone=?,
          service_type=?, project_description=?, estimated_budget=?, timeline=?,
          quantity=?, unit=?, status=?, notes=?, lead_id=?, updated_at=?
        WHERE id=?`
      )
      .bind(
        merged.company_name,
        merged.contact_name,
        merged.email,
        merged.phone,
        merged.service_type,
        merged.project_description,
        merged.estimated_budget,
        merged.timeline,
        merged.quantity,
        merged.unit,
        merged.status,
        merged.notes,
        merged.lead_id,
        now,
        id
      )
      .run();

    const rfq = await db.prepare('SELECT * FROM rfq_submissions WHERE id = ?').bind(id).first<RFQSubmission>();
    return c.json({ data: rfq });
  } catch (err) {
    console.error('PATCH /api/rfq/:id error:', err);
    return c.json({ error: 'Failed to update RFQ' }, 500);
  }
});

/**
 * DELETE /api/rfq/:id - Delete RFQ submission (admin only)
 */
rfq.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    const existing = await db.prepare('SELECT id FROM rfq_submissions WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ error: 'RFQ not found' }, 404);
    }

    await db.prepare('DELETE FROM rfq_submissions WHERE id = ?').bind(id).run();

    return c.json({ message: 'RFQ deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/rfq/:id error:', err);
    return c.json({ error: 'Failed to delete RFQ' }, 500);
  }
});

export default rfq;
