'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/app/components/Toast';
import { ToastContainer } from '@/app/components/ToastContainer';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
          <ToastContainer position="top-right" />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
