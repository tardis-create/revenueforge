import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import type { Env } from '../types';

const settings = new Hono<{ Bindings: Env }>();

/**
 * GET /api/settings - Get all settings (public subset by default)
 * Authorization: optional for full settings (requires valid JWT)
 */
settings.get('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get('user');
    
    // If no valid JWT, return only public settings
    if (!user) {
      // Public endpoint - return public settings only
      const rows = await db.prepare(
        'SELECT key, value, category FROM settings WHERE is_public = 1'
      ).all<{ key: string; value: string; category: string }>();

      const settingsMap = rows.results.reduce((acc, setting) => {
        try {
          acc[setting.key] = JSON.parse(setting.value);
        } catch {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      return c.json({ success: true, settings: settingsMap });
    }

    // Admin endpoint - return all settings
    const rows = await db.prepare(
      'SELECT key, value, category, is_public, updated_at, updated_by FROM settings ORDER BY category, key'
    ).all<{ key: string; value: string; category: string; is_public: number; updated_at: string; updated_by?: string }>();

    const settingsMap = rows.results.reduce((acc, setting) => {
      try {
        acc[setting.key] = {
          value: JSON.parse(setting.value),
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        };
      } catch {
        acc[setting.key] = {
          value: setting.value,
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        };
      }
      return acc;
    }, {} as Record<string, unknown>);

    return c.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

/**
 * PATCH /api/settings - Update settings (admin only)
 */
settings.patch('/', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{ settings?: Record<string, unknown> }>();
    const updates = body.settings;

    if (!updates || typeof updates !== 'object') {
      return c.json({ success: false, error: 'settings object is required' }, 400);
    }

    const caller = c.get('user');
    const userId = caller?.userId ?? 'admin';
    const timestamp = new Date().toISOString();

    // Validate allowed settings
    const allowedSettings = [
      'company_name', 'logo_url', 'primary_color', 'accent_color', 'tagline',
      'address', 'phone', 'email', 'gst_number', 'signatory_name', 'signatory_designation',
      'quote_terms', 'invoice_terms',
      'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from',
      'feature_dealer_portal', 'feature_analytics', 'feature_rfq_form',
      'font_heading', 'font_body', 'background_color'
    ];

    const invalidKeys = Object.keys(updates).filter(key => !allowedSettings.includes(key));
    if (invalidKeys.length > 0) {
      return c.json({ success: false, error: `Unknown settings: ${invalidKeys.join(', ')}` }, 400);
    }

    // Update settings in D1
    for (const [key, value] of Object.entries(updates)) {
      const valueStr = JSON.stringify(value);
      
      // Check if setting exists
      const existing = await db.prepare(
        'SELECT key FROM settings WHERE key = ?'
      ).bind(key).first<{ key: string }>();

      if (existing) {
        await db.prepare(
          'UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ?'
        ).bind(valueStr, timestamp, userId, key).run();
      } else {
        // Determine category
        let category = 'general';
        if (['company_name', 'logo_url', 'primary_color', 'accent_color', 'tagline'].includes(key)) {
          category = 'branding';
        } else if (['address', 'phone', 'email', 'gst_number', 'signatory_name', 'signatory_designation'].includes(key)) {
          category = 'contact';
        } else if (['quote_terms', 'invoice_terms'].includes(key)) {
          category = 'terms';
        }

        await db.prepare(
          'INSERT INTO settings (key, value, category, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)'
        ).bind(key, valueStr, category, timestamp, userId).run();
      }
    }

    // Fetch updated settings
    const keys = Object.keys(updates);
    const placeholders = keys.map(() => '?').join(', ');
    const fetchQuery = `SELECT key, value, category, is_public, updated_at, updated_by FROM settings WHERE key IN (${placeholders})`;
    
    const rows = await db.prepare(fetchQuery).bind(...keys).all<{ key: string; value: string; category: string; is_public: number; updated_at: string; updated_by?: string }>();

    const settingsMap = rows.results.reduce((acc, setting) => {
      try {
        acc[setting.key] = {
          value: JSON.parse(setting.value),
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        };
      } catch {
        acc[setting.key] = {
          value: setting.value,
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        };
      }
      return acc;
    }, {} as Record<string, unknown>);

    return c.json({ success: true, message: 'Settings updated', settings: settingsMap });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export default settings;