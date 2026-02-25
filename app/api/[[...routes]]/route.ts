import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { nanoid } from 'nanoid'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

// Root endpoint
app.get('/', (c) => {
  return c.json({ message: 'RevenueForge API v1' })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== LEADS ====================

// GET /api/leads - List all leads
app.get('/leads', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM leads ORDER BY created_at DESC'
    ).all()
    return c.json({ leads: results })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return c.json({ error: 'Failed to fetch leads' }, 500)
  }
})

// GET /api/leads/:id - Get single lead
app.get('/leads/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const lead = await c.env.DB.prepare(
      'SELECT * FROM leads WHERE id = ?'
    ).bind(id).first()

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    return c.json({ lead })
  } catch (error) {
    console.error('Error fetching lead:', error)
    return c.json({ error: 'Failed to fetch lead' }, 500)
  }
})

// POST /api/leads - Create lead
app.post('/leads', async (c) => {
  try {
    const body = await c.req.json()
    const id = nanoid()
    const now = new Date().toISOString()

    const {
      company_name,
      contact_name,
      email,
      phone,
      status = 'new',
      assigned_to,
      source,
      estimated_value = 0,
      notes
    } = body

    // Validate required fields
    if (!company_name) {
      return c.json({ error: 'company_name is required' }, 400)
    }

    // Validate status
    const validStatuses = ['new', 'qualified', 'rfq', 'quoted', 'won', 'lost']
    if (!validStatuses.includes(status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO leads (id, company_name, contact_name, email, phone, status, assigned_to, source, estimated_value, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, company_name, contact_name, email, phone, status, assigned_to, source, estimated_value, notes, now, now
    ).run()

    const lead = await c.env.DB.prepare(
      'SELECT * FROM leads WHERE id = ?'
    ).bind(id).first()

    return c.json({ lead }, 201)
  } catch (error) {
    console.error('Error creating lead:', error)
    return c.json({ error: 'Failed to create lead' }, 500)
  }
})

// PATCH /api/leads/:id - Update lead
app.patch('/leads/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json()
    const now = new Date().toISOString()

    // Check if lead exists
    const existing = await c.env.DB.prepare(
      'SELECT * FROM leads WHERE id = ?'
    ).bind(id).first()

    if (!existing) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['new', 'qualified', 'rfq', 'quoted', 'won', 'lost']
      if (!validStatuses.includes(body.status)) {
        return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400)
      }

      // Validate status transitions
      const currentStatus = (existing as any).status
      const validTransitions: Record<string, string[]> = {
        'new': ['qualified'],
        'qualified': ['rfq'],
        'rfq': ['quoted'],
        'quoted': ['won', 'lost'],
        'won': [],
        'lost': []
      }

      if (!validTransitions[currentStatus]?.includes(body.status)) {
        // Allow if it's the same status or if it's a valid transition
        if (currentStatus !== body.status && validTransitions[currentStatus]?.length > 0) {
          return c.json({
            error: `Invalid transition from ${currentStatus} to ${body.status}`,
            hint: `Valid transitions: ${validTransitions[currentStatus].join(', ')}`
          }, 400)
        }
      }
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []

    const fields = ['company_name', 'contact_name', 'email', 'phone', 'status', 'assigned_to', 'source', 'estimated_value', 'notes']

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(body[field])
      }
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400)
    }

    updates.push('updated_at = ?')
    values.push(now)
    values.push(id)

    await c.env.DB.prepare(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    const lead = await c.env.DB.prepare(
      'SELECT * FROM leads WHERE id = ?'
    ).bind(id).first()

    return c.json({ lead })
  } catch (error) {
    console.error('Error updating lead:', error)
    return c.json({ error: 'Failed to update lead' }, 500)
  }
})

// ==================== LEAD ACTIVITIES ====================

// GET /api/leads/:id/activities - Get activities for a lead
app.get('/leads/:id/activities', async (c) => {
  const leadId = c.req.param('id')

  try {
    // Verify lead exists
    const lead = await c.env.DB.prepare(
      'SELECT id FROM leads WHERE id = ?'
    ).bind(leadId).first()

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC'
    ).bind(leadId).all()

    return c.json({ activities: results })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return c.json({ error: 'Failed to fetch activities' }, 500)
  }
})

