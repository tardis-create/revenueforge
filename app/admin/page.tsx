'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api'
import { AnimatedContent, CountUp, LoadingSkeleton, Breadcrumbs } from '@/app/components'

// Types
interface DashboardStats {
  totalProducts: number
  activeLeads: number
  openQuotes: number
  revenue: number
  leadsByStatus: LeadStatusData[]
  revenueTrend: RevenueTrendData[]
  // Trend data (percentage change from previous period)
  productsTrend?: number
  leadsTrend?: number
  quotesTrend?: number
  revenueTrendPercent?: number
}

interface LeadStatusData {
  status: string
  count: number
  color: string
}

interface RevenueTrendData {
  month: string
  revenue: number
}

interface ActivityItem {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: string | null
  timestamp: string
  user_name: string | null
}

// Dashboard stats skeleton
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <LoadingSkeleton variant="avatar" />
          </div>
          <LoadingSkeleton variant="text" className="w-20 h-3 mb-2" />
          <LoadingSkeleton variant="text" className="w-16 h-8" />
        </div>
      ))}
    </div>
  )
}

// Chart skeleton
function ChartSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <LoadingSkeleton variant="text" className="w-32 h-5 mb-6" />
      <div className="h-48 flex items-end justify-around gap-2">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="w-8 h-full" variant="card" />
        ))}
      </div>
    </div>
  )
}

// Activity skeleton
function ActivitySkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <LoadingSkeleton variant="text" className="w-32 h-5 mb-6" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-3 bg-zinc-800/30 rounded-lg">
            <LoadingSkeleton variant="avatar" className="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" className="w-3/4 h-4" />
              <LoadingSkeleton variant="text" className="w-1/4 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple bar chart component
function BarChart({ data, title }: { data: LeadStatusData[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">{title}</h3>
      <div className="h-48 flex items-end justify-around gap-4">
        {data.map((item, index) => (
          <div key={item.status} className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.count / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className={`w-full max-w-12 rounded-t-lg ${item.color}`}
              style={{ minHeight: item.count > 0 ? '8px' : '0' }}
            />
            <span className="text-xs text-zinc-400 capitalize">{item.status}</span>
            <span className="text-sm font-semibold text-zinc-100">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple line chart component
function LineChart({ data, title }: { data: RevenueTrendData[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.revenue), 1)
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (item.revenue / maxValue) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">{title}</h3>
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0" y1={y} x2="100" y2={y}
              stroke="rgba(63, 63, 70, 0.5)"
              strokeWidth="0.5"
            />
          ))}
          {/* Line */}
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            points={points}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (item.revenue / maxValue) * 80
            return (
              <motion.circle
                key={item.month}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                cx={x}
                cy={y}
                r="2"
                fill="#a855f7"
              />
            )
          })}
        </svg>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-zinc-500">
          {data.map(item => (
            <span key={item.month}>{item.month}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Activity item component
function ActivityItemComponent({ item, index }: { item: ActivityItem; index: number }) {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )
      case 'update':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )
      case 'delete':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors"
    >
      {getActionIcon(item.action)}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-100">
          <span className="font-medium capitalize">{item.action}</span>
          {' '}in{' '}
          <span className="text-purple-400">{item.resource_type}</span>
        </p>
        {item.details && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{item.details}</p>
        )}
      </div>
      <span className="text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.timestamp)}</span>
    </motion.div>
  )
}

