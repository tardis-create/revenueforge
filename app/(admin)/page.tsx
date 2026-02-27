'use client'

import { AnimatedContent } from '@/app/components'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedContent delay={0.1}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-zinc-100">0</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.2}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-1">Pending RFQs</p>
              <p className="text-3xl font-bold text-zinc-100">0</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.3}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-1">Quotes Generated</p>
              <p className="text-3xl font-bold text-zinc-100">0</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.4}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-zinc-100">0</p>
            </div>
          </AnimatedContent>
        </div>

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
