'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  CountUp,
  GlareHover
} from '@/app/components'

interface DashboardMetric {
  label: string
  value: number
  change: number
  prefix?: string
  suffix?: string
  icon: string
}

interface RecentActivity {
  id: string
  type: 'rfq' | 'quote' | 'order' | 'dealer'
  message: string
  time: string
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const metrics: DashboardMetric[] = [
    { label: 'Total Revenue', value: 485200, change: 12.5, prefix: '$', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Active Quotes', value: 24, change: 8.3, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Pending Leads', value: 18, change: -5.2, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Active Dealers', value: 12, change: 15.0, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ]

  const recentActivity: RecentActivity[] = [
    { id: '1', type: 'rfq', message: 'New RFQ received from TechCorp Industries', time: '2 hours ago' },
    { id: '2', type: 'quote', message: 'Quote QT-001 accepted by BuildRight Construction', time: '4 hours ago' },
    { id: '3', type: 'order', message: 'Order ORD-045 placed by AquaFlow Systems', time: '5 hours ago' },
    { id: '4', type: 'dealer', message: 'New dealer application from Industrial Supply Co', time: '8 hours ago' },
    { id: '5', type: 'quote', message: 'Quote QT-003 sent to EnergyPlus Ltd', time: '12 hours ago' },
  ]

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Create Quote', href: '/admin/quotes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'View Leads', href: '/admin/leads', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Manage Dealers', href: '/admin/dealers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ]

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      rfq: { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'bg-amber-500/10 text-amber-400' },
      quote: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-purple-500/10 text-purple-400' },
      order: { icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'bg-cyan-500/10 text-cyan-400' },
      dealer: { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-emerald-500/10 text-emerald-400' },
    }
    return icons[type] || icons.rfq
  }

  if (!mounted) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Dashboard" />
          </h1>
          <p className="text-zinc-400">
            Welcome back! Here&apos;s what&apos;s happening with your business.
          </p>
        </AnimatedContent>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, i) => (
          <AnimatedContent key={metric.label} delay={0.05 * i}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
              <div className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={metric.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    metric.change >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-zinc-100">
                  {metric.prefix && <span className="text-zinc-500">{metric.prefix}</span>}
                  <CountUp to={metric.value} duration={2} />
                  {metric.suffix && <span className="text-zinc-500">{metric.suffix}</span>}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{metric.label}</div>
              </div>
            </GlareHover>
          </AnimatedContent>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <AnimatedContent delay={0.2}>
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action, i) => (
                <GlareHover key={action.label} glareColor="rgba(6, 182, 212, 0.1)" glareSize={200}>
                  <a
                    href={action.href}
                    className="flex items-center gap-4 p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-zinc-600/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                      <svg className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                      </svg>
                    </div>
                    <span className="font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">{action.label}</span>
                    <svg className="w-5 h-5 text-zinc-600 ml-auto group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </GlareHover>
              ))}
            </div>
          </div>
        </AnimatedContent>

        {/* Recent Activity */}
        <AnimatedContent delay={0.3}>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Recent Activity
              </h2>
              <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </a>
            </div>
            
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={300}>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <div className="divide-y divide-zinc-800/50">
                  {recentActivity.map((activity, i) => {
                    const { icon, color } = getActivityIcon(activity.type)
                    return (
                      <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-zinc-100">{activity.message}</div>
                          <div className="text-xs text-zinc-500 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlareHover>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
