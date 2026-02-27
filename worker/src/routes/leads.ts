import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const leads = new Hono<{ Bindings: Env }>();

// All lead routes require authentication
leads.use('*', authMiddleware);

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = 'new' | 'qualified' | 'rfq' | 'quoted' | 'won' | 'lost';

interface Lead {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  dealer_id: string | null;
  source: string | null;
  estimated_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  type: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

const VALID_STATUSES: LeadStatus[] = ['new', 'qualified', 'rfq', 'quoted', 'won', 'lost'];

function validateLeadInput(data: any, partial = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partial || data.company_name !== undefined) {
    if (!data.company_name || typeof data.company_name !== 'string' || data.company_name.trim().length === 0) {
      errors.push('company_name is required and must be a non-empty string');
    }
  }

  if (data.email !== undefined && data.email !== null && data.email !== '') {
    if (typeof data.email !== 'string' || !data.email.includes('@')) {
      errors.push('email must be a valid email address');
    }
  }

  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      errors.push('status must be one of: ' + VALID_STATUSES.join(', '));
    }
  }

  if (data.estimated_value !== undefined) {
    const value = parseFloat(data.estimated_value);
    if (isNaN(value) || value < 0) {
      errors.push('estimated_value must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Lead CRUD ───────────────────────────────────────────────────────────────

/**
 * GET /api/leads - List leads with filters and pagination
 * Query params: status, dealer_id, assigned_to, date_from, date_to, min_value, max_value, page, limit
 */
leads.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50')));
    const offset = (page - 1) * limit;

    // Filters
    const status = c.req.query('status');
    const dealerId = c.req.query('dealer_id');
    const assignedTo = c.req.query('assigned_to');
    const dateFrom = c.req.query('date_from');
    const dateTo = c.req.query('date_to');
    const minValue = c.req.query('min_value');
    const maxValue = c.req.query('max_value');

    // Build query dynamically
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dealerId) {
      query += ' AND dealer_id = ?';
      params.push(dealerId);
    }

    if (assignedTo) {
      query += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    if (dateFrom) {
      query += ' AND created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND created_at <= ?';
      params.push(dateTo);
    }

    if (minValue) {
      query += ' AND estimated_value >= ?';
      params.push(parseFloat(minValue));
    }

    if (maxValue) {
      query += ' AND estimated_value <= ?';
      params.push(parseFloat(maxValue));
    }

    // Count query
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countRow = await db.prepare(countQuery).bind(...params).first<{ total: number }>();

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.prepare(query).bind(...params).all<Lead>();

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
    console.error('GET /api/leads error:', err);
    return c.json({ error: 'Failed to fetch leads' }, 500);
  }
});

/**
 * GET /api/leads/stats - Get lead counts by status for Kanban headers
 */
leads.get('/stats', async (c) => {
  try {
    const db = c.env.DB;
    
    const rows = await db
      .prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status')
      .all<{ status: LeadStatus; count: number }>();

    const stats: Record<LeadStatus, number> = {
      new: 0,
      qualified: 0,
      rfq: 0,
      quoted: 0,
      won: 0,
      lost: 0,
    };

    for (const row of rows.results) {
      stats[row.status] = row.count;
    }

    return c.json({ data: stats });
  } catch (err) {
    console.error('GET /api/leads/stats error:', err);
    return c.json({ error: 'Failed to fetch lead stats' }, 500);
  }
});

/**
 * GET /api/leads/:id - Get single lead with activities
 */
leads.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first<Lead>();
    if (!lead) return c.json({ error: 'Lead not found' }, 404);

    // Fetch activities
    const activitiesResult = await db
      .prepare('SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC LIMIT 50')
      .bind(id)
      .all<LeadActivity>();

    return c.json({ 
      data: { 
        ...lead, 
        activities: activitiesResult.results 
      } 
    });
  } catch (err) {
    console.error('GET /api/leads/:id error:', err);
    return c.json({ error: 'Failed to fetch lead' }, 500);
  }
});

/**
 * POST /api/leads - Create new lead
 */
