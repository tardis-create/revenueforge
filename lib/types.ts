// Product Types for RevenueForge

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  industry: string;
  description: string | null;
  technical_specs: Record<string, string> | null;
  price_range: string | null;
  price: number | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  industry: string;
  description?: string;
  technical_specs?: Record<string, string>;
  price_range?: string;
  price?: number;
  image_url?: string;
  stock?: number;
  is_active?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  industry?: string;
  is_active?: boolean;
}

// Category and Industry options
export const CATEGORIES = [
  'Sensors',
  'Controllers',
  'Measurement',
  'Safety',
  'Analysis',
  'Actuators',
  'Communication',
  'Power',
] as const;

export const INDUSTRIES = [
  'Manufacturing',
  'Oil & Gas',
  'Water Treatment',
  'Food & Beverage',
  'Chemical',
  'Pharmaceutical',
  'Energy',
  'All Industries',
] as const;

export type Category = typeof CATEGORIES[number];
export type Industry = typeof INDUSTRIES[number];

// RBAC Types
export type UserRole = 'admin' | 'dealer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  role: UserRole;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

// Audit Log Types
export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'unassign'
  | 'api_call';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

// Rate Limiting Types
export type RateLimitTier = 'default' | 'auth' | 'catalog' | 'rfq' | 'admin';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}
