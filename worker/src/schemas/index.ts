import { z } from 'zod';

// Auth
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(256),
});

// Users
export const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
  role: z.enum(['admin', 'dealer', 'viewer']).default('viewer'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['admin', 'dealer', 'viewer']).optional(),
  active: z.boolean().optional(),
});

// Products
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  price: z.number().nonnegative(),
  category: z.string().min(1).max(255),
  in_stock: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Leads
export const CreateLeadSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  product_id: z.string().optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']).default('new'),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

// Dealers
export const CreateDealerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(1000).optional(),
  active: z.boolean().default(true),
});

export const UpdateDealerSchema = CreateDealerSchema.partial();

// Templates
export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  type: z.string().max(100).optional(),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial();

// Helper: parse and return 400 on validation failure
export function validate<T>(schema: z.ZodType<T>, data: unknown): { data: T } | { error: string; details: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.issues };
  }
  return { data: result.data };
}
