/**
 * Type definitions for RevenueForge Products API
 */

export interface Env {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'dealer' | 'viewer';
  iat?: number;
  exp?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  in_stock: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_key: string;
  sort_order: number;
  created_at: string;
}

export interface Dealer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  region: string | null;
  status: 'active' | 'inactive' | 'suspended';
  commission_rate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  dealer_id: string;
  lead_id: string | null;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  description: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  in_stock?: boolean | number;
}
