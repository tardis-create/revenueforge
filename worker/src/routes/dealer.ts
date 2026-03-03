import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env } from '../types';

const dealer = new Hono<{ Bindings: Env }>();

/**
 * GET /api/dealer/orders - List orders for the authenticated dealer
 */
dealer.get('/orders', authMiddleware, requireRole('dealer', 'admin'), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    const dealerId = user.userId;

    // Get dealer's ID if user is a dealer
    let actualDealerId = dealerId;
    if (user.role === 'dealer') {
      const dealerRecord = await db.prepare('SELECT id FROM dealers WHERE user_id = ?').bind(dealerId).first();
      if (dealerRecord) {
        actualDealerId = dealerRecord.id;
      }
    }

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = 'SELECT * FROM orders WHERE dealer_id = ?';
    const params: any[] = [actualDealerId];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countQuery = status && status !== 'all'
      ? 'SELECT COUNT(*) as total FROM orders WHERE dealer_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM orders WHERE dealer_id = ?';
    const countParams = status && status !== 'all' ? [actualDealerId, status] : [actualDealerId];

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    const total = countRow?.total ?? 0;

    return c.json({
      success: true,
      data: rows.results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/dealer/orders error:', err);
    return c.json({ success: false, error: 'Failed to fetch orders' }, 500);
  }
});

/**
 * GET /api/dealer/commissions - List commissions for the authenticated dealer
 */
dealer.get('/commissions', authMiddleware, requireRole('dealer', 'admin'), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    const dealerId = user.userId;

    // Get dealer's ID if user is a dealer
    let actualDealerId = dealerId;
    if (user.role === 'dealer') {
      const dealerRecord = await db.prepare('SELECT id FROM dealers WHERE user_id = ?').bind(dealerId).first();
      if (dealerRecord) {
        actualDealerId = dealerRecord.id;
      }
    }

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = c.req.query('status');

    let query = 'SELECT * FROM commissions WHERE dealer_id = ?';
    const params: any[] = [actualDealerId];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countQuery = status && status !== 'all'
      ? 'SELECT COUNT(*) as total FROM commissions WHERE dealer_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM commissions WHERE dealer_id = ?';
    const countParams = status && status !== 'all' ? [actualDealerId, status] : [actualDealerId];

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    const total = countRow?.total ?? 0;

    return c.json({
      success: true,
      data: rows.results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/dealer/commissions error:', err);
    return c.json({ success: false, error: 'Failed to fetch commissions' }, 500);
  }
});

export default dealer;
