'use client'

import { useState, useEffect } from 'react'
import { AnimatedContent, LiquidCard, LoadingSkeleton, CountUp } from '@/app/components'

interface DashboardStats {
  totalProducts: number
  activeRFQs: number
  pendingQuotes: number
  totalUsers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API
    setStats({
      totalProducts: 156,
      activeRFQs: 23,
      pendingQuotes: 12,
      totalUsers: 48,
    })
    setLoading(false)
  }, [])

  const statCards = stats ? [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Active RFQs',
      value: stats.activeRFQs,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/20',
      textColor: 'text-cyan-400'
    },
    {
      label: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400'
    }
  ] : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <AnimatedContent key={stat.label} delay={index * 0.1}>
              <LiquidCard glassIntensity="low" className={`bg-gradient-to-br ${stat.color} border ${stat.borderColor}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-zinc-100">
                      <CountUp to={stat.value} duration={1.5} />
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-zinc-800/50 ${stat.textColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </LiquidCard>
            </AnimatedContent>
          ))}
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <AnimatedContent delay={0.3}>
          <LiquidCard glassIntensity="low">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/products" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-zinc-300">Add Product</span>
              </a>
              <a href="/admin/rfqs" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-zinc-300">View RFQs</span>
              </a>
              <a href="/admin/quotes" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-zinc-300">Create Quote</span>
              </a>
              <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-zinc-300">Add User</span>
              </a>
            </div>
          </LiquidCard>
        </AnimatedContent>

        {/* Recent Activity */}
        <AnimatedContent delay={0.4}>
          <LiquidCard glassIntensity="low">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'New RFQ received', time: '2 minutes ago', icon: '📄', color: 'text-cyan-400' },
                { action: 'Quote approved', time: '15 minutes ago', icon: '✓', color: 'text-emerald-400' },
                { action: 'Product updated', time: '1 hour ago', icon: '📦', color: 'text-purple-400' },
                { action: 'New user registered', time: '3 hours ago', icon: '👤', color: 'text-amber-400' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors">
                  <span className={`text-lg ${activity.color}`}>{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{activity.action}</p>
                    <p className="text-xs text-zinc-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidCard>
        </AnimatedContent>
      </div>
    </div>
  )
}
