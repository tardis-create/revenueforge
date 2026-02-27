import { NextRequest } from 'next/server'

export const runtime = 'edge'

interface Env {
  DB: D1Database
  KV: KVNamespace
}

interface Setting {
  key: string
  value: string
  category: string
  is_public: number
  updated_at: string
  updated_by?: string
}

// Cache settings in KV for 5 minutes
const CACHE_TTL = 300
const CACHE_KEY = 'settings:public'

/**
 * GET /api/settings
 * Returns all settings (public subset for theme by default, full for admin)
 */
export async function GET(request: NextRequest) {
  const env = process.env as unknown as Env
  
  // Check if admin wants full settings (via Authorization header)
  const authHeader = request.headers.get('Authorization')
  const isAdmin = authHeader?.startsWith('Bearer ')
  
  try {
    if (!isAdmin) {
      // Public endpoint - try KV cache first
      const cached = await env.KV.get(CACHE_KEY, 'json')
      if (cached) {
        return Response.json({ settings: cached, cached: true })
      }
      
      // Fetch public settings from D1
      const publicSettings = await env.DB.prepare(
        'SELECT key, value, category FROM settings WHERE is_public = 1'
      ).all<Setting>()
      
      const settingsMap = publicSettings.results.reduce((acc, setting) => {
        try {
          acc[setting.key] = JSON.parse(setting.value)
        } catch {
          acc[setting.key] = setting.value
        }
        return acc
      }, {} as Record<string, unknown>)
      
      // Cache in KV
      await env.KV.put(CACHE_KEY, JSON.stringify(settingsMap), {
        expirationTtl: CACHE_TTL
      })
      
      return Response.json({ settings: settingsMap, cached: false })
    }
    
    // Admin endpoint - return all settings
    // TODO: Add proper JWT validation
    const allSettings = await env.DB.prepare(
      'SELECT key, value, category, is_public, updated_at, updated_by FROM settings ORDER BY category, key'
    ).all<Setting>()
    
    const settingsMap = allSettings.results.reduce((acc, setting) => {
      try {
        acc[setting.key] = {
          value: JSON.parse(setting.value),
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        }
      } catch {
        acc[setting.key] = {
          value: setting.value,
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        }
      }
      return acc
    }, {} as Record<string, unknown>)
    
    return Response.json({ settings: settingsMap })
    
  } catch (error) {
    console.error('Error fetching settings:', error)
    return Response.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/settings
 * Updates settings (admin only)
 */
export async function PATCH(request: NextRequest) {
  const env = process.env as unknown as Env
  
  // Check authorization
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // TODO: Add proper JWT validation and extract user info
  const userId = 'admin' // Placeholder
  
  try {
    const body = await request.json() as { settings?: Record<string, unknown> }
    const updates = body.settings
    
    if (!updates || typeof updates !== 'object') {
      return Response.json(
        { error: 'Invalid request', message: 'settings object is required' },
        { status: 400 }
      )
    }
    
    // Validate allowed settings
    // FIX: Added missing font_heading, font_body, background_color to whitelist
    const allowedSettings = [
      'company_name', 'logo_url', 'primary_color', 'accent_color', 'tagline',
      'address', 'phone', 'email',
      'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from',
      'feature_dealer_portal', 'feature_analytics', 'feature_rfq_form',
      // FIX: Added missing theme-related settings
      'font_heading', 'font_body', 'background_color'
    ]
    
    const invalidKeys = Object.keys(updates).filter(key => !allowedSettings.includes(key))
    if (invalidKeys.length > 0) {
      return Response.json(
        { error: 'Invalid settings', message: `Unknown settings: ${invalidKeys.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Update settings in D1
    const timestamp = new Date().toISOString()
    const statements: D1PreparedStatement[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      const valueStr = JSON.stringify(value)
      statements.push(
        env.DB.prepare(
          'UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ?'
        ).bind(valueStr, timestamp, userId, key)
      )
    }
    
    await env.DB.batch(statements)
    
    // Invalidate KV cache
    await env.KV.delete(CACHE_KEY)
    
    // FIX: Dynamically build IN clause with proper parameterization
    // Previously: 'WHERE key IN (?)'.bind(Object.keys(updates).join(','))
    // That passed all keys as a single string like "key1,key2,key3"
    // Now: Build 'WHERE key IN (?, ?, ?)' with individual bindings
    const keys = Object.keys(updates)
    const placeholders = keys.map(() => '?').join(', ')
    const fetchQuery = `SELECT key, value, category, is_public, updated_at, updated_by FROM settings WHERE key IN (${placeholders})`
    
    const fetchStmt = env.DB.prepare(fetchQuery)
    const updatedSettings = await fetchStmt.bind(...keys).all<Setting>()
    
    const settingsMap = updatedSettings.results.reduce((acc, setting) => {
      try {
        acc[setting.key] = {
          value: JSON.parse(setting.value),
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        }
      } catch {
        acc[setting.key] = {
          value: setting.value,
          category: setting.category,
          is_public: setting.is_public === 1,
          updated_at: setting.updated_at,
          updated_by: setting.updated_by
        }
      }
      return acc
    }, {} as Record<string, unknown>)
    
    return Response.json({ 
      message: 'Settings updated successfully',
      settings: settingsMap 
    })
    
  } catch (error) {
    console.error('Error updating settings:', error)
    return Response.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
