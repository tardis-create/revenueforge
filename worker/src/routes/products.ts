import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateId, getTimestamp } from '../db';
import type { Env, Product, ProductImage } from '../types';

const products = new Hono<{ Bindings: Env }>();

/**
 * Validation helper
 */
function validateProductInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Price is required and must be a positive number');
  }
  
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (typeof data.in_stock !== 'boolean' && typeof data.in_stock !== 'number') {
    errors.push('in_stock must be a boolean or number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * GET /api/products - List all products (paginated)
 * Public access
 */
products.get('/', async (c) => {
  try {
    const db = c.env.DB;
    
    // Parse pagination parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }
    
    // Get total count
    const countResult = await db.prepare('SELECT COUNT(*) as total FROM products').first();
    const total = countResult?.total as number || 0;
    
    // Get products with images
    const productsResult = await db.prepare(
      `SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();
    
    const productList = productsResult.results as unknown as Product[];
    
    // Fetch images for each product
    for (const product of productList) {
      const imagesResult = await db.prepare(
        `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`
      ).bind(product.id).all();
      
      product.images = imagesResult.results as unknown as ProductImage[];
    }
    
    return c.json({
      products: productList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/products/:id - Get single product
 * Public access
 */
products.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const productId = c.req.param('id');
    
    // Get product
    const product = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(productId).first() as Product | null;
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Get product images
    const imagesResult = await db.prepare(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`
    ).bind(productId).all();
    
    product.images = imagesResult.results as unknown as ProductImage[];
    
    return c.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/products - Create product
 * Admin only
 */
products.post('/', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    
    // Validate input
    const validation = validateProductInput(body);
    if (!validation.valid) {
      return c.json({ error: 'Validation failed', details: validation.errors }, 400);
    }
    
    // Generate ID and timestamps
    const id = generateId('prod');
    const now = getTimestamp();
    
    // Convert in_stock to number (0 or 1)
    const inStock = typeof body.in_stock === 'boolean' 
      ? (body.in_stock ? 1 : 0) 
      : (body.in_stock || 1);
    
    // Insert product
    await db.prepare(
      `INSERT INTO products (id, name, description, price, category, in_stock, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.name.trim(),
      body.description?.trim() || null,
      body.price,
      body.category.trim(),
      inStock,
      now,
      now
    ).run();
    
    // Fetch the created product
    const product = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(id).first() as Product;
    
    product.images = [];
    
    return c.json({ product }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * PATCH /api/products/:id - Update product
 * Admin only
 */
products.patch('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const productId = c.req.param('id');
    const body = await c.req.json();
    
    // Check if product exists
    const existingProduct = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(productId).first();
    
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return c.json({ error: 'Name must be a non-empty string' }, 400);
      }
      updates.push('name = ?');
      values.push(body.name.trim());
    }
    
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description?.trim() || null);
    }
    
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price < 0) {
        return c.json({ error: 'Price must be a positive number' }, 400);
      }
      updates.push('price = ?');
      values.push(body.price);
    }
    
    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || body.category.trim().length === 0) {
        return c.json({ error: 'Category must be a non-empty string' }, 400);
      }
      updates.push('category = ?');
      values.push(body.category.trim());
    }
    
    if (body.in_stock !== undefined) {
      const inStock = typeof body.in_stock === 'boolean' 
        ? (body.in_stock ? 1 : 0) 
        : body.in_stock;
      updates.push('in_stock = ?');
      values.push(inStock);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }
    
    // Always update updated_at
    updates.push('updated_at = ?');
    values.push(getTimestamp());
    
    // Add product ID to values
    values.push(productId);
    
    // Execute update
    await db.prepare(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    // Fetch updated product
    const product = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(productId).first() as Product;
    
    // Get images
    const imagesResult = await db.prepare(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`
    ).bind(productId).all();
    
    product.images = imagesResult.results as unknown as ProductImage[];
    
    return c.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * DELETE /api/products/:id - Delete product
 * Admin only
 */
products.delete('/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const productId = c.req.param('id');
    
    // Check if product exists
    const product = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(productId).first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Get images to delete from R2
    const images = await db.prepare(
      `SELECT image_key FROM product_images WHERE product_id = ?`
    ).bind(productId).all();
    
    // Delete images from R2 (if bucket exists)
    if (c.env.PRODUCT_IMAGES && images.results.length > 0) {
      for (const image of images.results) {
        try {
          await c.env.PRODUCT_IMAGES.delete((image as any).image_key);
        } catch (e) {
          console.error('Failed to delete image from R2:', e);
        }
      }
    }
    
    // Delete product (cascade will delete images from DB)
    await db.prepare(
      `DELETE FROM products WHERE id = ?`
    ).bind(productId).run();
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /api/products/:id/image - Upload product image
 * Admin only
 */
products.post('/:id/image', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const productId = c.req.param('id');
    
    // Check if product exists
    const product = await db.prepare(
      `SELECT * FROM products WHERE id = ?`
    ).bind(productId).first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Check if R2 bucket is available
    if (!c.env.PRODUCT_IMAGES) {
      return c.json({ error: 'Image storage not configured' }, 500);
    }
    
    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('image');
    
    if (!file || typeof file === 'string') {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    // At this point, file is a File object
    const imageFile = file as File;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return c.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, 400);
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB' }, 400);
    }
    
    // Generate unique key for R2
    const imageId = generateId('img');
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const imageKey = `products/${productId}/${imageId}.${extension}`;
    
    // Upload to R2
    await c.env.PRODUCT_IMAGES.put(imageKey, imageFile.stream(), {
      httpMetadata: {
        contentType: imageFile.type,
      },
    });
    
    // Generate public URL
    // Note: In production, configure custom domain or public bucket URL
    const imageUrl = `https://pub-r2.revenueforge.dev/${imageKey}`;
    
    // Get current max sort order
    const maxOrder = await db.prepare(
      `SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?`
    ).bind(productId).first();
    
    const sortOrder = (maxOrder?.max_order as number || 0) + 1;
    
    // Save image reference in database
    await db.prepare(
      `INSERT INTO product_images (id, product_id, image_url, image_key, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      imageId,
      productId,
      imageUrl,
      imageKey,
      sortOrder,
      getTimestamp()
    ).run();
    
    // Fetch all product images
    const imagesResult = await db.prepare(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`
    ).bind(productId).all();
    
    return c.json({
      message: 'Image uploaded successfully',
      image: {
        id: imageId,
        product_id: productId,
        image_url: imageUrl,
        image_key: imageKey,
        sort_order: sortOrder
      },
      images: imagesResult.results
    }, 201);
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default products;
