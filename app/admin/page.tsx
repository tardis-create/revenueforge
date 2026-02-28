'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, IndianRupee, Target } from 'lucide-react'
import { AnimatedContent, Breadcrumb, StatsCard } from '@/app/components'
import { fetchDashboardStats, type DashboardStatsData } from '@/lib/api/dashboard'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
              Dashboard
            </h1>
            <p className="text-zinc-400">
              Welcome to RevenueForge Admin
            </p>
          </AnimatedContent>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-zinc-800/50 rounded-lg w-12 h-12"></div>
                  <div className="w-16 h-4 bg-zinc-800 rounded"></div>
                </div>
                <div className="w-24 h-4 bg-zinc-800 rounded mb-2"></div>
                <div className="w-16 h-8 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={stats.totalLeads.title}
              value={stats.totalLeads.value}
              icon={<Users className="w-6 h-6 text-purple-400" />}
              trend={stats.totalLeads.trend}
              delay={stats.totalLeads.delay}
            />
            <StatsCard
              title={stats.activeQuotes.title}
              value={stats.activeQuotes.value}
              icon={<FileText className="w-6 h-6 text-cyan-400" />}
              trend={stats.activeQuotes.trend}
              delay={stats.activeQuotes.delay}
            />
            <StatsCard
              title={stats.revenue.title}
              value={stats.revenue.value}
              icon={<IndianRupee className="w-6 h-6 text-emerald-400" />}
              trend={stats.revenue.trend}
              delay={stats.revenue.delay}
            />
            <StatsCard
              title={stats.conversionRate.title}
              value={stats.conversionRate.value}
              icon={<Target className="w-6 h-6 text-amber-400" />}
              trend={stats.conversionRate.trend}
              delay={stats.conversionRate.delay}
            />
          </div>
        ) : null}

        {/* Recent Activity */}
        <AnimatedContent delay={0.5}>
          <div className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Recent Activity</h2>
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-zinc-500">No recent activity</p>
            </div>
          </div>
        </AnimatedContent>
      </main>
    </div>
  )
}
