import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const analytics = new Hono<{ Bindings: Env }>();

// All analytics routes require auth
analytics.use('*', authMiddleware);

/**
 * GET /api/analytics/overview
 * Key metrics: total leads, revenue, conversion rate, active products
 */
analytics.get('/overview', async (c) => {
  const db = c.env.DB;

  const [
    leadsResult,
    revenueResult,
    conversionResult,
    productsResult,
    rfqResult,
  ] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as total FROM leads`).first<{ total: number }>(),
    db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM quotes WHERE status = 'accepted'`).first<{ total: number }>(),
    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won
      FROM leads
    `).first<{ total: number; won: number }>(),
    db.prepare(`SELECT COUNT(*) as total FROM products WHERE in_stock = 1`).first<{ total: number }>(),
    db.prepare(`SELECT COUNT(*) as total FROM rfq_submissions`).first<{ total: number }>(),
  ]);

  const totalLeads = leadsResult?.total ?? 0;
  const wonLeads = conversionResult?.won ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100 * 100) / 100 : 0;

  return c.json({
    overview: {
      total_leads: totalLeads,
      total_revenue: revenueResult?.total ?? 0,
      conversion_rate: conversionRate,
      active_products: productsResult?.total ?? 0,
      total_rfqs: rfqResult?.total ?? 0,
      won_leads: wonLeads,
    },
  });
});

/**
 * GET /api/analytics/leads
 * Leads breakdown by status, source, and recent trend
 */
analytics.get('/leads', async (c) => {
  const db = c.env.DB;

  const [byStatus, bySource, recentLeads] = await Promise.all([
    db.prepare(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
      ORDER BY count DESC
    `).all<{ status: string; count: number }>(),

    db.prepare(`
      SELECT
        COALESCE(source, 'unknown') as source,
        COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `).all<{ source: string; count: number }>(),

    db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all<{ date: string; count: number }>(),
  ]);

  return c.json({
    leads: {
      by_status: byStatus.results,
      by_source: bySource.results,
      trend_30d: recentLeads.results,
    },
  });
});

/**
 * GET /api/analytics/revenue
 * Revenue data from accepted quotes
 */
analytics.get('/revenue', async (c) => {
  const db = c.env.DB;

  const [monthly, byCurrency, summary] = await Promise.all([
    db.prepare(`
      SELECT
        STRFTIME('%Y-%m', accepted_at) as month,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as count
      FROM quotes
      WHERE status = 'accepted' AND accepted_at IS NOT NULL
      GROUP BY STRFTIME('%Y-%m', accepted_at)
      ORDER BY month ASC
    `).all<{ month: string; revenue: number; count: number }>(),

    db.prepare(`
      SELECT
        currency,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as count
      FROM quotes
      WHERE status = 'accepted'
      GROUP BY currency
      ORDER BY total DESC
    `).all<{ currency: string; total: number; count: number }>(),

    db.prepare(`
      SELECT
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(AVG(amount), 0) as avg_deal_size,
        COUNT(*) as total_deals
      FROM quotes
      WHERE status = 'accepted'
    `).first<{ total_revenue: number; avg_deal_size: number; total_deals: number }>(),
  ]);

  return c.json({
    revenue: {
      monthly_trend: monthly.results,
      by_currency: byCurrency.results,
      total_revenue: summary?.total_revenue ?? 0,
      avg_deal_size: Math.round((summary?.avg_deal_size ?? 0) * 100) / 100,
      total_deals: summary?.total_deals ?? 0,
    },
  });
});

/**
 * GET /api/analytics/conversion
 * Conversion funnel: leads → rfq → quoted → accepted
 */
analytics.get('/conversion', async (c) => {
  const db = c.env.DB;

  const [leadFunnel, quoteFunnel, overallRate] = await Promise.all([
    db.prepare(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `).all<{ status: string; count: number }>(),

    db.prepare(`
      SELECT status, COUNT(*) as count
      FROM quotes
      GROUP BY status
    `).all<{ status: string; count: number }>(),

    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won
      FROM leads
    `).first<{ total: number; won: number }>(),
  ]);

  const total = overallRate?.total ?? 0;
  const won = overallRate?.won ?? 0;
  const rate = total > 0 ? Math.round((won / total) * 100 * 100) / 100 : 0;

  // Build status maps
  const leadStatusMap: Record<string, number> = {};
  for (const row of leadFunnel.results) {
    leadStatusMap[row.status] = row.count;
  }

  const quoteStatusMap: Record<string, number> = {};
  for (const row of quoteFunnel.results) {
    quoteStatusMap[row.status] = row.count;
  }

  return c.json({
    conversion: {
      overall_rate: rate,
      total_leads: total,
      won_leads: won,
      funnel: {
        new: leadStatusMap['new'] ?? 0,
        qualified: leadStatusMap['qualified'] ?? 0,
        rfq: leadStatusMap['rfq'] ?? 0,
        quoted: leadStatusMap['quoted'] ?? 0,
        won: leadStatusMap['won'] ?? 0,
        lost: leadStatusMap['lost'] ?? 0,
      },
      quotes: {
        draft: quoteStatusMap['draft'] ?? 0,
        sent: quoteStatusMap['sent'] ?? 0,
        accepted: quoteStatusMap['accepted'] ?? 0,
        rejected: quoteStatusMap['rejected'] ?? 0,
        expired: quoteStatusMap['expired'] ?? 0,
      },
    },
  });
});

/**
 * GET /api/analytics/top-products
 * Products most frequently quoted / ordered
 */
analytics.get('/top-products', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') ?? '10', 10);

  const result = await db.prepare(`
    SELECT
      p.id,
      p.name,
      p.category,
      p.price,
      COUNT(qi.id) as quote_count,
      COALESCE(SUM(qi.quantity), 0) as total_quantity,
      COALESCE(SUM(qi.total_price), 0) as total_value
    FROM products p
    LEFT JOIN quote_items qi ON qi.product_id = p.id
    LEFT JOIN quotes q ON q.id = qi.quote_id AND q.status = 'accepted'
    GROUP BY p.id
    ORDER BY total_value DESC, quote_count DESC
    LIMIT ?
  `).bind(limit).all<{
    id: string;
    name: string;
    category: string;
    price: number;
    quote_count: number;
    total_quantity: number;
    total_value: number;
  }>();

  return c.json({
    top_products: result.results,
  });
});

/**
 * GET /api/analytics/top-dealers
 * Top dealers/users by won leads and revenue
 */
analytics.get('/top-dealers', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') ?? '10', 10);

  const result = await db.prepare(`
    SELECT
      u.id,
      u.name,
      u.email,
      COUNT(l.id) as total_leads,
      SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END) as won_leads,
      COALESCE(SUM(CASE WHEN l.status = 'won' THEN l.estimated_value ELSE 0 END), 0) as estimated_revenue,
      CASE
        WHEN COUNT(l.id) > 0
        THEN ROUND(CAST(SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END) AS REAL) / COUNT(l.id) * 100, 2)
        ELSE 0
      END as win_rate
    FROM users u
    LEFT JOIN leads l ON l.assigned_to = u.id
    GROUP BY u.id
    ORDER BY won_leads DESC, estimated_revenue DESC
    LIMIT ?
  `).bind(limit).all<{
    id: string;
    name: string;
    email: string;
    total_leads: number;
    won_leads: number;
    estimated_revenue: number;
    win_rate: number;
  }>();

  return c.json({
    top_dealers: result.results,
  });
});

export default analytics;
