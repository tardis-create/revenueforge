import { Hono } from 'hono'
import { handle } from 'hono/vercel'

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
    
    // Validate required fields
    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400)
    }
    
    // In production, this would send an email or save to database
    // For now, just log and return success
    console.log('Contact form submission:', { name, email, company, message })
    
    return c.json({ 
      success: true, 
      message: 'Thank you for contacting us. We\'ll be in touch soon.' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to process contact form' }, 500)
  }
})

app.post('/rfq', async (c) => {
  try {
    const body = await c.req.json()
    // TODO: Store RFQ in D1 (rfq_submissions table) when D1 is configured
    // For now, return success response
    console.log('RFQ submission:', body)
    return c.json({ success: true, message: 'RFQ submitted' })
  } catch (error) {
    return c.json({ success: false, message: 'Invalid request body' }, 400)
  }
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
