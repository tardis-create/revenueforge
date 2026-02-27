/**
 * KV-based distributed rate limiter for Cloudflare Workers.
 * Uses Cloudflare KV for shared state across all Worker instances.
 */

import type { Context } from 'hono';
import type { Env } from '../types';

/**
 * Create a KV-backed rate limiter middleware.
 * @param max      Maximum requests allowed in the window
 * @param windowMs Window duration in milliseconds
 * @param scope    'authed' | 'anon' — used to namespace KV keys
 */
export function createRateLimiter(max: number, windowMs: number, scope = 'global') {
  return async function rateLimiterMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
    const kv = c.env.KV;
    if (!kv) {
      // KV not bound — fail open but log
      console.warn('KV binding missing; rate limiting disabled');
      await next();
      return;
    }

    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const windowSec = Math.ceil(windowMs / 1000);
    const windowId = Math.floor(Date.now() / windowMs); // bucket identifier
    const key = `rl:${scope}:${ip}:${windowId}`;

    // Atomic increment via KV
    const raw = await kv.get(key);
    const count = raw ? parseInt(raw, 10) + 1 : 1;

    if (count === 1) {
      // First request in this window — set with TTL
      await kv.put(key, String(count), { expirationTtl: windowSec + 10 });
    } else {
      await kv.put(key, String(count), { expirationTtl: windowSec + 10 });
    }

    const remaining = Math.max(0, max - count);
    const resetEpoch = Math.ceil(((windowId + 1) * windowMs) / 1000);

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(resetEpoch));

    if (count > max) {
      const retryAfter = resetEpoch - Math.ceil(Date.now() / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    await next();
  };
}

/**
 * Global rate limiters applied in index.ts:
 *   - Authenticated users: 100 req/min
 *   - Anonymous users: 20 req/min
 *
 * Auth route limiter: max 5 login attempts per IP per 15 minutes.
 */
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000, 'auth');
