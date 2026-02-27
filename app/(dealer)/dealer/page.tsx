'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/lib/api';
import { 
  BlurText, 
  AnimatedContent, 
  GlareHover,
  CountUp
} from '@/app/components';

interface DashboardStats {
  assignedLeads: number;
  activeOrders: number;
  totalCommission: number;
  pendingCommission: number;
  wonLeads: number;
  conversionRate: number;
}

interface Lead {
  id: string;
  customerName: string;
  company: string;
  product: string;
  value: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  commission: number;
  createdAt: string;
}

interface Order {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
}

interface LeadsResponse {
  leads?: Lead[];
}

interface OrdersResponse {
  orders?: Order[];
}

export default function DealerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    assignedLeads: 0,
    activeOrders: 0,
    totalCommission: 0,
    pendingCommission: 0,
    wonLeads: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch leads for this dealer
        const leadsRes = await fetch(`${API_BASE_URL}/api/dealer/leads`, { headers });
        let leads: Lead[] = [];
        if (leadsRes.ok) {
          const data: LeadsResponse = await leadsRes.json();
          leads = data.leads || [];
        } else {
          // Fallback to mock data
          leads = getMockLeads();
        }
        setRecentLeads(leads.slice(0, 5));

        // Fetch orders for this dealer
        const ordersRes = await fetch(`${API_BASE_URL}/api/dealer/orders`, { headers });
        let orders: Order[] = [];
        if (ordersRes.ok) {
          const data: OrdersResponse = await ordersRes.json();
          orders = data.orders || [];
        } else {
          // Fallback to mock data
          orders = getMockOrders();
        }
        setRecentOrders(orders.slice(0, 5));

        // Calculate stats
        const assignedLeads = leads.length;
        const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const wonLeads = leads.filter(l => l.status === 'won');
        const totalCommission = wonLeads.reduce((sum, l) => sum + l.commission, 0);
        const pendingCommission = leads
          .filter(l => l.status === 'proposal' || l.status === 'negotiation')
          .reduce((sum, l) => sum + l.commission, 0);
        const conversionRate = assignedLeads > 0 ? Math.round((wonLeads.length / assignedLeads) * 100) : 0;

        setStats({
          assignedLeads,
          activeOrders,
          totalCommission,
          pendingCommission,
          wonLeads: wonLeads.length,
          conversionRate,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data on error
        const mockLeads = getMockLeads();
        const mockOrders = getMockOrders();
        setRecentLeads(mockLeads.slice(0, 5));
        setRecentOrders(mockOrders.slice(0, 5));
        setStats({
          assignedLeads: mockLeads.length,
          activeOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
          totalCommission: mockLeads.filter(l => l.status === 'won').reduce((sum, l) => sum + l.commission, 0),
          pendingCommission: mockLeads.filter(l => ['proposal', 'negotiation'].includes(l.status)).reduce((sum, l) => sum + l.commission, 0),
          wonLeads: mockLeads.filter(l => l.status === 'won').length,
          conversionRate: 25,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const getMockLeads = (): Lead[] => [
    { id: 'LEAD-001', customerName: 'John Smith', company: 'TechCorp Inc.', product: 'Enterprise Analytics Suite', value: 45000, status: 'negotiation', commission: 4500, createdAt: '2026-02-25' },
    { id: 'LEAD-002', customerName: 'Sarah Johnson', company: 'GrowthLabs', product: 'Revenue Intelligence Platform', value: 32000, status: 'proposal', commission: 3200, createdAt: '2026-02-24' },
    { id: 'LEAD-003', customerName: 'Mike Chen', company: 'DataDriven Co.', product: 'Smart Automation Tools', value: 28000, status: 'qualified', commission: 2800, createdAt: '2026-02-23' },
    { id: 'LEAD-004', customerName: 'Emily Davis', company: 'InnovateTech', product: 'Predictive Analytics Module', value: 51000, status: 'won', commission: 5100, createdAt: '2026-02-20' },
    { id: 'LEAD-005', customerName: 'Alex Thompson', company: 'StartupXYZ', product: 'Team Collaboration Suite', value: 19000, status: 'contacted', commission: 1900, createdAt: '2026-02-22' },
    { id: 'LEAD-006', customerName: 'Lisa Wang', company: 'RetailMax', product: 'Customer Insights Dashboard', value: 30000, status: 'won', commission: 3000, createdAt: '2026-02-18' },
    { id: 'LEAD-007', customerName: 'Jennifer Lee', company: 'FinServ Partners', product: 'Revenue Intelligence Platform', value: 38000, status: 'new', commission: 3800, createdAt: '2026-02-27' },
  ];

  const getMockOrders = (): Order[] => [
    { id: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 4500, status: 'completed', date: '2026-02-25' },
    { id: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 3200, status: 'processing', date: '2026-02-24' },
    { id: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 2800, status: 'pending', date: '2026-02-24' },
    { id: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 5100, status: 'completed', date: '2026-02-23' },
    { id: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', amount: 1900, status: 'processing', date: '2026-02-22' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'lost': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'negotiation':
      case 'processing': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'proposal':
      case 'pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'qualified': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <AnimatedContent>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Dealer Dashboard" />
          </h1>
          <p className="text-zinc-400">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here&apos;s your performance overview.
          </p>
        </div>
      </AnimatedContent>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assigned Leads', value: stats.assignedLeads, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-blue-600 to-blue-400', badge: `${stats.wonLeads} won` },
          { label: 'Active Orders', value: stats.activeOrders, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'from-amber-600 to-amber-400' },
          { label: 'Total Commission', value: stats.totalCommission, prefix: '$', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-emerald-600 to-emerald-400' },
          { label: 'Pending Commission', value: stats.pendingCommission, prefix: '$', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-purple-600 to-purple-400', badge: `${stats.conversionRate}% rate` },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
              <div className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                  {stat.badge && (
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {stat.prefix && <span className="text-zinc-500">{stat.prefix}</span>}
                  <CountUp to={stat.value} duration={2} />
                </div>
                <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
              </div>
            </GlareHover>
          </AnimatedContent>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <AnimatedContent delay={0.2}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={400}>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-100">Your Leads</h2>
                    <span className="text-xs text-zinc-500">{stats.assignedLeads} assigned</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800/30">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Lead</th>
                        <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Product</th>
                        <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-zinc-100">{lead.customerName}</div>
                            <div className="text-xs text-zinc-500">{lead.company}</div>
                            <div className="text-xs text-zinc-600">{lead.id}</div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="text-sm text-zinc-300 max-w-[200px] truncate">{lead.product}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-semibold text-zinc-100">${lead.value.toLocaleString()}</div>
                            {lead.status === 'won' && (
                              <div className="text-xs text-emerald-400">+${lead.commission.toLocaleString()}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlareHover>
          </AnimatedContent>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Orders */}
          <AnimatedContent delay={0.3}>
            <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={200}>
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{order.id}</div>
                        <div className="text-xs text-zinc-500">{order.product.substring(0, 20)}...</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-zinc-100">${order.amount.toLocaleString()}</div>
                        <span className={`text-xs ${order.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="/dealer/orders" className="block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  View all orders →
                </a>
              </div>
            </GlareHover>
          </AnimatedContent>

          {/* Quick Actions */}
          <AnimatedContent delay={0.4}>
            <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800/50 rounded-xl">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a href="/dealer/products" className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">Browse Products</div>
                    <div className="text-xs text-zinc-500">View catalog</div>
                  </div>
                </a>
                <a href="/dealer/commissions" className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">Track Commissions</div>
                    <div className="text-xs text-zinc-500">${stats.totalCommission.toLocaleString()} earned</div>
                  </div>
                </a>
              </div>
            </div>
          </AnimatedContent>

          {/* Performance Summary */}
          <AnimatedContent delay={0.5}>
            <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Conversion Rate</span>
                    <span className="font-semibold text-zinc-100">{stats.conversionRate}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(stats.conversionRate, 100)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-400 text-sm">Won Leads</span>
                  <span className="font-semibold text-emerald-400">{stats.wonLeads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Active Leads</span>
                  <span className="font-semibold text-zinc-100">{stats.assignedLeads - stats.wonLeads}</span>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </div>
    </div>
  );
}
