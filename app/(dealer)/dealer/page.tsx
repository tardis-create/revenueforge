'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent, 
  GlareHover,
  CountUp
} from '@/app/components'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalCommission: number
  activeProducts: number
  conversionRate: number
}

interface RecentOrder {
  id: string
  product: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  date: string
  commission: number
}

interface Activity {
  id: string
  type: 'order' | 'commission' | 'product'
  message: string
  amount?: number
  date: string
}

interface OrdersResponse {
  orders?: RecentOrder[]
}

interface ProductsResponse {
  products?: unknown[]
  length?: number
}

interface CommissionsResponse {
  totalCommission?: number
}

export default function DealerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCommission: 0,
    activeProducts: 0,
    conversionRate: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return
      
      setIsLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Try to fetch from API
        const [ordersRes, productsRes, commissionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dealer/orders`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/products`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/dealer/commissions`, { headers }).catch(() => null),
        ])

        let orders: RecentOrder[] = []
        let productsCount = 0
        let totalCommission = 0

        if (ordersRes?.ok) {
          const data = await ordersRes.json() as OrdersResponse
          orders = data.orders || []
        } else {
          // Fallback to mock data
          orders = getMockOrders()
        }

        if (productsRes?.ok) {
          const data = await productsRes.json() as ProductsResponse
          productsCount = data.products?.length || data.length || 0
        } else {
          productsCount = 24 // Mock count
        }

        if (commissionsRes?.ok) {
          const data = await commissionsRes.json() as CommissionsResponse
          totalCommission = data.totalCommission || 0
        } else {
          totalCommission = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.commission || o.amount * 0.1), 0)
        }

        // Calculate stats
        const completedOrders = orders.filter(o => o.status === 'completed')
        const pendingOrders = orders.filter(o => o.status === 'pending')
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0)

        setStats({
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          totalRevenue,
          totalCommission,
          activeProducts: productsCount,
          conversionRate: orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0,
        })

        setRecentOrders(orders.slice(0, 5))

        // Generate activity feed
        setRecentActivity([
          { id: '1', type: 'order', message: 'New order received', amount: orders[0]?.amount, date: orders[0]?.date || 'Today' },
          { id: '2', type: 'commission', message: 'Commission paid', amount: 450, date: 'Yesterday' },
          { id: '3', type: 'product', message: 'New product added to catalog', date: '2 days ago' },
        ])

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Use mock data on error
        const mockOrders = getMockOrders()
        setStats({
          totalOrders: mockOrders.length,
          pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
          totalRevenue: mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
          totalCommission: 12845,
          activeProducts: 24,
          conversionRate: 68,
        })
        setRecentOrders(mockOrders.slice(0, 5))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AnimatedContent>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text={`Welcome back, ${user?.name?.split(' ')[0] || 'Dealer'}!`} />
          </h1>
          <p className="text-zinc-400">
            Here&apos;s your performance overview for today.
          </p>
        </div>
      </AnimatedContent>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <Link href="/dealer/orders" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                      View all →
                    </Link>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <AnimatedContent delay={0.3}>
            <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={200}>
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/dealer/products"
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
                  </Link>
                  <Link href="/dealer/orders"
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
                  </Link>
                  <Link href="/dealer/commissions"
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
                  </Link>
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
                  <span className="font-semibold text-zinc-100">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Revenue Generated</span>
                  <span className="font-semibold text-zinc-100">${stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Commission Earned</span>
                  <span className="font-semibold text-emerald-400">${stats.totalCommission.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Conversion Rate</span>
                    <span className="font-semibold text-zinc-100">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </div>
    </div>
  )
}

// Mock data fallback
function getMockOrders(): RecentOrder[] {
  return [
    { id: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', amount: 4500, status: 'completed', date: '2026-02-25', commission: 450 },
    { id: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', amount: 3200, status: 'processing', date: '2026-02-24', commission: 320 },
    { id: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', amount: 2800, status: 'pending', date: '2026-02-24', commission: 280 },
    { id: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', amount: 5100, status: 'completed', date: '2026-02-23', commission: 510 },
    { id: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', amount: 1900, status: 'processing', date: '2026-02-22', commission: 190 },
  ]
}
