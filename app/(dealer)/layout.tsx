'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      const isDealer = user?.role === 'dealer' || user?.role === 'admin';
      
      if (!isAuthenticated && pathname !== '/dealer/login') {
        router.push('/dealer/login');
      } else if (isAuthenticated && !isDealer && pathname !== '/dealer/login') {
        router.push('/login');
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, pathname, router, user]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="text-zinc-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/dealer/login');
  };

  const navItems = [
    { href: '/dealer', label: 'Dashboard', icon: '📊', activeIcon: '📈' },
    { href: '/dealer/products', label: 'Products', icon: '📦', activeIcon: '🎁' },
    { href: '/dealer/orders', label: 'Orders', icon: '🛒', activeIcon: '✅' },
    { href: '/dealer/commissions', label: 'Commissions', icon: '💰', activeIcon: '💎' },
  ];

  const showSidebar = isAuthenticated && (user?.role === 'dealer' || user?.role === 'admin');

  // Login page renders directly without layout chrome
  if (!showSidebar && pathname === '/dealer/login') {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
              <span className="text-zinc-500 mx-2">•</span>
              <span className="text-zinc-400 text-sm">Dealer Portal</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800/50 text-zinc-100 border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
                  }`}
                >
                  <span className="mr-2">{isActive ? item.activeIcon : item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          {showSidebar && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DP'}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-zinc-100">{user?.name || 'Dealer Partner'}</div>
                  <div className="text-xs text-zinc-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
              >
                Logout
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && showSidebar && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50 z-40">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-xl">{isActive ? item.activeIcon : item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-10 pb-24 lg:pb-10">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {showSidebar && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/50 z-50">
            <nav className="flex justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'text-purple-400' : 'text-zinc-500'
                    }`}
                  >
                    <span className="text-xl">{isActive ? item.activeIcon : item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
