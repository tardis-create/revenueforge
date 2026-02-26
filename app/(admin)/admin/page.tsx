'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

interface RecentLead {
  id: string
  company_name: string
  contact_person: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  created_at: string
}

interface RecentQuote {
  id: string
  company_name: string
  total_amount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  created_at: string
}

interface RevenueData {
  date: string
  revenue: number
}

// Simple SVG Bar Chart Component
function RevenueChart({ data }: { data: RevenueData[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-40 gap-1">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100
          return (
            <div 
              key={item.date} 
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div 
                className="w-full bg-gradient-to-t from-purple-600/80 to-cyan-500/80 rounded-t-sm transition-all duration-300 hover:from-purple-500 hover:to-cyan-400 relative group"
                style={{ height: `${Math.max(height, 4)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${item.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        <span>{data[0]?.date || ''}</span>
        <span>{data[data.length - 1]?.date || ''}</span>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Mock data for recent leads
    setRecentLeads([
      { id: 'LD-001', company_name: 'TechCorp Industries', contact_person: 'Sarah Chen', status: 'qualified', created_at: '2026-02-27' },
      { id: 'LD-002', company_name: 'BuildRight Construction', contact_person: 'Mike Johnson', status: 'proposal', created_at: '2026-02-26' },
      { id: 'LD-003', company_name: 'AquaFlow Systems', contact_person: 'Linda Park', status: 'new', created_at: '2026-02-26' },
      { id: 'LD-004', company_name: 'EnergyPlus Ltd', contact_person: 'David Kim', status: 'contacted', created_at: '2026-02-25' },
      { id: 'LD-005', company_name: 'Global Manufacturing Co', contact_person: 'Emma Wilson', status: 'won', created_at: '2026-02-24' },
    ])
    
    // Mock data for recent quotes
    setRecentQuotes([
      { id: 'QT-001', company_name: 'TechCorp Industries', total_amount: 24500, status: 'sent', created_at: '2026-02-27' },
      { id: 'QT-002', company_name: 'BuildRight Construction', total_amount: 18750, status: 'accepted', created_at: '2026-02-26' },
      { id: 'QT-003', company_name: 'AquaFlow Systems', total_amount: 32000, status: 'draft', created_at: '2026-02-25' },
      { id: 'QT-004', company_name: 'EnergyPlus Ltd', total_amount: 8900, status: 'rejected', created_at: '2026-02-24' },
      { id: 'QT-005', company_name: 'Precision Tools Inc', total_amount: 15600, status: 'sent', created_at: '2026-02-23' },
    ])
    
    // Mock revenue data for last 30 days
    const today = new Date()
    const revenue: RevenueData[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      revenue.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 25000) + 5000
      })
    }
    setRevenueData(revenue)
  }, [])

  const metrics: DashboardMetric[] = [
    { label: 'Total Leads', value: 156, change: 12.5, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Total Quotes', value: 89, change: 8.3, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Total Revenue', value: 485200, change: 15.2, prefix: '$', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Conversion Rate', value: 24.5, change: 3.8, suffix: '%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Create Quote', href: '/admin/quotes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'View Leads', href: '/admin/leads', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Manage Dealers', href: '/admin/dealers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      proposal: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lost: 'bg-zinc-800 text-zinc-500 border-zinc-700',
      draft: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      expired: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    }
    return styles[status] || styles.new
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!mounted) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Dashboard Overview" />
          </h1>
          <p className="text-zinc-400">
            Welcome back! Here&apos;s what&apos;s happening with your business.
          </p>
        </AnimatedContent>
      </div>

      {/* KPI Cards */}
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

      {/* Revenue Chart - Last 30 Days */}
      <AnimatedContent delay={0.2}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Revenue - Last 30 Days
            </h2>
            <span className="text-xs text-zinc-500">
              Total: ${revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </span>
          </div>
          <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={500}>
            <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <RevenueChart data={revenueData} />
            </div>
          </GlareHover>
        </div>
      </AnimatedContent>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Leads Widget */}
        <AnimatedContent delay={0.3}>
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Recent Leads
              </h2>
              <Link href="/admin/leads" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </Link>
            </div>
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={200}>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm divide-y divide-zinc-800/50">
                {recentLeads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    href="/admin/leads"
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-100 truncate">{lead.company_name}</div>
                      <div className="text-xs text-zinc-500">{lead.contact_person}</div>
                    </div>
                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </Link>
                ))}
              </div>
            </GlareHover>
          </div>
        </AnimatedContent>

        {/* Recent Quotes Widget */}
        <AnimatedContent delay={0.35}>
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Recent Quotes
              </h2>
              <Link href="/admin/quotes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </Link>
            </div>
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={200}>
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm divide-y divide-zinc-800/50">
                {recentQuotes.map((quote) => (
                  <Link 
                    key={quote.id} 
                    href="/admin/quotes"
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-100 truncate">{quote.company_name}</div>
                      <div className="text-xs text-zinc-500">{quote.id}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-semibold text-zinc-100">{formatCurrency(quote.total_amount)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadge(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlareHover>
          </div>
        </AnimatedContent>

        {/* Quick Actions */}
        <AnimatedContent delay={0.4}>
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <GlareHover key={action.label} glareColor="rgba(6, 182, 212, 0.1)" glareSize={200}>
                  <Link
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
                  </Link>
                </GlareHover>
              ))}
            </div>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