// POST /api/leads/:id/activities - Log activity for a lead
app.post('/leads/:id/activities', async (c) => {
  const leadId = c.req.param('id')

  try {
    // Verify lead exists
    const lead = await c.env.DB.prepare(
      'SELECT id FROM leads WHERE id = ?'
    ).bind(leadId).first()

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    const body = await c.req.json()
    const id = nanoid()
    const now = new Date().toISOString()

    const { type, description, created_by } = body

    if (!type) {
      return c.json({ error: 'type is required' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO lead_activities (id, lead_id, type, description, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, leadId, type, description, now, created_by).run()

    const activity = await c.env.DB.prepare(
      'SELECT * FROM lead_activities WHERE id = ?'
    ).bind(id).first()

    return c.json({ activity }, 201)
  } catch (error) {
    console.error('Error creating activity:', error)
    return c.json({ error: 'Failed to create activity' }, 500)
  }
})

// ==================== FOLLOW-UPS ====================

// GET /api/leads/:id/follow-ups - Get follow-ups for a lead
app.get('/leads/:id/follow-ups', async (c) => {
  const leadId = c.req.param('id')

  try {
    // Verify lead exists
    const lead = await c.env.DB.prepare(
      'SELECT id FROM leads WHERE id = ?'
    ).bind(leadId).first()

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM follow_ups WHERE lead_id = ? ORDER BY scheduled_at ASC'
    ).bind(leadId).all()

    return c.json({ follow_ups: results })
  } catch (error) {
    console.error('Error fetching follow-ups:', error)
    return c.json({ error: 'Failed to fetch follow-ups' }, 500)
  }
})

// POST /api/leads/:id/follow-ups - Create follow-up for a lead
app.post('/leads/:id/follow-ups', async (c) => {
  const leadId = c.req.param('id')

  try {
    // Verify lead exists
    const lead = await c.env.DB.prepare(
      'SELECT id FROM leads WHERE id = ?'
    ).bind(leadId).first()

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404)
    }

    const body = await c.req.json()
    const id = nanoid()

    const { scheduled_at, notes } = body

    if (!scheduled_at) {
      return c.json({ error: 'scheduled_at is required' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO follow_ups (id, lead_id, scheduled_at, notes, completed, completed_at)
       VALUES (?, ?, ?, ?, 0, NULL)`
    ).bind(id, leadId, scheduled_at, notes).run()

    const followUp = await c.env.DB.prepare(
      'SELECT * FROM follow_ups WHERE id = ?'
    ).bind(id).first()

    return c.json({ follow_up: followUp }, 201)
  } catch (error) {
    console.error('Error creating follow-up:', error)
    return c.json({ error: 'Failed to create follow-up' }, 500)
  }
})

// PATCH /api/follow-ups/:id - Mark follow-up as completed
app.patch('/follow-ups/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json()

    const followUp = await c.env.DB.prepare(
      'SELECT * FROM follow_ups WHERE id = ?'
    ).bind(id).first()

    if (!followUp) {
      return c.json({ error: 'Follow-up not found' }, 404)
    }

    const updates: string[] = []
    const values: any[] = []

    if (body.completed !== undefined) {
      updates.push('completed = ?')
      values.push(body.completed ? 1 : 0)

      if (body.completed) {
        updates.push('completed_at = ?')
        values.push(new Date().toISOString())
      } else {
        updates.push('completed_at = NULL')
      }
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?')
      values.push(body.notes)
    }

    if (body.scheduled_at !== undefined) {
      updates.push('scheduled_at = ?')
      values.push(body.scheduled_at)
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400)
    }

    values.push(id)

    await c.env.DB.prepare(
      `UPDATE follow_ups SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    const updated = await c.env.DB.prepare(
      'SELECT * FROM follow_ups WHERE id = ?'
    ).bind(id).first()

    return c.json({ follow_up: updated })
  } catch (error) {
    console.error('Error updating follow-up:', error)
    return c.json({ error: 'Failed to update follow-up' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
