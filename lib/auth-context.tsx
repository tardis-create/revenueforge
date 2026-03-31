'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'admin' | 'dealer' | 'user';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
}

// Create context with a default no-op implementation for static generation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_KEY);

        if (token && userData) {
          const user = JSON.parse(userData) as User;
          
          // Set cookie for middleware
          setCookie('auth_token', token);
          
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          // Clear any stale cookies
          deleteCookie('auth_token');
          
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch {
        // Clear potentially corrupted data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        deleteCookie('auth_token');
        
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // For demo/development: simple auth check
      // In production, this would validate against an API
      const isDealerDemo = email === 'dealer@revenueforge.io' && password === 'dealer123';
      const isAdminDemo = email === 'admin@revenueforge.io' && password === 'admin123';
      
      if (!isDealerDemo && !isAdminDemo) {
        throw new Error('Invalid credentials');
      }

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create user based on email
      const user: User = {
        id: isDealerDemo ? 'dealer-1' : 'admin-1',
        email,
        name: isDealerDemo ? 'Dealer Partner' : 'Admin User',
        role: isDealerDemo ? 'dealer' : 'admin',
      };

      // Generate token
      const mockToken = btoa(`${email}:${Date.now()}`);
      
      // Store in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Set cookie for middleware
      setCookie('auth_token', mockToken);

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // Redirect based on role
      if (user.role === 'dealer') {
        router.push('/dealer');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      throw error;
    }
  }, [router]);

  // Register function
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    company?: string
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        company,
        role: 'user',
      };

      const mockToken = btoa(`${email}:${Date.now()}`);
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCookie('auth_token', mockToken);

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      router.push('/login?registered=true');
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Registration failed. Please try again.',
      });
      throw error;
    }
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Clear localStorage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Clear cookie
      deleteCookie('auth_token');

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      router.push('/login');
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send reset link. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!token || token.length < 10) {
        throw new Error('Invalid or expired reset token');
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      router.push('/login?reset=true');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Invalid or expired reset token',
      }));
      throw error;
    }
  }, [router]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: async () => {
        console.warn('AuthProvider not initialized');
      },
      register: async () => {
        console.warn('AuthProvider not initialized');
      },
      logout: async () => {
        console.warn('AuthProvider not initialized');
      },
      forgotPassword: async () => {
        console.warn('AuthProvider not initialized');
      },
      resetPassword: async () => {
        console.warn('AuthProvider not initialized');
      },
      clearError: () => {
        console.warn('AuthProvider not initialized');
      },
    };
  }
  
  return context;
}

export { AuthContext };
