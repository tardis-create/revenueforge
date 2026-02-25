'use client';

import { useState } from 'react';

interface Order {
  id: string;
  product: string;
  customer: string;
  customerEmail: string;
  amount: number;
  commission: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

export default function DealerOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      product: 'Enterprise Analytics Suite',
      customer: 'TechCorp Inc.',
      customerEmail: 'tech@techcorp.com',
      amount: 4500,
      commission: 450,
      status: 'completed',
      date: '2026-02-25',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-002',
      product: 'Revenue Intelligence Platform',
      customer: 'GrowthLabs',
      customerEmail: 'hello@growthlabs.io',
      amount: 3200,
      commission: 320,
      status: 'processing',
      date: '2026-02-24',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-003',
      product: 'Smart Automation Tools',
      customer: 'DataDriven Co.',
      customerEmail: 'info@datadriven.co',
      amount: 2800,
      commission: 280,
      status: 'pending',
      date: '2026-02-24',
      paymentStatus: 'pending',
    },
    {
      id: 'ORD-004',
      product: 'Predictive Analytics Module',
      customer: 'InnovateTech',
      customerEmail: 'buy@innovatetech.com',
      amount: 5100,
      commission: 510,
      status: 'completed',
      date: '2026-02-23',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-005',
      product: 'Team Collaboration Suite',
      customer: 'StartupXYZ',
      customerEmail: 'admin@startupxyz.io',
      amount: 1900,
      commission: 190,
      status: 'processing',
      date: '2026-02-22',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-006',
      product: 'Customer Insights Dashboard',
      customer: 'RetailMax',
      customerEmail: 'ops@retailmax.com',
      amount: 3000,
      commission: 300,
      status: 'completed',
      date: '2026-02-21',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-007',
      product: 'Financial Reporting Suite',
      customer: 'FinanceFirst',
      customerEmail: 'cfo@financefirst.com',
      amount: 3400,
      commission: 340,
      status: 'cancelled',
      date: '2026-02-20',
      paymentStatus: 'refunded',
    },
    {
      id: 'ORD-008',
      product: 'Enterprise Analytics Suite',
      customer: 'GlobalTech Solutions',
      customerEmail: 'enterprise@globaltech.com',
      amount: 4500,
      commission: 450,
      status: 'completed',
      date: '2026-02-19',
      paymentStatus: 'paid',
    },
  ]);

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'refunded': return 'text-red-600';
      default: return 'text-zinc-600';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.amount, 0),
    totalCommission: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.commission, 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Order History</h1>
        <p className="text-zinc-600 mt-1">Track and manage all your orders</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-600">Total Orders</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-600">Total Revenue</div>
          <div className="text-2xl font-bold text-zinc-900">${stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="text-sm text-zinc-600">Earned Commission</div>
          <div className="text-2xl font-bold text-green-600">${stats.totalCommission.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Order</th>
                <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Customer</th>
                <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Payment</th>
                <th className="text-right text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-900">{order.id}</div>
                    <div className="text-xs text-zinc-500">{order.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-900 max-w-xs truncate">{order.product}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-zinc-900">{order.customer}</div>
                    <div className="text-xs text-zinc-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-sm font-medium capitalize ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-zinc-900">${order.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right hidden sm:table-cell">
                    <div className="text-sm font-semibold text-green-600">${order.commission.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No orders found</h3>
            <p className="text-zinc-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Footer */}
        {filteredOrders.length > 0 && (
          <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="text-sm text-zinc-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
              <div className="text-sm text-zinc-600">
                Total: <span className="font-semibold text-zinc-900">${filteredOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
