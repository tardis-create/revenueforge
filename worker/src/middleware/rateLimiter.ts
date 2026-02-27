/**
 * In-memory rate limiter for Cloudflare Workers.
 * Limits requests per IP using a sliding window approach.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Create a rate limiter middleware for Hono.
 * @param max      Maximum requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function createRateLimiter(max: number, windowMs: number) {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  };

  return async function rateLimiterMiddleware(c: any, next: () => Promise<void>) {
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const key = `rl:${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    if (Math.random() < 0.01) cleanup();

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(max - entry.count));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    await next();
  };
}

/**
 * Auth route rate limiter: max 5 login attempts per IP per 15 minutes.
 */
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);
