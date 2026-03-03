'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://revenueforge-api.pronitopenclaw.workers.dev';
const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';

interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'dealer' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true, isAuthenticated: false, error: null });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    if (token && userData) {
      try {
        setState({ user: JSON.parse(userData), isLoading: false, isAuthenticated: true, error: null });
      } catch {
        localStorage.clear();
        setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email or password');

      const user: User = {
        id: data.user?.id || data.id || '',
        email: data.user?.email || email,
        name: data.user?.first_name ? `${data.user.first_name} ${data.user.last_name || ''}`.trim() : email.split('@')[0],
        first_name: data.user?.first_name,
        last_name: data.user?.last_name,
        role: data.user?.role || 'user',
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Set cookie for middleware auth check
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      setState({ user, isLoading: false, isAuthenticated: true, error: null });

      router.push(user.role === 'dealer' ? '/dealer' : '/admin');
    } catch (err: any) {
      setState({ user: null, isLoading: false, isAuthenticated: false, error: err.message || 'Login failed' });
      throw err;
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const [first_name, ...rest] = name.split(' ');
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name, last_name: rest.join(' ') }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setState(s => ({ ...s, isLoading: false }));
      router.push('/login?registered=true');
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, [router]);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'token=; path=/; max-age=0';
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    router.push('/login');
  }, [router]);

  const forgotPassword = useCallback(async (_email: string) => {
    // TODO: wire backend reset
    await new Promise(r => setTimeout(r, 500));
  }, []);

  const resetPassword = useCallback(async (_token: string, _password: string) => {
    await new Promise(r => setTimeout(r, 500));
    router.push('/login?reset=true');
  }, [router]);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, forgotPassword, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) return {
    user: null, isLoading: false, isAuthenticated: false, error: null,
    login: async () => {}, register: async () => {}, logout: async () => {},
    forgotPassword: async () => {}, resetPassword: async () => {}, clearError: () => {},
  };
  return ctx;
}

export { AuthContext };
