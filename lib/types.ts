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
  image_url: string | null;
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
  image_url?: string;
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
