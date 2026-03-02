'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to initialize
    if (!authLoading) {
      const isLoginPage = pathname === '/dealer/login';
      
      // If not authenticated and not on login page, redirect to login
      if (!isAuthenticated && !isLoginPage) {
        router.push('/dealer/login');
      }
      // If authenticated but not a dealer/admin, redirect to main login
      else if (isAuthenticated && user && user.role !== 'dealer' && user.role !== 'admin' && !isLoginPage) {
        router.push('/login');
      }
      // If authenticated as dealer and on login page, redirect to dashboard
      else if (isAuthenticated && user && (user.role === 'dealer' || user.role === 'admin') && isLoginPage) {
        router.push('/dealer');
      }
      
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, pathname, router, user]);

  // Show loading spinner while checking auth
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/dealer/login');
  };

  const navItems = [
    { href: '/dealer', label: 'Dashboard', icon: '📊' },
    { href: '/dealer/products', label: 'Products', icon: '📦' },
    { href: '/dealer/orders', label: 'Orders', icon: '🛒' },
    { href: '/dealer/commissions', label: 'Commissions', icon: '💰' },
  ];

  // Show sidebar only when authenticated as dealer/admin
  const showSidebar = isAuthenticated && user && (user.role === 'dealer' || user.role === 'admin');
  const isLoginPage = pathname === '/dealer/login';

  // For login page, render children directly without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For protected pages, show layout with sidebar
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top Navigation */}
      <nav className="bg-zinc-900/80 border-b border-zinc-800/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-zinc-100 text-lg">RevenueForge</span>
                <span className="text-zinc-500 mx-2">•</span>
                <span className="text-zinc-400 text-sm">Dealer Portal</span>
              </div>
            </div>
            
            {showSidebar && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-300">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 font-semibold text-xs border border-zinc-700">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DP'}
                  </div>
                  <span>{user?.name || 'Dealer Partner'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Layout with Sidebar */}
      {showSidebar && (
        <div className="flex">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 bg-zinc-900/50 border-r border-zinc-800/50 min-h-[calc(100vh-4rem)] sticky top-16 backdrop-blur-sm">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 border-t border-zinc-800 z-50 backdrop-blur-sm">
            <nav className="flex justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'text-purple-400' : 'text-zinc-500'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      )}

      {/* Fallback for unauthenticated users on protected routes */}
      {!showSidebar && !isLoginPage && (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
}
