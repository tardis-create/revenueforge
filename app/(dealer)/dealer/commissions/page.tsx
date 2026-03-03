'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover,
  CountUp
} from '@/app/components'
import { API_BASE_URL } from '@/lib/api'

interface Commission {
  id: string
  orderId: string
  product: string
  customer: string
  amount: number
  status: 'pending' | 'approved' | 'paid'
  date: string
  paidDate?: string
}

interface ApiCommission {
  id: string
  order_id: string
  product_name?: string
  customer_name?: string
  amount: number
  status: 'pending' | 'approved' | 'paid'
  created_at: string
  paid_at?: string
}

export default function DealerCommissionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/dealer/commissions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      const data = await response.json() as { success: boolean; data?: ApiCommission[]; error?: string }
      
      if (data.success && data.data) {
        const mappedCommissions: Commission[] = data.data.map((commission) => ({
          id: commission.id,
          orderId: commission.order_id,
          product: commission.product_name || 'Unknown Product',
          customer: commission.customer_name || 'Unknown Customer',
          amount: commission.amount,
          status: commission.status,
          date: new Date(commission.created_at).toISOString().split('T')[0],
          paidDate: commission.paid_at ? new Date(commission.paid_at).toISOString().split('T')[0] : undefined,
        }))
        setCommissions(mappedCommissions)
      } else {
        setError(data.error || 'Failed to load commissions')
      }
    } catch (err) {
      setError('Failed to load commissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommissions()
  }, [])

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
  ]

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  const filteredCommissions = commissions.filter((commission) => {
    const matchesStatus = selectedStatus === 'all' || commission.status === selectedStatus
    return matchesStatus
  })

  // Calculate performance metrics from commissions data
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const thisMonthCommissions = commissions.filter(c => {
    const commissionDate = new Date(c.date)
    return commissionDate.getMonth() === thisMonth && commissionDate.getFullYear() === thisYear
  })
  
  const thisMonthEarnings = thisMonthCommissions.reduce((sum, c) => sum + c.amount, 0)
  
  // Calculate monthly target progress (default target: $2000/month)
  const MONTHLY_TARGET = 2000
  const targetProgress = Math.min(100, Math.round((thisMonthEarnings / MONTHLY_TARGET) * 100))
  
  const stats = {
    totalEarned: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    pendingPayment: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    awaitingApproval: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    totalCommissions: commissions.length,
    averageCommission: commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.amount, 0) / commissions.length : 0,
    thisMonthEarnings,
    targetProgress,
    monthlyTarget: MONTHLY_TARGET,
  }

  const recentPayouts = commissions.filter(c => c.status === 'paid').slice(0, 3)

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </a>
          
          <div className="flex items-center gap-6">
            <a href="/dealer" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Dashboard</a>
            <a href="/dealer/products" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Products</a>
            <a href="/dealer/orders" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Orders</a>
            <a href="/dealer/commissions" className="text-zinc-100 text-sm font-medium">Commissions</a>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          {/* Page Header */}
          <AnimatedContent>
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Commissions" />
              </h1>
              <p className="text-zinc-400">
                Track your earnings and payout history
              </p>
            </div>
          </AnimatedContent>

          {/* Error State */}
          {error && (
            <AnimatedContent>
              <GlareHover glareColor="rgba(239, 68, 68, 0.2)" glareSize={300}>
                <div className="py-12 text-center p-8 bg-red-900/20 border border-red-800/50 rounded-xl backdrop-blur-sm mb-6">
                  <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">Failed to load commissions</h3>
                  <p className="text-zinc-400 mb-4">{error}</p>
                  <button
                    onClick={fetchCommissions}
                    className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 animate-pulse" />
                    <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-zinc-800 rounded mt-2 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Earned', value: stats.totalEarned, prefix: '$', gradient: 'from-emerald-600 to-emerald-400', badge: 'Lifetime' },
              { label: 'Pending Payment', value: stats.pendingPayment, prefix: '$', color: 'text-blue-400', badge: 'Awaiting', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { label: 'Awaiting Approval', value: stats.awaitingApproval, prefix: '$', color: 'text-amber-400', badge: 'Pending', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
              { label: 'Average', value: Math.round(stats.averageCommission), prefix: '$', color: 'text-zinc-100', badge: 'Per Order', badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
            ].map((stat, i) => (
              <AnimatedContent key={stat.label} delay={0.05 * i}>
                <GlareHover glareColor="rgba(16, 185, 129, 0.15)" glareSize={200}>
                  <div className={`p-5 rounded-xl border border-zinc-800/50 ${
                    stat.gradient ? `bg-gradient-to-br ${stat.gradient}` : 'bg-zinc-900/60 backdrop-blur-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      {stat.gradient ? (
                        <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : (
                        <div className={`w-6 h-6 rounded-lg ${stat.badgeColor} flex items-center justify-center`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-md border ${
                        stat.gradient ? 'bg-white/20 text-white' : stat.badgeColor
                      }`}>
                        {stat.badge}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.gradient ? 'text-white' : stat.color}`}>
                      {stat.prefix && <span className={stat.gradient ? 'text-white/70' : 'text-zinc-500'}>{stat.prefix}</span>}
                      <CountUp to={stat.value} duration={2} />
                    </div>
                    <div className={`text-xs mt-1 ${stat.gradient ? 'text-white/70' : 'text-zinc-500'}`}>
                      {stat.label}
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Commissions Table */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <AnimatedContent delay={0.2}>
                <GlareHover glareColor="rgba(16, 185, 129, 0.1)" glareSize={300}>
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Period Filter */}
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
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
                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>

              {/* Table */}
              <AnimatedContent delay={0.3}>
                <GlareHover glareColor="rgba(16, 185, 129, 0.1)" glareSize={400}>
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-800/30 border-b border-zinc-800">
                          <tr>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Commission</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Product</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Customer</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Status</th>
                            <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {filteredCommissions.map((commission) => (
                            <tr key={commission.id} className="hover:bg-zinc-800/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-zinc-100">{commission.id}</div>
                                <div className="text-xs text-zinc-500">Order: {commission.orderId}</div>
                                <div className="text-xs text-zinc-600">{commission.date}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-zinc-300 max-w-xs truncate">{commission.product}</div>
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                <div className="text-sm text-zinc-400">{commission.customer}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(commission.status)}`}>
                                  {commission.status}
                                </span>
                                {commission.paidDate && (
                                  <div className="text-xs text-zinc-500 mt-1">Paid: {commission.paidDate}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm font-semibold text-emerald-400">${commission.amount.toLocaleString()}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Empty State */}
                    {filteredCommissions.length === 0 && (
                      <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-zinc-100 mb-2">No commissions found</h3>
                        <p className="text-zinc-500">Try adjusting your filter criteria</p>
                      </div>
                    )}

                    {/* Footer */}
                    {filteredCommissions.length > 0 && (
                      <div className="bg-zinc-800/30 border-t border-zinc-800 px-6 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                          <div className="text-sm text-zinc-500">
                            Showing {filteredCommissions.length} commissions
                          </div>
                          <div className="text-sm text-zinc-500">
                            Total: <span className="font-semibold text-emerald-400">${filteredCommissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </GlareHover>
              </AnimatedContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Payouts */}
              <AnimatedContent delay={0.4}>
                <GlareHover glareColor="rgba(16, 185, 129, 0.1)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Payouts</h2>
                    {recentPayouts.length > 0 ? (
                      <div className="space-y-4">
                        {recentPayouts.map((payout) => (
                          <div key={payout.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                            <div>
                              <div className="text-sm font-medium text-zinc-100">{payout.id}</div>
                              <div className="text-xs text-zinc-500">{payout.paidDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-emerald-400">${payout.amount.toLocaleString()}</div>
                              <div className="text-xs text-zinc-500">{payout.product.substring(0, 15)}...</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No recent payouts</p>
                    )}
                  </div>
                </GlareHover>
              </AnimatedContent>

              {/* Commission Structure */}
              <AnimatedContent delay={0.5}>
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800/50 rounded-xl">
                  <h2 className="text-lg font-semibold text-zinc-100 mb-4">Commission Structure</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Standard Rate', value: '10%' },
                      { label: 'Premium Products', value: '12%' },
                      { label: 'Enterprise Deals', value: '15%' },
                    ].map((tier) => (
                      <div key={tier.label} className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">{tier.label}</span>
                        <span className="font-semibold text-zinc-100">{tier.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-2">Payout Schedule</div>
                    <div className="text-sm text-zinc-100">Net-30 terms</div>
                    <div className="text-xs text-zinc-500 mt-1">Commissions paid monthly</div>
                  </div>
                </div>
              </AnimatedContent>

              {/* Performance */}
              <AnimatedContent delay={0.6}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">Performance</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-400">Monthly Target</span>
                          <span className="font-semibold text-zinc-100">{stats.targetProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: `${stats.targetProgress}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-zinc-400">This Month</span>
                        <span className="text-lg font-bold text-zinc-100">${stats.thisMonthEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-500">Target</span>
                        <span className="text-sm text-zinc-500">${stats.monthlyTarget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  )
}
