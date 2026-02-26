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

// API base URL - in production, this would be an environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
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
      // In a real app, this would call your auth API
      // For now, we simulate a successful login with mock data
      // TODO: Replace with actual API call when backend is ready
      
      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock user data - in production, this comes from the API
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : email.includes('dealer') ? 'dealer' : 'user',
      };

      // Store auth data
      const mockToken = btoa(`${email}:${Date.now()}`); // Simple mock token
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // Redirect based on role
      if (user.role === 'dealer') {
        router.push('/dealer');
      } else {
        router.push('/admin');
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Invalid email or password',
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
      // In a real app, this would call your registration API
      // For now, we simulate a successful registration
      // TODO: Replace with actual API call when backend is ready
      
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

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // Redirect to login after successful registration
      // In a real app, you might want to auto-login or show a success message
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
      // Clear auth data
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      // Redirect to login
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
      // In a real app, this would call your password reset API
      // TODO: Replace with actual API call when backend is ready
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      setState((prev) => ({ ...prev, isLoading: false }));
      
      // Return success - in production, the API would send an email
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
      // In a real app, this would call your password reset API with the token
      // TODO: Replace with actual API call when backend is ready
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Validate token exists (mock validation)
      if (!token || token.length < 10) {
        throw new Error('Invalid or expired reset token');
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      
      // Redirect to login after successful reset
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
  
  // During static generation or if used outside provider, return a default no-op implementation
  if (context === undefined) {
    // Return a safe default that won't break during static generation
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: async () => {
        console.warn('AuthProvider not initialized - login called during static generation');
      },
      register: async () => {
        console.warn('AuthProvider not initialized - register called during static generation');
      },
      logout: async () => {
        console.warn('AuthProvider not initialized - logout called during static generation');
      },
      forgotPassword: async () => {
        console.warn('AuthProvider not initialized - forgotPassword called during static generation');
      },
      resetPassword: async () => {
        console.warn('AuthProvider not initialized - resetPassword called during static generation');
      },
      clearError: () => {
        console.warn('AuthProvider not initialized - clearError called during static generation');
      },
    };
  }
  
  return context;
}

// Export the context for advanced use cases
export { AuthContext };
