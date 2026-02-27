/**
 * Auth API Entry Point
 * Redirects to the dedicated Cloudflare Worker API
 */

export const runtime = 'edge'

export async function GET() {
  return Response.json({ 
    message: 'Auth API',
    note: 'Auth routes have been moved to the dedicated Worker',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev/auth'
  })
}

export async function POST() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev/auth'
  }, { status: 301 })
}

export async function PUT() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev/auth'
  }, { status: 301 })
}

export async function DELETE() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev/auth'
  }, { status: 301 })
}

export async function PATCH() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev/auth'
  }, { status: 301 })
}
