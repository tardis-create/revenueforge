import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { createEmailRoutes } from '../../../lib/email/routes'

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'RevenueForge API v1' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/contact', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, company, message } = body

    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400)
    }

    console.log('Contact form submission:', { name, email, company, message })

    return c.json({
      success: true,
      message: "Thank you for contacting us. We'll be in touch soon.",
    })
  } catch {
    return c.json({ error: 'Failed to process contact form' }, 500)
  }
})

// ─── Email Automation Routes ─────────────────────────────────────────────────
// Mounted at /api/email/*
// Routes:
//   GET    /api/email/templates              - List all templates
//   GET    /api/email/templates/:id          - Get template
//   GET    /api/email/templates/:id/preview  - Preview with sample data
//   POST   /api/email/templates              - Create template
//   PUT    /api/email/templates/:id          - Update template
//   DELETE /api/email/templates/:id          - Delete template
//   GET    /api/email/queue                  - List queue items
//   POST   /api/email/queue/send             - Send direct email
//   POST   /api/email/queue/send-template    - Queue email from template
//   POST   /api/email/queue/process          - Process pending queue
//   DELETE /api/email/queue/:id              - Cancel queued email
//   POST   /api/email/trigger               - Trigger email by event
//   GET    /api/email/logs                   - Email send logs
//   GET    /api/email/stats                  - Email system stats
app.route('/email', createEmailRoutes())

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
