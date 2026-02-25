export const runtime = 'edge'

export async function GET() {
  return Response.json({ 
    message: 'RevenueForge API',
    note: 'API routes have been moved to the dedicated Worker',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  })
}

export async function POST() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  }, { status: 301 })
}

export async function PUT() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  }, { status: 301 })
}

export async function DELETE() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  }, { status: 301 })
}

export async function PATCH() {
  return Response.json({ 
    message: 'Use Worker API',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  }, { status: 301 })
}
