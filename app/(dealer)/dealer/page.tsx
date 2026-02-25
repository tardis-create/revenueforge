'use client'

import { useEffect, useState } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover,
  CountUp
} from '@/app/components'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalCommission: number
  activeProducts: number
}

interface RecentOrder {
  id: string
  product: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
  date: string
}

export default function DealerDashboard() {
  const [stats] = useState<DashboardStats>({
    totalOrders: 47,
    pendingOrders: 8,
    totalRevenue: 128450,
    totalCommission: 12845,
    activeProducts: 24,
  })

  const [recentOrders] = useState<RecentOrder[]>([
    { id: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 4500, status: 'completed', date: '2026-02-25' },
    { id: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 3200, status: 'processing', date: '2026-02-24' },
    { id: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 2800, status: 'pending', date: '2026-02-24' },
    { id: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 5100, status: 'completed', date: '2026-02-23' },
    { id: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', amount: 1900, status: 'processing', date: '2026-02-22' },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
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
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </a>
          
          <div className="flex items-center gap-6">
            <a href="/dealer" className="text-zinc-100 text-sm font-medium">Dashboard</a>
            <a href="/dealer/products" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Products</a>
            <a href="/dealer/orders" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Orders</a>
            <a href="/dealer/commissions" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Commissions</a>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          {/* Page Header */}
          <AnimatedContent>
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Dealer Dashboard" />
              </h1>
              <p className="text-zinc-400">
                Welcome back! Here's your performance overview.
              </p>
            </div>
          </AnimatedContent>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders, change: '+12%', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'from-blue-600 to-blue-400' },
              { label: 'Pending Orders', value: stats.pendingOrders, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-amber-600 to-amber-400' },
              { label: 'Total Revenue', value: stats.totalRevenue, prefix: '$', change: '+18%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-600 to-emerald-400' },
              { label: 'Your Commission', value: stats.totalCommission, prefix: '$', change: '+15%', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-purple-600 to-purple-400' },
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
                      {stat.change && (
                        <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          {stat.change}
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
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <AnimatedContent delay={0.2}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={400}>
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-800">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-100">Recent Orders</h2>
                        <a href="/dealer/orders" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                          View all
                        </a>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-800/30">
                          <tr>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Order</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Product</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Customer</th>
                            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                            <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-zinc-100">{order.id}</div>
                                <div className="text-xs text-zinc-500">{order.date}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-zinc-300 max-w-xs truncate">{order.product}</div>
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                <div className="text-sm text-zinc-400">{order.customer}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm font-semibold text-zinc-100">${order.amount.toLocaleString()}</div>
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

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <AnimatedContent delay={0.3}>
                <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <a
                        href="/dealer/products"
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-100">Browse Products</div>
                          <div className="text-xs text-zinc-500">{stats.activeProducts} products available</div>
                        </div>
                      </a>
                      <a
                        href="/dealer/orders"
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-100">View Orders</div>
                          <div className="text-xs text-zinc-500">{stats.pendingOrders} pending orders</div>
                        </div>
                      </a>
                      <a
                        href="/dealer/commissions"
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all"
                      >
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
                </GlareHover>
              </AnimatedContent>

              {/* Performance Summary */}
              <AnimatedContent delay={0.4}>
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800/50 rounded-xl">
                  <h2 className="text-lg font-semibold text-zinc-100 mb-4">This Month</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Orders Placed</span>
                      <span className="font-semibold text-zinc-100">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Revenue Generated</span>
                      <span className="font-semibold text-zinc-100">$45,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Commission Earned</span>
                      <span className="font-semibold text-emerald-400">$4,520</span>
                    </div>
                    <div className="pt-4 border-t border-zinc-700">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Conversion Rate</span>
                        <span className="font-semibold text-zinc-100">68%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
