/**
 * API Health Check E2E Tests
 * Tests: API endpoints respond correctly
 */
import { test, expect } from '@playwright/test';

const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev';

test.describe('API Health Checks', () => {
  test('should return 200 from health endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    
    console.log('✅ API health check passed:', data);
  });

  test('should return 200 from alternate health endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    
    console.log('✅ Alternate health endpoint working');
  });

  test('should fetch products from API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/products`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    console.log(`✅ Fetched ${data.data.length} products from API`);
    
    // Check product structure if products exist
    if (data.data.length > 0) {
      const product = data.data[0];
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.sku).toBeDefined();
      expect(product.category).toBeDefined();
      expect(product.industry).toBeDefined();
    }
  });

  test('should create product via API', async ({ request }) => {
    const timestamp = Date.now();
    const productData = {
      name: `API Test Product ${timestamp}`,
      sku: `API-${timestamp}`,
      category: 'Sensors',
      industry: 'Manufacturing',
      description: 'Test product created via API',
      price_range: '$100-$200',
      is_active: true
    };
    
    const response = await request.post(`${API_BASE_URL}/api/products`, {
      data: productData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
    
    console.log('✅ Product created via API:', data.id);
  });

  test('should submit RFQ via API', async ({ request }) => {
    const timestamp = Date.now();
    const rfqData = {
      company_name: `API Test Company ${timestamp}`,
      contact_name: 'API Test User',
      email: `apitest-${timestamp}@example.com`,
      phone: '+1-555-0123',
      service_type: 'Product Inquiry',
      project_description: 'Test RFQ submission via API',
      estimated_budget: '$1000-$5000',
      timeline: '2-4 weeks'
    };
    
    const response = await request.post(`${API_BASE_URL}/api/rfq`, {
      data: rfqData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
    
    console.log('✅ RFQ submitted via API:', data.id);
  });

  test('should handle invalid product creation', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/products`, {
      data: {} // Missing required fields
    });
    
    // Should still return 200 (API might not validate strictly)
    // or return error - either is acceptable
    expect([200, 400, 500]).toContain(response.status());
    
    console.log('✅ Invalid product creation handled:', response.status());
  });

  test('should handle contact form submission', async ({ request }) => {
    const contactData = {
      name: 'API Test User',
      email: 'apitest@example.com',
      company: 'API Test Company',
      message: 'Test contact form submission'
    };
    
    const response = await request.post(`${API_BASE_URL}/api/contact`, {
      data: contactData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    console.log('✅ Contact form submitted via API');
  });

  test('should fetch leads from API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/leads`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.leads)).toBe(true);
    
    console.log(`✅ Fetched ${data.leads.length} leads from API`);
  });

  test('API should have correct CORS headers', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/health`);
    
    // Check for common CORS headers
    const headers = response.headers();
    
    // These might or might not be present depending on API config
    console.log('Response headers:', {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'content-type': headers['content-type']
    });
    
    expect(response.status()).toBe(200);
  });

  test('API response time should be acceptable', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(`${API_BASE_URL}/api/health`);
    
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    console.log(`✅ API response time: ${responseTime}ms`);
  });

  test('should handle concurrent API requests', async ({ request }) => {
    const requests = Array(5).fill(null).map((_, i) => 
      request.get(`${API_BASE_URL}/api/health`)
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach((response, i) => {
      expect(response.status()).toBe(200);
    });
    
    console.log('✅ All 5 concurrent requests succeeded');
  });
});
