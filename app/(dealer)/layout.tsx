'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('dealerAuth');
    if (!auth && pathname !== '/dealer/login') {
      router.push('/dealer/login');
    } else if (auth) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('dealerAuth');
    router.push('/dealer/login');
  };

  const navItems = [
    { href: '/dealer', label: 'Dashboard', icon: '📊' },
    { href: '/dealer/products', label: 'Products', icon: '📦' },
    { href: '/dealer/orders', label: 'Orders', icon: '🛒' },
    { href: '/dealer/commissions', label: 'Commissions', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RF</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-zinc-900 text-lg">RevenueForge</span>
                <span className="text-zinc-400 mx-2">•</span>
                <span className="text-zinc-600 text-sm">Dealer Portal</span>
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600">
                  <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-700 font-semibold text-xs">
                    DP
                  </div>
                  <span>Dealer Partner</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      {isAuthenticated && (
        <div className="flex">
          <aside className="hidden lg:block w-64 bg-white border-r border-zinc-200 min-h-[calc(100vh-4rem)] sticky top-16">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-600 hover:bg-zinc-100'
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50">
            <nav className="flex justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'text-zinc-900' : 'text-zinc-400'
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

      {/* Login page renders directly without sidebar */}
      {!isAuthenticated && pathname === '/dealer/login' && (
        <main>{children}</main>
      )}
    </div>
  );
}
