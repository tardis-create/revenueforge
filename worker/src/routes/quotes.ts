import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const quotes = new Hono<{ Bindings: Env }>();

// All quote routes require authentication
quotes.use('*', authMiddleware);

// ─── Validation ──────────────────────────────────────────────────────────────

function validateQuoteInput(data: any, partial = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partial || data.rfq_id !== undefined) {
    if (!data.rfq_id || typeof data.rfq_id !== 'string') {
      errors.push('rfq_id is required and must be a string');
    }
  }

  if (!partial || data.amount !== undefined) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('amount must be a non-negative number');
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (data.validity_days !== undefined) {
    const days = parseInt(data.validity_days);
    if (isNaN(days) || days < 1 || days > 365) {
      errors.push('validity_days must be a number between 1 and 365');
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateQuoteItemInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.product_id || typeof data.product_id !== 'string') {
    errors.push('product_id is required');
  }

  if (data.quantity !== undefined) {
    const qty = parseInt(data.quantity);
    if (isNaN(qty) || qty < 1) {
      errors.push('quantity must be a positive integer');
    }
  }

  if (data.unit_price !== undefined) {
    const price = parseFloat(data.unit_price);
    if (isNaN(price) || price < 0) {
      errors.push('unit_price must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Quote CRUD ─────────────────────────────────────────────────────────────

/**
 * GET /api/quotes - List all quotes (admin only)
 */
quotes.get('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = `
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes, q.created_at, q.updated_at,
        q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
    `;
    const params: any[] = [];

    if (status) {
      query += ' WHERE q.status = ?';
      params.push(status);
    }

    query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM quotes WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM quotes';
    const countParams = status ? [status] : [];

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    // Get quote items for each quote
    const quotesWithItems = await Promise.all(
      (rows.results || []).map(async (quote: any) => {
        const items = await db
          .prepare('SELECT * FROM quote_items WHERE quote_id = ?')
          .bind(quote.id)
          .all();
        
        // Calculate totals
        const subtotal = (items.results || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
        const taxRate = 18; // Default tax rate
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        return {
          ...quote,
          contact_person: quote.contact_name,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          items: items.results || [],
        };
      })
    );

    return c.json({
      data: quotesWithItems,
      pagination: {
        page,
        limit,
        total: countRow?.total ?? 0,
        pages: Math.ceil((countRow?.total ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/quotes error:', err);
    return c.json({ error: 'Failed to fetch quotes' }, 500);
  }
});

/**
 * GET /api/quotes/:id - Get single quote with items
 */
quotes.get('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    const quote = await db.prepare(`
      SELECT 
        q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
        q.terms, q.status, q.pdf_url, q.notes, q.created_at, q.updated_at,
        q.sent_at, q.accepted_at, q.rejected_at,
        r.company_name, r.contact_name, r.email, r.phone
      FROM quotes q
      LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
      WHERE q.id = ?
    `).bind(id).first();

    if (!quote) return c.json({ error: 'Quote not found' }, 404);

    // Get quote items
    const items = await db
      .prepare('SELECT * FROM quote_items WHERE quote_id = ?')
      .bind(id)
      .all();

    // Calculate totals
    const subtotal = (items.results || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
    const taxRate = 18;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return c.json({
      data: {
        ...quote,
        contact_person: (quote as any).contact_name,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        items: items.results || [],
      },
    });
  } catch (err) {
    console.error('GET /api/quotes/:id error:', err);
    return c.json({ error: 'Failed to fetch quote' }, 500);
  }
});

/**
 * POST /api/quotes - Create a new quote (admin only)
 */
quotes.post('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { valid, errors } = validateQuoteInput(body);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const id = generateId();
    const now = getTimestamp();
    const validityDays = parseInt(body.validity_days || '30');
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    await db.prepare(`
      INSERT INTO quotes (id, rfq_id, amount, currency, validity_days, valid_until, terms, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.rfq_id,
      parseFloat(body.amount) || 0,
      body.currency || 'USD',
      validityDays,
      validUntil.toISOString().split('T')[0],
      body.terms || null,
      body.status || 'draft',
      body.notes || null,
      now,
      now
    ).run();

    // Insert quote items if provided
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        const itemId = generateId();
        const quantity = parseInt(item.quantity || 1);
        const unitPrice = parseFloat(item.unit_price || 0);
        const totalPrice = quantity * unitPrice;

        await db.prepare(`
          INSERT INTO quote_items (id, quote_id, product_id, description, quantity, unit_price, total_price, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          itemId,
          id,
          item.product_id || null,
          item.description || item.product_name || '',
          quantity,
          unitPrice,
          totalPrice,
          now
        ).run();
      }
    }

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    return c.json({ data: quote }, 201);
  } catch (err: any) {
    console.error('POST /api/quotes error:', err);
    return c.json({ error: 'Failed to create quote' }, 500);
  }
});

/**
 * PUT /api/quotes/:id - Update quote (admin only)
 */
quotes.put('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Quote not found' }, 404);

    const { valid, errors } = validateQuoteInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body };

    // Handle status changes
    let sentAt = (existing as any).sent_at;
    let acceptedAt = (existing as any).accepted_at;
    let rejectedAt = (existing as any).rejected_at;

    if (body.status === 'sent' && existing.status !== 'sent') {
      sentAt = now;
    } else if (body.status === 'accepted' && existing.status !== 'accepted') {
      acceptedAt = now;
    } else if (body.status === 'rejected' && existing.status !== 'rejected') {
      rejectedAt = now;
    }

    await db.prepare(`
      UPDATE quotes SET 
        rfq_id=?, amount=?, currency=?, validity_days=?, valid_until=?, 
        terms=?, status=?, pdf_url=?, notes=?, 
        sent_at=?, accepted_at=?, rejected_at=?,
        updated_at=?
      WHERE id=?
    `).bind(
      merged.rfq_id,
      parseFloat(merged.amount),
      merged.currency,
      merged.validity_days,
      merged.valid_until,
      merged.terms,
      merged.status,
      merged.pdf_url ?? null,
      merged.notes ?? null,
      sentAt,
      acceptedAt,
      rejectedAt,
      now,
      id
    ).run();

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    return c.json({ data: quote });
  } catch (err) {
    console.error('PUT /api/quotes/:id error:', err);
    return c.json({ error: 'Failed to update quote' }, 500);
  }
});

/**
 * PATCH /api/quotes/:id - Partial update quote (admin only)
 */
quotes.patch('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Quote not found' }, 404);

    const { valid, errors } = validateQuoteInput(body, true);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const now = getTimestamp();
    const merged = { ...existing, ...body };

    await db.prepare(`
      UPDATE quotes SET 
        rfq_id=?, amount=?, currency=?, validity_days=?, valid_until=?, 
        terms=?, status=?, pdf_url=?, notes=?, updated_at=?
      WHERE id=?
    `).bind(
      merged.rfq_id,
      parseFloat(merged.amount),
      merged.currency,
      merged.validity_days,
      merged.valid_until,
      merged.terms,
      merged.status,
      merged.pdf_url ?? null,
      merged.notes ?? null,
      now,
      id
    ).run();

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    return c.json({ data: quote });
  } catch (err) {
    console.error('PATCH /api/quotes/:id error:', err);
    return c.json({ error: 'Failed to update quote' }, 500);
  }
});

/**
 * DELETE /api/quotes/:id - Delete quote (admin only)
 */
quotes.delete('/:id', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    const existing = await db.prepare('SELECT id FROM quotes WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Quote not found' }, 404);

    await db.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run();
    return c.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/quotes/:id error:', err);
    return c.json({ error: 'Failed to delete quote' }, 500);
  }
});

// ─── Quote Items ─────────────────────────────────────────────────────────────

/**
 * GET /api/quotes/:id/items - Get quote items
 */
quotes.get('/:id/items', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');

    const quote = await db.prepare('SELECT id FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!quote) return c.json({ error: 'Quote not found' }, 404);

    const items = await db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').bind(quoteId).all();
    return c.json({ data: items.results || [] });
  } catch (err) {
    console.error('GET /api/quotes/:id/items error:', err);
    return c.json({ error: 'Failed to fetch quote items' }, 500);
  }
});

/**
 * POST /api/quotes/:id/items - Add item to quote
 */
quotes.post('/:id/items', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');
    const body = await c.req.json();

    const quote = await db.prepare('SELECT id FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!quote) return c.json({ error: 'Quote not found' }, 404);

    const { valid, errors } = validateQuoteItemInput(body);
    if (!valid) return c.json({ error: 'Validation failed', details: errors }, 422);

    const id = generateId();
    const now = getTimestamp();
    const quantity = parseInt(body.quantity || 1);
    const unitPrice = parseFloat(body.unit_price || 0);
    const totalPrice = quantity * unitPrice;

    await db.prepare(`
      INSERT INTO quote_items (id, quote_id, product_id, description, quantity, unit_price, total_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      quoteId,
      body.product_id,
      body.description || '',
      quantity,
      unitPrice,
      totalPrice,
      now
    ).run();

    const item = await db.prepare('SELECT * FROM quote_items WHERE id = ?').bind(id).first();
    return c.json({ data: item }, 201);
  } catch (err) {
    console.error('POST /api/quotes/:id/items error:', err);
    return c.json({ error: 'Failed to add quote item' }, 500);
  }
});

/**
 * DELETE /api/quotes/:id/items/:itemId - Remove item from quote
 */
quotes.delete('/:id/items/:itemId', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');
    const itemId = c.req.param('itemId');

    const existing = await db
      .prepare('SELECT id FROM quote_items WHERE id = ? AND quote_id = ?')
      .bind(itemId, quoteId)
      .first();
    if (!existing) return c.json({ error: 'Quote item not found' }, 404);

    await db.prepare('DELETE FROM quote_items WHERE id = ?').bind(itemId).run();
    return c.json({ message: 'Quote item deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/quotes/:id/items/:itemId error:', err);
    return c.json({ error: 'Failed to delete quote item' }, 500);
  }
});

export default quotes;
