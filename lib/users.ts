// User management API service
import { API_BASE_URL } from './api';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'dealer' | 'user';
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'dealer' | 'user';
  phone?: string;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'dealer' | 'user';
  phone?: string;
  is_active?: boolean;
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// API fetch helper with auth
async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${path}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

// List all users
export async function listUsers(role?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  
  const response = await authFetch(`/api/users?${params}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch users' })) as any;
    throw new Error(error.error || 'Failed to fetch users');
  }
  const data = await response.json() as any;
  return data.data || [];
}

// Get a single user
export async function getUser(id: string): Promise<User> {
  const response = await authFetch(`/api/users/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch user' })) as any;
    throw new Error(error.error || 'Failed to fetch user');
  }
  const data = await response.json() as any;
  return data.data;
}

// Create a new user
export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await authFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create user' })) as any;
    throw new Error(error.error || 'Failed to create user');
  }
  const data = await response.json() as any;
  return data.data;
}

// Update a user
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const response = await authFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update user' })) as any;
    throw new Error(error.error || 'Failed to update user');
  }
  const data = await response.json() as any;
  return data.data;
}

// Delete (soft delete) a user
export async function deleteUser(id: string): Promise<void> {
  const response = await authFetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete user' })) as any;
    throw new Error(error.error || 'Failed to delete user');
  }
}

// Toggle user active status
export async function toggleUserActive(id: string, isActive: boolean): Promise<User> {
  return updateUser(id, { is_active: isActive });
}