leads.post('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    
    const { valid, errors } = validateLeadInput(body);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const id = generateId();
    const now = getTimestamp();

    await db
      .prepare(
        'INSERT INTO leads (id, company_name, contact_name, email, phone, status, assigned_to, dealer_id, source, estimated_value, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        body.company_name.trim(),
        body.contact_name?.trim() || null,
        body.email?.trim().toLowerCase() || null,
        body.phone?.trim() || null,
        body.status || 'new',
        body.assigned_to || null,
        body.dealer_id || null,
        body.source || null,
        parseFloat(body.estimated_value ?? 0),
        body.notes || null,
        now,
        now
      )
      .run();

    // Create initial activity
    await db
      .prepare(
        'INSERT INTO lead_activities (id, lead_id, type, description, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        generateId(),
        id,
        'created',
        'Lead created for ' + body.company_name,
        now,
        body.assigned_to || null
      )
      .run();

    const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
    return c.json({ data: lead }, 201);
  } catch (err) {
    console.error('POST /api/leads error:', err);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

/**
 * PATCH /api/leads/:id - Update lead (used for drag-and-drop status changes)
 */
leads.patch('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first<Lead>();
    if (!existing) return c.json({ error: 'Lead not found' }, 404);

    const { valid, errors } = validateLeadInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body, id, updated_at: now };

    await db
      .prepare(
        'UPDATE leads SET company_name=?, contact_name=?, email=?, phone=?, status=?, assigned_to=?, dealer_id=?, source=?, estimated_value=?, notes=?, updated_at=? WHERE id=?'
      )
      .bind(
        merged.company_name,
        merged.contact_name,
        merged.email,
        merged.phone,
        merged.status,
        merged.assigned_to,
        merged.dealer_id,
        merged.source,
        merged.estimated_value,
        merged.notes,
        now,
        id
      )
      .run();

    // If status changed, create activity
    if (body.status && body.status !== existing.status) {
      await db
        .prepare(
          'INSERT INTO lead_activities (id, lead_id, type, description, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(
          generateId(),
          id,
          'status_change',
          'Status changed from ' + existing.status + ' to ' + body.status,
          now,
          body.assigned_to || null
        )
        .run();
    }

    const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
    return c.json({ data: lead });
  } catch (err) {
    console.error('PATCH /api/leads/:id error:', err);
    return c.json({ error: 'Failed to update lead' }, 500);
  }
});

/**
 * DELETE /api/leads/:id - Delete lead
 */
leads.delete('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    const existing = await db.prepare('SELECT id FROM leads WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Lead not found' }, 404);

    // Delete activities first (cascade should handle this, but be explicit)
    await db.prepare('DELETE FROM lead_activities WHERE lead_id = ?').bind(id).run();
    await db.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();

    return c.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/leads/:id error:', err);
    return c.json({ error: 'Failed to delete lead' }, 500);
  }
});

// ─── Lead Activities ──────────────────────────────────────────────────────────

/**
 * GET /api/leads/:id/activities - Get activities for a lead
 */
leads.get('/:id/activities', async (c) => {
  try {
    const db = c.env.DB;
    const leadId = c.req.param('id');

    const lead = await db.prepare('SELECT id FROM leads WHERE id = ?').bind(leadId).first();
    if (!lead) return c.json({ error: 'Lead not found' }, 404);

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;

    const [rows, countRow] = await Promise.all([
      db
        .prepare('SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
        .bind(leadId, limit, offset)
        .all<LeadActivity>(),
      db
        .prepare('SELECT COUNT(*) as total FROM lead_activities WHERE lead_id = ?')
        .bind(leadId)
        .first<{ total: number }>(),
    ]);

    return c.json({
      data: rows.results,
      pagination: { page, limit, total: countRow?.total ?? 0, pages: Math.ceil((countRow?.total ?? 0) / limit) },
    });
  } catch (err) {
    console.error('GET /api/leads/:id/activities error:', err);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

/**
 * POST /api/leads/:id/activities - Add activity to lead
 */
leads.post('/:id/activities', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const leadId = c.req.param('id');
    const body = await c.req.json();

    const lead = await db.prepare('SELECT id FROM leads WHERE id = ?').bind(leadId).first();
    if (!lead) return c.json({ error: 'Lead not found' }, 404);

    if (!body.type || typeof body.type !== 'string') {
      return c.json({ error: 'type is required' }, 422);
    }

    const id = generateId();
    const now = getTimestamp();

    await db
      .prepare(
        'INSERT INTO lead_activities (id, lead_id, type, description, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        leadId,
        body.type,
        body.description || null,
        now,
        body.created_by || null
      )
      .run();

    // Update lead's updated_at
    await db.prepare('UPDATE leads SET updated_at = ? WHERE id = ?').bind(now, leadId).run();

    const activity = await db.prepare('SELECT * FROM lead_activities WHERE id = ?').bind(id).first();
    return c.json({ data: activity }, 201);
  } catch (err) {
    console.error('POST /api/leads/:id/activities error:', err);
    return c.json({ error: 'Failed to create activity' }, 500);
  }
});

export default leads;
