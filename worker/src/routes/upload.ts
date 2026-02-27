import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Env } from '../types';

const upload = new Hono<{ Bindings: Env }>();

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// POST /api/upload — upload a file to R2
upload.post('/', requireAuth, requireRole('admin', 'dealer'), async (c) => {
  const formData = await c.req.formData().catch(() => null);
  if (!formData) {
    return c.json({ error: 'Invalid multipart form data' }, 400);
  }

  const rawFile = formData.get('file');
  if (!rawFile || typeof (rawFile as any).arrayBuffer !== 'function') {
    return c.json({ error: 'Missing file field in form data' }, 400);
  }
  const file = rawFile as unknown as File;
  

  // Validate MIME type
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return c.json(
      { error: 'Unsupported file type. Allowed: jpg, png, webp, pdf' },
      415
    );
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return c.json({ error: 'File exceeds maximum size of 10MB' }, 413);
  }

  // Generate a unique key
  const timestamp = Date.now();
  const random = crypto.getRandomValues(new Uint8Array(8));
  const randomHex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const key = `uploads/${timestamp}-${randomHex}.${ext}`;

  // Store in R2
  const arrayBuffer = await file.arrayBuffer();
  await c.env.UPLOADS.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  // Build public URL
  const url = `https://pub-revenueforge-uploads.r2.dev/${key}`;

  return c.json({ url, key }, 201);
});

// DELETE /api/upload/:key — remove a file from R2
// Supports nested keys (e.g. uploads/timestamp-hex.jpg) via wildcard
upload.delete('/*', requireAuth, requireRole('admin', 'dealer'), async (c) => {
  const path = c.req.path;
  const prefix = '/api/upload/';
  const key = decodeURIComponent(
    path.startsWith(prefix) ? path.slice(prefix.length) : path.slice(1)
  );

  if (!key) {
    return c.json({ error: 'Missing key' }, 400);
  }

  await c.env.UPLOADS.delete(key);

  return c.json({ success: true, key });
});

export default upload;
