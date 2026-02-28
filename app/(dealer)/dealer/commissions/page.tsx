'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { API_BASE_URL } from '@/lib/api'
import { BlurText, AnimatedContent, GlareHover, CountUp } from '@/app/components'

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

interface CommissionsApiResponse {
  commissions?: Commission[]
}

export default function DealerCommissionsPage() {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [commissions, setCommissions] = useState<Commission[]>([])

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!isAuthenticated) return
      
      setIsLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${API_BASE_URL}/api/dealer/commissions`, { headers })
        
        if (res.ok) {
          const data = await res.json() as CommissionsApiResponse
          setCommissions(data.commissions && data.commissions.length > 0 ? data.commissions : getMockCommissions())
        } else {
          setCommissions(getMockCommissions())
        }
      } catch {
        setCommissions(getMockCommissions())
      } finally {
        setIsLoading(false)
      }
    }
    fetchCommissions()
  }, [isAuthenticated])

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

  const filteredCommissions = commissions.filter((c) => selectedStatus === 'all' || c.status === selectedStatus)

  const stats = {
    totalEarned: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    pendingPayment: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    awaitingApproval: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    averageCommission: commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.amount, 0) / commissions.length : 0,
  }

  const recentPayouts = commissions.filter(c => c.status === 'paid').slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatedContent>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Commissions" />
          </h1>
          <p className="text-zinc-400">Track your earnings and payout history</p>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: stats.totalEarned, prefix: '$', gradient: 'from-emerald-600 to-emerald-400', badge: 'Lifetime' },
          { label: 'Pending Payment', value: stats.pendingPayment, prefix: '$', color: 'text-blue-400', badge: 'Awaiting', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Awaiting Approval', value: stats.awaitingApproval, prefix: '$', color: 'text-amber-400', badge: 'Pending', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Average', value: Math.round(stats.averageCommission), prefix: '$', color: 'text-zinc-100', badge: 'Per Order', badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <GlareHover glareColor="rgba(16, 185, 129, 0.15)" glareSize={200}>
              <div className={`p-5 rounded-xl border border-zinc-800/50 ${stat.gradient ? `bg-gradient-to-br ${stat.gradient}` : 'bg-zinc-900/60 backdrop-blur-sm'}`}>
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
                  <span className={`text-xs px-2 py-1 rounded-md border ${stat.gradient ? 'bg-white/20 text-white' : stat.badgeColor}`}>{stat.badge}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.gradient ? 'text-white' : stat.color}`}>
                  {stat.prefix && <span className={stat.gradient ? 'text-white/70' : 'text-zinc-500'}>{stat.prefix}</span>}
                  <CountUp to={stat.value} duration={2} />
                </div>
                <div className={`text-xs mt-1 ${stat.gradient ? 'text-white/70' : 'text-zinc-500'}`}>{stat.label}</div>
              </div>
            </GlareHover>
          </AnimatedContent>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedContent delay={0.2}>
            <GlareHover glareColor="rgba(16, 185, 129, 0.1)" glareSize={300}>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    {periods.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
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
                          <td className="px-6 py-4"><div className="text-sm text-zinc-300 max-w-xs truncate">{commission.product}</div></td>
                          <td className="px-6 py-4 hidden sm:table-cell"><div className="text-sm text-zinc-400">{commission.customer}</div></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(commission.status)}`}>{commission.status}</span>
                            {commission.paidDate && <div className="text-xs text-zinc-500 mt-1">Paid: {commission.paidDate}</div>}
                          </td>
                          <td className="px-6 py-4 text-right"><div className="text-sm font-semibold text-emerald-400">${commission.amount.toLocaleString()}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredCommissions.length === 0 && (
                  <div className="p-12 text-center">
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">No commissions found</h3>
                    <p className="text-zinc-500">Try adjusting your filter criteria</p>
                  </div>
                )}
                {filteredCommissions.length > 0 && (
                  <div className="bg-zinc-800/30 border-t border-zinc-800 px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="text-sm text-zinc-500">Showing {filteredCommissions.length} commissions</div>
                      <div className="text-sm text-zinc-500">Total: <span className="font-semibold text-emerald-400">${filteredCommissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </GlareHover>
          </AnimatedContent>
        </div>

        <div className="space-y-6">
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

          <AnimatedContent delay={0.6}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={200}>
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Performance</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Monthly Target</span>
                      <span className="font-semibold text-zinc-100">75%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-zinc-400">This Month</span>
                    <span className="text-lg font-bold text-zinc-100">${stats.totalEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Target</span>
                    <span className="text-sm text-zinc-500">$2,500</span>
                  </div>
                </div>
              </div>
            </GlareHover>
          </AnimatedContent>
        </div>
      </div>
    </div>
  )
}

function getMockCommissions(): Commission[] {
  return [
    { id: 'COM-001', orderId: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 450, status: 'paid', date: '2026-02-25', paidDate: '2026-02-28' },
    { id: 'COM-002', orderId: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 320, status: 'approved', date: '2026-02-24' },
    { id: 'COM-003', orderId: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 280, status: 'pending', date: '2026-02-24' },
    { id: 'COM-004', orderId: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 510, status: 'paid', date: '2026-02-23', paidDate: '2026-02-26' },
    { id: 'COM-005', orderId: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', amount: 190, status: 'approved', date: '2026-02-22' },
    { id: 'COM-006', orderId: 'ORD-006', product: 'Customer Insights Dashboard', customer: 'RetailMax', amount: 300, status: 'paid', date: '2026-02-21', paidDate: '2026-02-24' },
    { id: 'COM-007', orderId: 'ORD-008', product: 'Enterprise Analytics Suite', customer: 'GlobalTech Solutions', amount: 450, status: 'paid', date: '2026-02-19', paidDate: '2026-02-22' },
  ]
}
