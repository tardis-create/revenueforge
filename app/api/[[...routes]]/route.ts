export const runtime = 'edge'

import { Hono } from 'hono'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { D1Database } from '@cloudflare/workers-types'

type EnvBindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: EnvBindings }>().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'RevenueForge API v1' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Wrapper to convert Hono app to Next.js route handler format
// Uses getRequestContext() to access CF Pages env bindings
async function handler(request: Request): Promise<Response> {
  const { env, ctx } = getRequestContext()
  return app.fetch(request, env, ctx)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
