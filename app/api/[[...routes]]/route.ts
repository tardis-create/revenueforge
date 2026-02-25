import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from 'hono/cors'
import type { Product, ProductInput, ProductFilters } from '../../../lib/types'
import { generateId, parseTechnicalSpecs, stringifyTechnicalSpecs } from '../../../lib/utils'

const app = new Hono().basePath('/api')

// Enable CORS
app.use('*', cors())

// In-memory product store (replace with D1 database in production)
// This is for demo purposes - in production, use Cloudflare D1
let products: Product[] = [
  {
    id: 'prod_001',
    name: 'Industrial Sensor Pro',
    sku: 'ISP-001',
    category: 'Sensors',
    industry: 'Manufacturing',
    description: 'High-precision industrial sensor for real-time monitoring',
    technical_specs: { accuracy: '0.01%', range: '-40C to 85C', connectivity: 'WiFi, Bluetooth' },
    price_range: '$500-$800',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_002',
    name: 'Smart Valve Controller',
    sku: 'SVC-002',
    category: 'Controllers',
    industry: 'Oil & Gas',
    description: 'Automated valve control system with remote monitoring',
    technical_specs: { pressure_rating: '3000 PSI', response_time: '<50ms', protocol: 'Modbus RTU' },
    price_range: '$1,200-$1,800',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_003',
    name: 'Pressure Gauge Digital',
    sku: 'PGD-003',
    category: 'Measurement',
    industry: 'Manufacturing',
    description: 'Digital pressure gauge with LCD display and data logging',
    technical_specs: { range: '0-1000 PSI', resolution: '0.1 PSI', memory: '1000 readings' },
    price_range: '$150-$300',
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_004',
    name: 'Flow Meter Ultrasonic',
    sku: 'FMU-004',
    category: 'Measurement',
    industry: 'Water Treatment',
    description: 'Non-invasive ultrasonic flow meter for liquids',
    technical_specs: { accuracy: '±1%', pipe_size: '0.5-4 inch', output: '4-20mA' },
    price_range: '$800-$1,500',
    image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_005',
    name: 'Safety Switch Emergency',
    sku: 'SSE-005',
    category: 'Safety',
    industry: 'All Industries',
    description: 'Emergency stop switch with lockout capability',
    technical_specs: { rating: 'IP67', contacts: '2NO+2NC', certification: 'CE, UL' },
    price_range: '$50-$120',
    image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_006',
    name: 'Temperature Controller',
    sku: 'TMC-006',
    category: 'Controllers',
    industry: 'Food & Beverage',
    description: 'PID temperature controller for process automation',
    technical_specs: { channels: '2', accuracy: '±0.1C', alarms: '4 programmable' },
    price_range: '$250-$450',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_007',
    name: 'Vibration Analyzer',
    sku: 'VBA-007',
    category: 'Analysis',
    industry: 'Manufacturing',
    description: 'Portable vibration analyzer for predictive maintenance',
    technical_specs: { frequency: '0-20kHz', channels: '4', battery: '8 hours' },
    price_range: '$2,500-$4,000',
    image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod_008',
    name: 'Level Sensor Radar',
    sku: 'LSR-008',
    category: 'Sensors',
    industry: 'Chemical',
    description: 'Radar level sensor for tanks and silos',
    technical_specs: { range: '0-30m', accuracy: '±3mm', output: '4-20mA, HART' },
    price_range: '$1,800-$2,500',
    image_url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// API Root
app.get('/', (c) => {
  return c.json({ message: 'RevenueForge API v1' })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get all products with filters
app.get('/products', (c) => {
  const search = c.req.query('search')?.toLowerCase()
  const category = c.req.query('category')
  const industry = c.req.query('industry')
  const is_active = c.req.query('is_active')

  let filtered = [...products]

  // Apply search filter
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    )
  }

  // Apply category filter
  if (category) {
    filtered = filtered.filter(p => p.category === category)
  }

  // Apply industry filter
  if (industry) {
    filtered = filtered.filter(p => p.industry === industry)
  }

  // Apply active status filter
  if (is_active !== undefined) {
    const activeBool = is_active === 'true'
    filtered = filtered.filter(p => p.is_active === activeBool)
  }

  return c.json({
    success: true,
    data: filtered,
    total: filtered.length,
  })
})

// Get single product by ID
app.get('/products/:id', (c) => {
  const id = c.req.param('id')
  const product = products.find(p => p.id === id)

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404)
  }

  return c.json({
    success: true,
    data: product,
  })
})

// Create new product (admin)
app.post('/products', async (c) => {
  try {
    const body = await c.req.json<ProductInput>()

    // Validate required fields
    if (!body.name || !body.sku || !body.category || !body.industry) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: name, sku, category, industry' 
      }, 400)
    }

    // Check for duplicate SKU
    if (products.some(p => p.sku === body.sku)) {
      return c.json({ 
        success: false, 
        error: 'Product with this SKU already exists' 
      }, 400)
    }

    const now = new Date().toISOString()
    const newProduct: Product = {
      id: generateId('prod'),
      name: body.name,
      sku: body.sku,
      category: body.category,
      industry: body.industry,
      description: body.description || null,
      technical_specs: body.technical_specs || null,
      price_range: body.price_range || null,
      image_url: body.image_url || null,
      is_active: body.is_active ?? true,
      created_at: now,
      updated_at: now,
    }

    products.push(newProduct)

    return c.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    }, 201)
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Invalid request body' 
    }, 400)
  }
})

// Update product (admin)
app.patch('/products/:id', async (c) => {
  const id = c.req.param('id')
  const index = products.findIndex(p => p.id === id)

  if (index === -1) {
    return c.json({ success: false, error: 'Product not found' }, 404)
  }

  try {
    const body = await c.req.json<Partial<ProductInput>>()

    // Check for duplicate SKU if changing
    if (body.sku && body.sku !== products[index].sku) {
      if (products.some(p => p.sku === body.sku)) {
        return c.json({ 
          success: false, 
          error: 'Product with this SKU already exists' 
        }, 400)
      }
    }

    const updatedProduct: Product = {
      ...products[index],
      ...(body.name && { name: body.name }),
      ...(body.sku && { sku: body.sku }),
      ...(body.category && { category: body.category }),
      ...(body.industry && { industry: body.industry }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.technical_specs !== undefined && { technical_specs: body.technical_specs }),
      ...(body.price_range !== undefined && { price_range: body.price_range }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      updated_at: new Date().toISOString(),
    }

    products[index] = updatedProduct

    return c.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Invalid request body' 
    }, 400)
  }
})

// Delete product (admin)
app.delete('/products/:id', (c) => {
  const id = c.req.param('id')
  const index = products.findIndex(p => p.id === id)

  if (index === -1) {
    return c.json({ success: false, error: 'Product not found' }, 404)
  }

  const deleted = products.splice(index, 1)[0]

  return c.json({
    success: true,
    data: deleted,
    message: 'Product deleted successfully',
  })
})

// Get categories
app.get('/categories', (c) => {
  const categories = [...new Set(products.map(p => p.category))]
  return c.json({
    success: true,
    data: categories,
  })
})

// Get industries
app.get('/industries', (c) => {
  const industries = [...new Set(products.map(p => p.industry))]
  return c.json({
    success: true,
    data: industries,
  })
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
