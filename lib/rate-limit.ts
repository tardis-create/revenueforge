// Rate Limiting Configuration and Utilities for RevenueForge

import type { D1Database } from '@cloudflare/workers-types';

export interface RateLimitConfig {
  // Requests per window
  requests: number;
  // Window size in seconds
  windowSeconds: number;
  // Key prefix for rate limiting
  keyPrefix: string;
}

// Default rate limits for different endpoints
export const RATE_LIMITS = {
  // General API endpoints
  default: {
    requests: 100,
    windowSeconds: 60,
    keyPrefix: 'ratelimit:default',
  },
  // Authentication endpoints (stricter)
  auth: {
    requests: 5,
    windowSeconds: 60,
    keyPrefix: 'ratelimit:auth',
  },
  // Public catalog endpoints (more lenient)
  catalog: {
    requests: 300,
    windowSeconds: 60,
    keyPrefix: 'ratelimit:catalog',
  },
  // RFQ submission (moderate)
  rfq: {
    requests: 10,
    windowSeconds: 60,
    keyPrefix: 'ratelimit:rfq',
  },
  // Admin endpoints (strict)
  admin: {
    requests: 30,
    windowSeconds: 60,
    keyPrefix: 'ratelimit:admin',
  },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Simple in-memory rate limiter for Cloudflare Workers
 * Uses D1 for distributed rate limiting
 * 
 * Note: For production, consider using Cloudflare's native rate limiting
 * or KV for better performance at scale
 */
export class RateLimiter {
  constructor(private db: D1Database) {}

  /**
   * Check if a request is within rate limits
   * Uses client IP + endpoint type as the rate limit key
   */
  async checkLimit(
    identifier: string,
    tier: RateLimitTier = 'default'
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[tier];
    const key = `${config.keyPrefix}:${identifier}`;
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    // Get current count from D1
    const result = await this.db
      .prepare(
        `SELECT COUNT(*) as count FROM rate_limit_log 
         WHERE key = ? AND timestamp > ?`
      )
      .bind(key, windowStart.toISOString())
      .first<{ count: number }>();

    const currentCount = result?.count ?? 0;
    const remaining = Math.max(0, config.requests - currentCount);
    const allowed = currentCount < config.requests;

    // Log this request
    if (allowed) {
      await this.db
        .prepare(
          `INSERT INTO rate_limit_log (key, timestamp, identifier, tier)
           VALUES (?, ?, ?, ?)`
        )
        .bind(key, now.toISOString(), identifier, tier)
        .run();
    }

    // Calculate reset time
    const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);

    return {
      allowed,
      limit: config.requests,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil(config.windowSeconds),
    };
  }

  /**
   * Get rate limit headers for response
   */
  getHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
    };

    if (!result.allowed && result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
  }
}

/**
 * Cloudflare Rate Limiting configuration
 * This should be configured in wrangler.toml or Cloudflare Dashboard
 * 
 * Example wrangler.toml configuration:
 * 
 * [[rules]]
 * type = "rate_limit"
 * limit = { requests = 100, period = 60 }
 * action = { type = "block", block = { status_code = 429 } }
 */
export const CLOUDFLARE_RATE_LIMIT_CONFIG = {
  rules: [
    {
      name: 'general-api-limit',
      description: 'General API rate limiting',
      requests: 100,
      period: 60, // seconds
      action: 'block',
    },
    {
      name: 'auth-endpoint-limit',
      description: 'Stricter limits for auth endpoints',
      requests: 5,
      period: 60,
      action: 'block',
    },
    {
      name: 'catalog-public-limit',
      description: 'Lenient limits for public catalog',
      requests: 300,
      period: 60,
      action: 'block',
    },
  ],
};

/**
 * Create rate limit response
 */
export function createRateLimitResponse(
  retryAfter: number,
  message = 'Too many requests. Please try again later.'
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message,
      retry_after: retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
