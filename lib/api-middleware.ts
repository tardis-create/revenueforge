// API Middleware combining RBAC, Audit, Rate Limiting, and Security
// This module provides composable middleware for RevenueForge API routes

import type { D1Database } from '@cloudflare/workers-types';
import { hasPermission, type UserRole, DEFAULT_PERMISSIONS } from './rbac';
import { logAction, type AuditAction } from './audit';
import { RateLimiter, createRateLimitResponse, type RateLimitTier } from './rate-limit';
import { applySecurityHeaders } from './security';

// Extend the global Env type to include D1 binding
declare global {
  interface Env {
    DB: D1Database;
  }
}

export interface ApiContext {
  request: Request;
  env: Env;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export type ApiHandler = (context: ApiContext) => Promise<Response>;

/**
 * Middleware function type
 */
export type Middleware = (
  handler: ApiHandler
) => ApiHandler;

/**
 * Compose multiple middlewares into a single handler
 */
export function compose(...middlewares: Middleware[]): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Security Headers Middleware
 * Applies security headers to all responses
 */
export function withSecurityHeaders(): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      const response = await handler(context);
      return applySecurityHeaders(response);
    };
  };
}

/**
 * Rate Limiting Middleware
 * Limits requests based on IP and endpoint tier
 */
export function withRateLimit(tier: RateLimitTier = 'default'): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      const rateLimiter = new RateLimiter(context.env.DB);
      
      // Get client identifier (IP or user ID)
      const identifier = 
        context.user?.id ?? 
        context.request.headers.get('cf-connecting-ip') ?? 
        'unknown';
      
      const result = await rateLimiter.checkLimit(identifier, tier);
      
      if (!result.allowed) {
        return createRateLimitResponse(result.retryAfter ?? 60);
      }
      
      const response = await handler(context);
      
      // Add rate limit headers to response
      const headers = rateLimiter.getHeaders(result);
      const newHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };
  };
}

/**
 * RBAC Middleware
 * Checks if user has permission to access resource
 */
export function withPermission(
  resource: string,
  action: string,
  permissions = DEFAULT_PERMISSIONS
): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      const userRole = context.user?.role ?? 'viewer';
      
      if (!hasPermission(userRole, resource, action, permissions)) {
        return new Response(
          JSON.stringify({
            error: 'Forbidden',
            message: 'You do not have permission to perform this action',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      return handler(context);
    };
  };
}

/**
 * Audit Logging Middleware
 * Logs all API actions to the audit log
 */
export function withAuditLogging(
  action: AuditAction,
  resourceType: string,
  getResourceId?: (request: Request) => string | undefined
): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      const response = await handler(context);
      
      // Log the action asynchronously (don't wait)
      const url = new URL(context.request.url);
      const resourceId = getResourceId?.(context.request);
      
      logAction(context.env.DB, {
        user_id: context.user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: {
          method: context.request.method,
          path: url.pathname,
          status: response.status,
        },
        ip_address: context.request.headers.get('cf-connecting-ip') ?? undefined,
        user_agent: context.request.headers.get('user-agent') ?? undefined,
      }).catch(console.error);
      
      return response;
    };
  };
}

/**
 * Authentication Middleware
 * Extracts and validates JWT token from Authorization header
 * Note: This is a placeholder - implement actual JWT validation
 */
export function withAuth(): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      const authHeader = context.request.headers.get('Authorization');
      
      if (!authHeader?.startsWith('Bearer ')) {
        // Allow anonymous access for public endpoints
        // Return 401 only for protected routes
        return handler(context);
      }
      
      const token = authHeader.slice(7);
      
      // TODO: Implement JWT validation
      // For now, we'll just parse a mock token structure
      try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? '{}'));
        context.user = {
          id: payload.sub ?? 'unknown',
          email: payload.email ?? 'unknown',
          role: payload.role ?? 'viewer',
        };
      } catch {
        // Invalid token, continue as anonymous
      }
      
      return handler(context);
    };
  };
}

/**
 * Error Handling Middleware
 * Catches errors and returns consistent error responses
 */
export function withErrorHandling(): Middleware {
  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext): Promise<Response> => {
      try {
        return await handler(context);
      } catch (error) {
        console.error('API Error:', error);
        
        const message = error instanceof Error ? error.message : 'Internal server error';
        
        return new Response(
          JSON.stringify({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    };
  };
}

/**
 * Standard API Middleware Stack
 * Combines all NFR middlewares in the recommended order
 */
export function withStandardApi(
  options: {
    rateLimitTier?: RateLimitTier;
    requireAuth?: boolean;
    audit?: {
      action: AuditAction;
      resourceType: string;
      getResourceId?: (request: Request) => string | undefined;
    };
    permission?: {
      resource: string;
      action: string;
    };
  } = {}
): Middleware {
  const middlewares: Middleware[] = [
    withErrorHandling(),
    withSecurityHeaders(),
    withRateLimit(options.rateLimitTier ?? 'default'),
  ];
  
  if (options.requireAuth !== false) {
    middlewares.push(withAuth());
  }
  
  if (options.permission) {
    middlewares.push(
      withPermission(options.permission.resource, options.permission.action)
    );
  }
  
  if (options.audit) {
    middlewares.push(
      withAuditLogging(
        options.audit.action,
        options.audit.resourceType,
        options.audit.getResourceId
      )
    );
  }
  
  return compose(...middlewares);
}

/**
 * Helper to create a standard API handler
 */
export function createApiHandler(
  handler: ApiHandler,
  options?: Parameters<typeof withStandardApi>[0]
): ApiHandler {
  return withStandardApi(options)(handler);
}
