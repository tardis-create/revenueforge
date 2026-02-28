import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';
import { logAction } from '../utils/auditLog';

const quotes = new Hono<{ Bindings: Env }>();

/**
 * GET /api/quotes - List all quotes with customer info
 * Admin only
 */
quotes.get('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const status = c.req.query('status');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query with optional status filter
    let whereClause = '';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause = ' WHERE q.status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM quotes q${whereClause}`;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult?.total as number || 0;

    // Get quotes with customer info from RFQ
    const quotesQuery = `
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes,
        q.created_at, q.updated_at, q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const quotesResult = await db.prepare(quotesQuery).bind(...params, limit, offset).all();
    const quotesList = quotesResult.results as any[];

    // Fetch items for each quote
    for (const quote of quotesList) {
      const itemsResult = await db.prepare(`
        SELECT qi.*, p.name as product_name
        FROM quote_items qi
        LEFT JOIN products p ON qi.product_id = p.id
        WHERE qi.quote_id = ?
        ORDER BY qi.created_at
      `).bind(quote.id).all();
      
      quote.items = itemsResult.results || [];
    }

    return c.json({
      success: true,
      data: quotesList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/quotes/:id - Get single quote with full details
 * Admin only
 */
quotes.get('/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');

    // Get quote with customer info
    const quote = await db.prepare(`
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes,
        q.created_at, q.updated_at, q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
      WHERE q.id = ?
    `).bind(quoteId).first();

    if (!quote) {
      return c.json({ success: false, error: 'Quote not found' }, 404);
    }

    // Get quote items with product names
    const itemsResult = await db.prepare(`
      SELECT qi.*, p.name as product_name
      FROM quote_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quote_id = ?
      ORDER BY qi.created_at
    `).bind(quoteId).all();

    (quote as any).items = itemsResult.results || [];

    return c.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/quotes - Create new quote
 * Admin only
 */
quotes.post('/', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();

    // Validate required fields
    if (!body.rfq_id) {
      return c.json({ success: false, error: 'RFQ ID is required' }, 400);
    }

    // Check if RFQ exists
    const rfq = await db.prepare(
      'SELECT id FROM rfq_submissions WHERE id = ?'
    ).bind(body.rfq_id).first();

    if (!rfq) {
      return c.json({ success: false, error: 'RFQ not found' }, 404);
    }

    // Generate quote ID
    const quoteId = generateId('QT');
    const now = getTimestamp();
    
    // Calculate valid_until based on validity_days
    const validityDays = body.validity_days || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    const validUntilStr = validUntil.toISOString().split('T')[0];

    // Calculate total from items
    const items = body.items || [];
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += (item.quantity || 1) * (item.unit_price || 0);
    }

    // Insert quote
    await db.prepare(`
      INSERT INTO quotes (
        id, rfq_id, amount, currency, validity_days, valid_until,
        terms, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      quoteId,
      body.rfq_id,
      totalAmount,
      body.currency || 'USD',
      validityDays,
      validUntilStr,
      body.terms || null,
      'draft',
      body.notes || null,
      now,
      now
    ).run();

    // Insert quote items
    for (const item of items) {
      const itemId = generateId('QI');
      const totalPrice = (item.quantity || 1) * (item.unit_price || 0);
      
      await db.prepare(`
        INSERT INTO quote_items (
          id, quote_id, product_id, description, quantity, unit_price, total_price, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        itemId,
        quoteId,
        item.product_id || null,
        item.description || '',
        item.quantity || 1,
        item.unit_price || 0,
        totalPrice,
        now
      ).run();
    }

    // Fetch created quote with customer info
    const quote = await db.prepare(`
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes,
        q.created_at, q.updated_at, q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
      WHERE q.id = ?
    `).bind(quoteId).first();

    // Fetch items
    const itemsResult = await db.prepare(`
      SELECT qi.*, p.name as product_name
      FROM quote_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quote_id = ?
      ORDER BY qi.created_at
    `).bind(quoteId).all();

    (quote as any).items = itemsResult.results || [];

    // Log action
    const caller = c.get('user');
    await logAction(c.env, db, caller?.userId ?? null, 'quote.created', 'quote', quoteId, { 
      rfq_id: body.rfq_id, 
      amount: totalAmount 
    });

    return c.json({ success: true, data: quote }, 201);
  } catch (error) {
    console.error('Error creating quote:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

/**
 * PATCH /api/quotes/:id/status - Update quote status
 * Admin only
 */
quotes.patch('/:id/status', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');
    const body = await c.req.json();
    const newStatus = body.status;

    // Validate status
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(newStatus)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }

    // Check if quote exists
    const existingQuote = await db.prepare(
      'SELECT * FROM quotes WHERE id = ?'
    ).bind(quoteId).first();

    if (!existingQuote) {
      return c.json({ success: false, error: 'Quote not found' }, 404);
    }

    const now = getTimestamp();
    const updates: string[] = ['status = ?', 'updated_at = ?'];
    const values: any[] = [newStatus, now];

    // Set timestamp based on status
    if (newStatus === 'sent') {
      updates.push('sent_at = ?');
      values.push(now);
    } else if (newStatus === 'accepted') {
      updates.push('accepted_at = ?');
      values.push(now);
    } else if (newStatus === 'rejected') {
      updates.push('rejected_at = ?');
      values.push(now);
    }

    values.push(quoteId);

    await db.prepare(
      `UPDATE quotes SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Update RFQ status if quote is accepted
    if (newStatus === 'accepted') {
      await db.prepare(
        `UPDATE rfq_submissions SET status = 'accepted', updated_at = ? WHERE id = ?`
      ).bind(now, (existingQuote as any).rfq_id).run();
    }

    // Fetch updated quote
    const quote = await db.prepare(`
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes,
        q.created_at, q.updated_at, q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
      WHERE q.id = ?
    `).bind(quoteId).first();

    // Fetch items
    const itemsResult = await db.prepare(`
      SELECT qi.*, p.name as product_name
      FROM quote_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quote_id = ?
      ORDER BY qi.created_at
    `).bind(quoteId).all();

    (quote as any).items = itemsResult.results || [];

    // Log action
    const caller = c.get('user');
    await logAction(c.env, db, caller?.userId ?? null, `quote.${newStatus}`, 'quote', quoteId, { 
      previous_status: (existingQuote as any).status,
      new_status: newStatus
    });

    return c.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error updating quote status:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

/**
 * DELETE /api/quotes/:id - Delete quote
 * Admin only
 */
quotes.delete('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');

    // Check if quote exists
    const quote = await db.prepare(
      'SELECT * FROM quotes WHERE id = ?'
    ).bind(quoteId).first();

    if (!quote) {
      return c.json({ success: false, error: 'Quote not found' }, 404);
    }

    // Delete quote items first (cascade should handle this, but explicit is safer)
    await db.prepare(
      'DELETE FROM quote_items WHERE quote_id = ?'
    ).bind(quoteId).run();

    // Delete quote
    await db.prepare(
      'DELETE FROM quotes WHERE id = ?'
    ).bind(quoteId).run();

    // Log action
    const caller = c.get('user');
    await logAction(c.env, db, caller?.userId ?? null, 'quote.deleted', 'quote', quoteId, { 
      rfq_id: (quote as any).rfq_id 
    });

    return c.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export default quotes;
