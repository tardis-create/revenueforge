import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env, RFQSubmission } from '../types';

const rfqs = new Hono<{ Bindings: Env }>();

/**
 * Validation helper for RFQ input
 */
function validateRFQInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.company_name || typeof data.company_name !== 'string' || data.company_name.trim().length === 0) {
    errors.push('Company name is required');
  }
  
  if (!data.contact_name || typeof data.contact_name !== 'string' || data.contact_name.trim().length === 0) {
    errors.push('Contact name is required');
  }
  
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push('Phone is required');
  }
  
  if (!data.service_type || typeof data.service_type !== 'string' || data.service_type.trim().length === 0) {
    errors.push('Service type/product requirements is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/rfq - Submit a new RFQ (public endpoint)
 */
rfqs.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    
    // Validate input
    const validation = validateRFQInput(body);
    if (!validation.valid) {
      return c.json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors 
      }, 400);
    }
    
    const id = generateId();
    const now = getTimestamp();
    
    // Insert RFQ submission - include quantity and unit if provided
    const quantity = body.quantity ?? null;
    const unit = body.unit ?? null;
    
    await db.prepare(
      `INSERT INTO rfq_submissions (
        id, company_name, contact_name, email, phone, 
        service_type, project_description, estimated_budget, timeline,
        quantity, unit, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
    ).bind(
      id,
      body.company_name,
      body.contact_name,
      body.email,
      body.phone,
      body.service_type,
      body.project_description || body.service_type,
      body.estimated_budget || null,
      body.timeline || null,
      quantity,
      unit,
      now,
      now
    ).run();
    
    return c.json({
      success: true,
      id,
      message: 'RFQ submitted successfully'
    }, 201);
    
  } catch (err: any) {
    console.error('POST /api/rfq error:', err);
    return c.json({
      success: false,
      error: 'Failed to submit RFQ',
      details: err.message
    }, 500);
  }
});

/**
 * GET /api/rfqs - List all RFQ submissions (admin only)
 */
rfqs.get('/', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    
    // Parse pagination parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const status = c.req.query('status');
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }
    
    // Build query
    let whereClause = '';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }
    
    // Get total count
    const countResult = await db.prepare(
      `SELECT COUNT(*) as total FROM rfq_submissions ${whereClause}`
    ).bind(...params).first();
    const total = countResult?.total as number || 0;
    
    // Get RFQ submissions
    const rfqsResult = await db.prepare(
      `SELECT * FROM rfq_submissions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();
    
    const rfqList = rfqsResult.results as unknown[];
    
    return c.json({
      success: true,
      data: rfqList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (err: any) {
    console.error('GET /api/rfqs error:', err);
    return c.json({
      success: false,
      error: 'Failed to fetch RFQs'
    }, 500);
  }
});

/**
 * GET /api/rfqs/:id - Get single RFQ submission (admin only)
 */
rfqs.get('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    const result = await db.prepare(
      'SELECT * FROM rfq_submissions WHERE id = ?'
    ).bind(id).first();
    
    if (!result) {
      return c.json({ 
        success: false, 
        error: 'RFQ not found' 
      }, 404);
    }
    
    return c.json({
      success: true,
      data: result
    });
    
  } catch (err: any) {
    console.error('GET /api/rfqs/:id error:', err);
    return c.json({
      success: false,
      error: 'Failed to fetch RFQ'
    }, 500);
  }
});

/**
 * PATCH /api/rfqs/:id - Update RFQ status (admin only)
 */
rfqs.patch('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Check if RFQ exists
    const existing = await db.prepare(
      'SELECT * FROM rfq_submissions WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ 
        success: false, 
        error: 'RFQ not found' 
      }, 404);
    }
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (body.status) {
      const validStatuses = ['new', 'reviewing', 'quoted', 'accepted', 'rejected'];
      if (!validStatuses.includes(body.status)) {
        return c.json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        }, 400);
      }
      updates.push('status = ?');
      values.push(body.status);
    }
    
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes);
    }
    
    if (body.lead_id !== undefined) {
      updates.push('lead_id = ?');
      values.push(body.lead_id);
    }
    
    if (updates.length === 0) {
      return c.json({
        success: false,
        error: 'No fields to update'
      }, 400);
    }
    
    const now = getTimestamp();
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.prepare(
      `UPDATE rfq_submissions SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    // Fetch updated record
    const updated = await db.prepare(
      'SELECT * FROM rfq_submissions WHERE id = ?'
    ).bind(id).first();
    
    return c.json({
      success: true,
      data: updated
    });
    
  } catch (err: any) {
    console.error('PATCH /api/rfqs/:id error:', err);
    return c.json({
      success: false,
      error: 'Failed to update RFQ'
    }, 500);
  }
});

/**
 * DELETE /api/rfqs/:id - Delete RFQ submission (admin only)
 */
rfqs.delete('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // Check if RFQ exists
    const existing = await db.prepare(
      'SELECT * FROM rfq_submissions WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ 
        success: false, 
        error: 'RFQ not found' 
      }, 404);
    }
    
    await db.prepare(
      'DELETE FROM rfq_submissions WHERE id = ?'
    ).bind(id).run();
    
    return c.json({
      success: true,
      message: 'RFQ deleted successfully'
    });
    
  } catch (err: any) {
    console.error('DELETE /api/rfqs/:id error:', err);
    return c.json({
      success: false,
      error: 'Failed to delete RFQ'
    }, 500);
  }
});

export default rfqs;
