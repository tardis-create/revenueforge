'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/auth-context';

function DealerLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !authLoading && !isAuthenticated && pathname !== '/dealer/login') { if (!localStorage.getItem('dealerAuth')) router.push('/dealer/login'); } }, [mounted, isAuthenticated, authLoading, pathname, router]);
  if (!mounted || authLoading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  const handleLogout = async () => { localStorage.removeItem('dealerAuth'); await logout(); router.push('/dealer/login'); };
  const getDisplayName = (): string => { if (user?.name) return user.name; try { const legacyAuth = localStorage.getItem('dealerAuth'); if (legacyAuth) return JSON.parse(legacyAuth).name || 'Dealer'; } catch { return 'Dealer'; } return 'Dealer'; };
  const getInitials = (): string => getDisplayName().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const showLayout = isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('dealerAuth')) || pathname === '/dealer/login';
  const navItems = [ { href: '/dealer', label: 'Dashboard', icon: '📊', active: pathname === '/dealer' }, { href: '/dealer/products', label: 'Products', icon: '📦', active: pathname === '/dealer/products' }, { href: '/dealer/orders', label: 'Orders', icon: '🛒', active: pathname === '/dealer/orders' }, { href: '/dealer/commissions', label: 'Commissions', icon: '💰', active: pathname === '/dealer/commissions' }, ];
  if (pathname === '/dealer/login') return <div className="min-h-screen bg-zinc-50"><main>{children}</main></div>;
  if (!showLayout) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;
  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-emerald-700 border-b border-emerald-800 sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center h-16"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm"><span className="text-emerald-700 font-bold text-lg">RF</span></div><div className="hidden sm:block"><span className="font-semibold text-white text-lg">RevenueForge</span><span className="text-emerald-200 mx-2">•</span><span className="text-emerald-100 text-sm font-medium">Dealer Portal</span></div></div><div className="flex items-center gap-4"><div className="hidden sm:flex items-center gap-3"><div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-emerald-400">{getInitials()}</div><div className="flex flex-col"><span className="text-white text-sm font-medium">{getDisplayName()}</span><span className="text-emerald-200 text-xs">Dealer Partner</span></div></div><button onClick={handleLogout} className="text-sm text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600">Logout</button></div></div></div></nav>
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-zinc-200 min-h-[calc(100vh-4rem)] sticky top-16"><nav className="p-4 space-y-1">{navItems.map((item) => (<a key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 font-medium' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}><span className="text-xl">{item.icon}</span><span>{item.label}</span></a>))}</nav><div className="mx-4 mt-6 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">{getInitials()}</div><div><div className="text-sm font-semibold text-zinc-900">{getDisplayName()}</div><div className="text-xs text-emerald-600">Dealer Partner</div></div></div><div className="text-xs text-zinc-600">Need help? <a href="mailto:support@revenueforge.io" className="text-emerald-700 font-medium">Contact Support</a></div></div></aside>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50"><nav className="flex justify-around py-2">{navItems.map((item) => (<a key={item.href} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${item.active ? 'text-emerald-600' : 'text-zinc-400'}`}><span className="text-xl">{item.icon}</span><span className="text-xs font-medium">{item.label}</span></a>))}</nav></div>
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
export default function DealerLayout({ children }: { children: React.ReactNode }) { return <AuthProvider><DealerLayoutContent>{children}</DealerLayoutContent></AuthProvider>; }