// Trend indicator component
function TrendIndicator({ trend }: { trend?: number }) {
  if (trend === undefined || trend === null) return null
  
  const isPositive = trend >= 0
  const color = isPositive ? 'text-emerald-400' : 'text-red-400'
  const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'
  const arrow = isPositive ? (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} ${color}`}>
      {arrow}
      <span className="text-xs font-medium">{Math.abs(trend)}%</span>
    </div>
  )
}

// KPI Card component with trend indicator
function KPICard({ 
  title, 
  value, 
  icon, 
  color, 
  prefix = '', 
  delay = 0,
  trend
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  prefix?: string
  delay?: number
  trend?: number
}) {
  return (
    <AnimatedContent delay={delay}>
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-zinc-700/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <TrendIndicator trend={trend} />
        </div>
        <p className="text-sm text-zinc-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-zinc-100">
          {prefix}<CountUp to={value} duration={1.5} />
        </p>
      </div>
    </AnimatedContent>
  )
}

// Quick action button component
function QuickAction({ 
  href, 
  label, 
  icon, 
  delay = 0 
}: { 
  href: string
  label: string
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <AnimatedContent delay={delay}>
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-medium text-zinc-100">{label}</span>
          <svg className="w-5 h-5 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </Link>
    </AnimatedContent>
  )
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeLeads: 0,
    openQuotes: 0,
    revenue: 0,
    leadsByStatus: [],
    revenueTrend: []
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Dashboard' }
  ]

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get JWT token from cookies
        const cookies = document.cookie.split('; ')
        const tokenCookie = cookies.find(c => c.startsWith('token=') || c.startsWith('jwt='))
        const token = tokenCookie?.split('=')[1]

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Try to fetch from dashboard API
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
            headers,
            credentials: 'include'
          })
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json() as { success: boolean; data: DashboardStats }
            if (statsData.success && statsData.data) {
              setStats(statsData.data)
            }
          }
        } catch (apiError) {
          console.warn('Dashboard API not available, using products API:', apiError)
          
          // Fallback: fetch products from API
          const productsResponse = await fetch(`${API_BASE_URL}/api/products?limit=1`)
          const productsData = await productsResponse.json() as { pagination?: { total: number } }
          
          setStats(prev => ({
            ...prev,
            totalProducts: productsData.pagination?.total || 0
          }))
        }

        // Try to fetch recent activity
        try {
          const activityResponse = await fetch(`${API_BASE_URL}/api/dashboard/activity?limit=10`, {
            headers,
            credentials: 'include'
          })
          
          if (activityResponse.ok) {
            const activityData = await activityResponse.json() as { success: boolean; data: ActivityItem[] }
            if (activityData.success && activityData.data) {
              setRecentActivity(activityData.data)
            }
          }
        } catch (activityError) {
          console.warn('Activity API not available:', activityError)
        }

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} className="mb-4" />
            
            {/* Page Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
              Dashboard
            </h1>
            <p className="text-zinc-400">
              Welcome to RevenueForge Admin
            </p>
          </AnimatedContent>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Products"
              value={stats.totalProducts}
              delay={0.1}
              color="bg-purple-500/10"
              trend={stats.productsTrend}
              icon={
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <KPICard
              title="Active Leads"
              value={stats.activeLeads}
              delay={0.2}
              color="bg-cyan-500/10"
              trend={stats.leadsTrend}
              icon={
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <KPICard
              title="Open Quotes"
              value={stats.openQuotes}
              delay={0.3}
              color="bg-emerald-500/10"
              trend={stats.quotesTrend}
              icon={
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <KPICard
              title="Total Revenue"
              value={stats.revenue}
              delay={0.4}
              prefix="$"
              color="bg-amber-500/10"
              trend={stats.revenueTrendPercent}
              icon={
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Quick Actions */}
        <AnimatedContent delay={0.5}>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction
                href="/products"
                label="New Product"
                delay={0.55}
                icon={
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              />
              <QuickAction
                href="/quotes"
                label="New Quote"
                delay={0.6}
                icon={
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <QuickAction
                href="/leads"
                label="View Leads"
                delay={0.65}
                icon={
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </AnimatedContent>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <BarChart 
                data={stats.leadsByStatus.length > 0 ? stats.leadsByStatus : [
                  { status: 'new', count: 0, color: 'bg-blue-500/60' },
                  { status: 'contacted', count: 0, color: 'bg-amber-500/60' },
                  { status: 'qualified', count: 0, color: 'bg-purple-500/60' },
                  { status: 'proposal', count: 0, color: 'bg-cyan-500/60' },
                  { status: 'won', count: 0, color: 'bg-emerald-500/60' },
                  { status: 'lost', count: 0, color: 'bg-zinc-500/60' },
                ]} 
                title="Leads by Status" 
              />
              <LineChart 
                data={stats.revenueTrend.length > 0 ? stats.revenueTrend : [
                  { month: 'Sep', revenue: 0 },
                  { month: 'Oct', revenue: 0 },
                  { month: 'Nov', revenue: 0 },
                  { month: 'Dec', revenue: 0 },
                  { month: 'Jan', revenue: 0 },
                  { month: 'Feb', revenue: 0 },
                ]} 
                title="Revenue Trend (6 Months)" 
              />
            </>
          )}
        </div>

        {/* Recent Activity */}
        <AnimatedContent delay={0.7}>
          <div className="mt-8">
            {loading ? (
              <ActivitySkeleton />
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-zinc-100">Recent Activity</h2>
                  <span className="text-xs text-zinc-500">Last 10 actions</span>
                </div>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-zinc-500">No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map((item, index) => (
                      <ActivityItemComponent key={item.id} item={item} index={index} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </AnimatedContent>
      </main>
    </div>
  )
}
