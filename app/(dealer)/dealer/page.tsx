'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCommission: number;
  activeProducts: number;
}

interface RecentOrder {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
}

export default function DealerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 47,
    pendingOrders: 8,
    totalRevenue: 128450,
    totalCommission: 12845,
    activeProducts: 24,
  });

  const [recentOrders] = useState<RecentOrder[]>([
    { id: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 4500, status: 'completed', date: '2026-02-25' },
    { id: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 3200, status: 'processing', date: '2026-02-24' },
    { id: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 2800, status: 'pending', date: '2026-02-24' },
    { id: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 5100, status: 'completed', date: '2026-02-23' },
    { id: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', amount: 1900, status: 'processing', date: '2026-02-22' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-1">Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{stats.totalOrders}</div>
          <div className="text-sm text-zinc-600">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{stats.pendingOrders}</div>
          <div className="text-sm text-zinc-600">Pending Orders</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+18%</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-zinc-600">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+15%</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">${stats.totalCommission.toLocaleString()}</div>
          <div className="text-sm text-zinc-600">Your Commission</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
              <a href="/dealer/orders" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                View all →
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{order.id}</div>
                      <div className="text-xs text-zinc-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900 max-w-xs truncate">{order.product}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-zinc-600">{order.customer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-zinc-900">${order.amount.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/dealer/products"
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">Browse Products</div>
                  <div className="text-xs text-zinc-500">{stats.activeProducts} products available</div>
                </div>
              </a>
              <a
                href="/dealer/orders"
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🛒</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">View Orders</div>
                  <div className="text-xs text-zinc-500">{stats.pendingOrders} pending orders</div>
                </div>
              </a>
              <a
                href="/dealer/commissions"
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">Track Commissions</div>
                  <div className="text-xs text-zinc-500">${stats.totalCommission.toLocaleString()} earned</div>
                </div>
              </a>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">This Month</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Orders Placed</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Revenue Generated</span>
                <span className="font-semibold">$45,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Commission Earned</span>
                <span className="font-semibold text-green-400">$4,520</span>
              </div>
              <div className="pt-4 border-t border-zinc-700">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Conversion Rate</span>
                  <span className="font-semibold">68%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
