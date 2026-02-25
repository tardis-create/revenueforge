export const runtime = 'edge'

export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Use Worker API: https://revenueforge-api.pronitopenclaw.workers.dev'
  })
}

export async function POST() {
  return Response.json({ 
    message: 'API moved to Worker',
    url: 'https://revenueforge-api.pronitopenclaw.workers.dev'
  }, { status: 301 })
}
