'use client';

import { useState } from 'react';

interface Commission {
  id: string;
  orderId: string;
  product: string;
  customer: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  date: string;
  paidDate?: string;
}

export default function DealerCommissionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [commissions] = useState<Commission[]>([
    {
      id: 'COM-001',
      orderId: 'ORD-001',
      product: 'Enterprise Analytics Suite',
      customer: 'TechCorp Inc.',
      amount: 450,
      status: 'paid',
      date: '2026-02-25',
      paidDate: '2026-02-28',
    },
    {
      id: 'COM-002',
      orderId: 'ORD-002',
      product: 'Revenue Intelligence Platform',
      customer: 'GrowthLabs',
      amount: 320,
      status: 'approved',
      date: '2026-02-24',
    },
    {
      id: 'COM-003',
      orderId: 'ORD-003',
      product: 'Smart Automation Tools',
      customer: 'DataDriven Co.',
      amount: 280,
      status: 'pending',
      date: '2026-02-24',
    },
    {
      id: 'COM-004',
      orderId: 'ORD-004',
      product: 'Predictive Analytics Module',
      customer: 'InnovateTech',
      amount: 510,
      status: 'paid',
      date: '2026-02-23',
      paidDate: '2026-02-26',
    },
    {
      id: 'COM-005',
      orderId: 'ORD-005',
      product: 'Team Collaboration Suite',
      customer: 'StartupXYZ',
      amount: 190,
      status: 'approved',
      date: '2026-02-22',
    },
    {
      id: 'COM-006',
      orderId: 'ORD-006',
      product: 'Customer Insights Dashboard',
      customer: 'RetailMax',
      amount: 300,
      status: 'paid',
      date: '2026-02-21',
      paidDate: '2026-02-24',
    },
    {
      id: 'COM-007',
      orderId: 'ORD-008',
      product: 'Enterprise Analytics Suite',
      customer: 'GlobalTech Solutions',
      amount: 450,
      status: 'paid',
      date: '2026-02-19',
      paidDate: '2026-02-22',
    },
  ]);

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
  ];

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  const filteredCommissions = commissions.filter((commission) => {
    const matchesStatus = selectedStatus === 'all' || commission.status === selectedStatus;
    return matchesStatus;
  });

  const stats = {
    totalEarned: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    pendingPayment: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    awaitingApproval: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    totalCommissions: commissions.length,
    averageCommission: commissions.reduce((sum, c) => sum + c.amount, 0) / commissions.length,
  };

  const recentPayouts = commissions.filter(c => c.status === 'paid').slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Commissions</h1>
        <p className="text-zinc-600 mt-1">Track your earnings and payout history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">💰</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Total Earned</span>
          </div>
          <div className="text-3xl font-bold">${stats.totalEarned.toLocaleString()}</div>
          <div className="text-sm text-green-100 mt-1">Lifetime earnings</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⏳</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pending</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">${stats.pendingPayment.toLocaleString()}</div>
          <div className="text-sm text-zinc-600 mt-1">Awaiting payment</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⏱️</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Approval</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">${stats.awaitingApproval.toLocaleString()}</div>
          <div className="text-sm text-zinc-600 mt-1">Awaiting approval</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded">Average</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">${Math.round(stats.averageCommission).toLocaleString()}</div>
          <div className="text-sm text-zinc-600 mt-1">Per order</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Commissions Table */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Period Filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>

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

          {/* Table */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Commission</th>
                    <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Product</th>
                    <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Customer</th>
                    <th className="text-left text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-zinc-600 uppercase tracking-wider px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-900">{commission.id}</div>
                        <div className="text-xs text-zinc-500">Order: {commission.orderId}</div>
                        <div className="text-xs text-zinc-500">{commission.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900 max-w-xs truncate">{commission.product}</div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="text-sm text-zinc-600">{commission.customer}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(commission.status)}`}>
                          {commission.status}
                        </span>
                        {commission.paidDate && (
                          <div className="text-xs text-zinc-500 mt-1">Paid: {commission.paidDate}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-green-600">${commission.amount.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCommissions.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No commissions found</h3>
                <p className="text-zinc-600">Try adjusting your filter criteria</p>
              </div>
            )}

            {/* Footer */}
            {filteredCommissions.length > 0 && (
              <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="text-sm text-zinc-600">
                    Showing {filteredCommissions.length} commissions
                  </div>
                  <div className="text-sm text-zinc-600">
                    Total: <span className="font-semibold text-green-600">${filteredCommissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Payouts */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Recent Payouts</h2>
            {recentPayouts.length > 0 ? (
              <div className="space-y-4">
                {recentPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">{payout.id}</div>
                      <div className="text-xs text-zinc-500">{payout.paidDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">${payout.amount.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500">{payout.product.substring(0, 15)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">No recent payouts</p>
            )}
          </div>

          {/* Commission Structure */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Commission Structure</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Standard Rate</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Premium Products</span>
                <span className="font-semibold">12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Enterprise Deals</span>
                <span className="font-semibold">15%</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-700">
              <div className="text-xs text-zinc-400 mb-2">Payout Schedule</div>
              <div className="text-sm">Net-30 terms</div>
              <div className="text-xs text-zinc-400 mt-1">Commissions paid monthly</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600">Monthly Target</span>
                  <span className="font-semibold text-zinc-900">75%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div className="bg-zinc-900 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-zinc-600">This Month</span>
                <span className="text-lg font-bold text-zinc-900">$1,760</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">Target</span>
                <span className="text-sm text-zinc-500">$2,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
