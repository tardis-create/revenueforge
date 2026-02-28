'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalQuotes: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCommission: number;
  activeProducts: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'quote' | 'order' | 'commission' | 'product_view';
  title: string;
  description: string;
  amount?: number;
  status?: 'pending' | 'processing' | 'completed' | 'approved';
  date: string;
}

interface MonthlyData {
  month: string;
  quotes: number;
  orders: number;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export default function DealerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 89,
    pendingOrders: 12,
    totalRevenue: 128450,
    totalCommission: 12845,
    activeProducts: 24,
    conversionRate: 68,
  });

  const [monthlyData] = useState<MonthlyData[]>([
    { month: 'Jan', quotes: 45, orders: 32, revenue: 42000 },
    { month: 'Feb', quotes: 52, orders: 38, revenue: 51000 },
    { month: 'Mar', quotes: 61, orders: 45, revenue: 62000 },
    { month: 'Apr', quotes: 58, orders: 41, revenue: 55000 },
    { month: 'May', quotes: 72, orders: 53, revenue: 71000 },
    { month: 'Jun', quotes: 89, orders: 67, revenue: 89000 },
  ]);

  const [categoryData] = useState<CategoryData[]>([
    { name: 'Analytics', value: 35 },
    { name: 'Automation', value: 28 },
    { name: 'Collaboration', value: 22 },
    { name: 'Security', value: 15 },
  ]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const [recentActivity] = useState<RecentActivity[]>([
    { id: 'ACT-001', type: 'order', title: 'New order placed', description: 'Enterprise Analytics Suite - TechCorp Inc.', amount: 4500, status: 'completed', date: '2 hours ago' },
    { id: 'ACT-002', type: 'quote', title: 'Quote generated', description: 'Revenue Intelligence Platform for GrowthLabs', amount: 3200, status: 'pending', date: '4 hours ago' },
    { id: 'ACT-003', type: 'commission', title: 'Commission earned', description: 'Smart Automation Tools sale', amount: 280, status: 'approved', date: 'Yesterday' },
    { id: 'ACT-004', type: 'product_view', title: 'Product viewed', description: 'Predictive Analytics Module by InnovateTech', date: 'Yesterday' },
    { id: 'ACT-005', type: 'order', title: 'Order confirmed', description: 'Team Collaboration Suite - StartupXYZ', amount: 1900, status: 'processing', date: '2 days ago' },
    { id: 'ACT-006', type: 'quote', title: 'Quote approved', description: 'Enterprise Analytics Suite expansion', amount: 5100, status: 'approved', date: '2 days ago' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'quote':
        return '📋';
      case 'commission':
        return '💰';
      case 'product_view':
        return '👁️';
      default:
        return '📌';
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-1 text-sm sm:text-base">Welcome back! Here&#39;s your performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+15%</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900">{stats.totalQuotes}</div>
          <div className="text-xs sm:text-sm text-zinc-600">Total Quotes</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">⏳</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900">{stats.pendingOrders}</div>
          <div className="text-xs sm:text-sm text-zinc-600">Pending Orders</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💵</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+18%</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-zinc-600">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💰</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+15%</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900">${stats.totalCommission.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-zinc-600">Your Commission</div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Revenue & Orders Trend */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Performance Trend</h2>
            <select className="text-xs sm:text-sm border border-zinc-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 bg-white">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This year</option>
            </select>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#71717a" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71717a" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value, name) => {
                    const val = typeof value === 'number' ? value : 0;
                    const nameStr = String(name || '');
                    return [
                      name === 'revenue' ? formatCurrency(val) : val,
                      nameStr.charAt(0).toUpperCase() + nameStr.slice(1)
                    ];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  name="revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  name="orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-zinc-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-zinc-600">Orders</span>
            </div>
          </div>
        </div>

        {/* Quotes vs Orders Bar Chart */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Quotes vs Orders</h2>
            <div className="text-xs sm:text-sm text-zinc-500">{stats.conversionRate}% conversion</div>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#71717a" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="quotes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Quotes" />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-zinc-600">Quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-zinc-600">Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 mb-4">Sales by Category</h2>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${typeof value === 'number' ? value : 0}%`, 'Share']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-zinc-600">{item.name}</span>
                <span className="text-zinc-900 font-medium ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            <a
              href="/dealer/products"
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">📦</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-zinc-900">Browse Products</div>
                <div className="text-xs text-zinc-500">{stats.activeProducts} products available</div>
              </div>
            </a>
            <a
              href="/dealer/orders"
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">🛒</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-zinc-900">View Orders</div>
                <div className="text-xs text-zinc-500">{stats.pendingOrders} pending orders</div>
              </div>
            </a>
            <a
              href="/dealer/commissions"
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">💰</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-zinc-900">Track Commissions</div>
                <div className="text-xs text-zinc-500">${stats.totalCommission.toLocaleString()} earned</div>
              </div>
            </a>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 sm:p-6 text-white">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">This Month</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 text-xs sm:text-sm">Quotes Generated</span>
              <span className="font-semibold text-sm sm:text-base">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 text-xs sm:text-sm">Orders Placed</span>
              <span className="font-semibold text-sm sm:text-base">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 text-xs sm:text-sm">Revenue Generated</span>
              <span className="font-semibold text-sm sm:text-base">$45,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 text-xs sm:text-sm">Commission Earned</span>
              <span className="font-semibold text-green-400 text-sm sm:text-base">$4,520</span>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-zinc-700">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 text-xs sm:text-sm">Conversion Rate</span>
                <span className="font-semibold text-sm sm:text-base">{stats.conversionRate}%</span>
              </div>
              <div className="mt-2 bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all" 
                  style={{ width: `${stats.conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Recent Activity</h2>
            <a href="/dealer/orders" className="text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              View all →
            </a>
          </div>
        </div>
        <div className="divide-y divide-zinc-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-zinc-900">{activity.title}</div>
                      <div className="text-xs text-zinc-500 truncate">{activity.description}</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {activity.amount && (
                        <span className="text-xs sm:text-sm font-semibold text-zinc-900">
                          ${activity.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.status && (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{activity.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
