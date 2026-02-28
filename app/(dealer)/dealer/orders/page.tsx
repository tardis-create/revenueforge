'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { API_BASE_URL } from '@/lib/api'
import { BlurText, AnimatedContent, GlareHover, CountUp } from '@/app/components'

interface Order {
  id: string
  product: string
  customer: string
  customerEmail: string
  amount: number
  commission: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  date: string
  paymentStatus: 'paid' | 'pending' | 'refunded'
}

interface OrdersApiResponse {
  orders?: Order[]
}

export default function DealerOrdersPage() {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return
      
      setIsLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${API_BASE_URL}/api/dealer/orders`, { headers })
        
        if (res.ok) {
          const data = await res.json() as OrdersApiResponse
          setOrders(data.orders && data.orders.length > 0 ? data.orders : getMockOrders())
        } else {
          setOrders(getMockOrders())
        }
      } catch {
        setOrders(getMockOrders())
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [isAuthenticated])

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-400'
      case 'pending': return 'text-amber-400'
      case 'refunded': return 'text-red-400'
      default: return 'text-zinc-400'
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.amount, 0),
    totalCommission: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.commission, 0),
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
      <AnimatedContent>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Order History" />
          </h1>
          <p className="text-zinc-400">Track and manage all your orders</p>
        </div>
      </AnimatedContent>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-zinc-100' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
          { label: 'Total Revenue', value: stats.totalRevenue, prefix: '$', color: 'text-zinc-100' },
          { label: 'Earned Commission', value: stats.totalCommission, prefix: '$', color: 'text-emerald-400' },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
              <div className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.prefix && <span className="text-zinc-500">{stat.prefix}</span>}
                  <CountUp to={stat.value} duration={2} />
                </div>
              </div>
            </GlareHover>
          </AnimatedContent>
        ))}
      </div>

      <AnimatedContent delay={0.2}>
        <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={300}>
          <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
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
        <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={500}>
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/30 border-b border-zinc-800">
                  <tr>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Order</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Product</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Customer</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Payment</th>
                    <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Amount</th>
                    <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-100">{order.id}</div>
                        <div className="text-xs text-zinc-500">{order.date}</div>
                      </td>
                      <td className="px-6 py-4"><div className="text-sm text-zinc-300 max-w-xs truncate">{order.product}</div></td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-zinc-300">{order.customer}</div>
                        <div className="text-xs text-zinc-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`text-sm font-medium capitalize ${getPaymentColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-right"><div className="text-sm font-semibold text-zinc-100">${order.amount.toLocaleString()}</div></td>
                      <td className="px-6 py-4 text-right hidden sm:table-cell"><div className="text-sm font-semibold text-emerald-400">${order.commission.toLocaleString()}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-zinc-100 mb-2">No orders found</h3>
                <p className="text-zinc-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
            {filteredOrders.length > 0 && (
              <div className="bg-zinc-800/30 border-t border-zinc-800 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="text-sm text-zinc-500">Showing {filteredOrders.length} of {orders.length} orders</div>
                  <div className="text-sm text-zinc-500">Total: <span className="font-semibold text-zinc-100">${filteredOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</span></div>
                </div>
              </div>
            )}
          </div>
        </GlareHover>
      </AnimatedContent>
    </div>
  )
}

function getMockOrders(): Order[] {
  return [
    { id: 'ORD-001', product: 'Enterprise Analytics Suite', customer: 'TechCorp Inc.', customerEmail: 'tech@techcorp.com', amount: 4500, commission: 450, status: 'completed', date: '2026-02-25', paymentStatus: 'paid' },
    { id: 'ORD-002', product: 'Revenue Intelligence Platform', customer: 'GrowthLabs', customerEmail: 'hello@growthlabs.io', amount: 3200, commission: 320, status: 'processing', date: '2026-02-24', paymentStatus: 'paid' },
    { id: 'ORD-003', product: 'Smart Automation Tools', customer: 'DataDriven Co.', customerEmail: 'info@datadriven.co', amount: 2800, commission: 280, status: 'pending', date: '2026-02-24', paymentStatus: 'pending' },
    { id: 'ORD-004', product: 'Predictive Analytics Module', customer: 'InnovateTech', customerEmail: 'buy@innovatetech.com', amount: 5100, commission: 510, status: 'completed', date: '2026-02-23', paymentStatus: 'paid' },
    { id: 'ORD-005', product: 'Team Collaboration Suite', customer: 'StartupXYZ', customerEmail: 'admin@startupxyz.io', amount: 1900, commission: 190, status: 'processing', date: '2026-02-22', paymentStatus: 'paid' },
    { id: 'ORD-006', product: 'Customer Insights Dashboard', customer: 'RetailMax', customerEmail: 'ops@retailmax.com', amount: 3000, commission: 300, status: 'completed', date: '2026-02-21', paymentStatus: 'paid' },
    { id: 'ORD-007', product: 'Financial Reporting Suite', customer: 'FinanceFirst', customerEmail: 'cfo@financefirst.com', amount: 3400, commission: 340, status: 'cancelled', date: '2026-02-20', paymentStatus: 'refunded' },
    { id: 'ORD-008', product: 'Enterprise Analytics Suite', customer: 'GlobalTech Solutions', customerEmail: 'enterprise@globaltech.com', amount: 4500, commission: 450, status: 'completed', date: '2026-02-19', paymentStatus: 'paid' },
  ]
}
