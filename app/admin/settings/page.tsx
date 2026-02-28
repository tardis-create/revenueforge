'use client'

import { AnimatedContent } from '@/app/components'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
              Settings
            </h1>
            <p className="text-zinc-400">
              Configure your marketplace settings
            </p>
          </AnimatedContent>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        <AnimatedContent delay={0.1}>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Site Name</label>
                <input
                  type="text"
                  defaultValue="RevenueForge"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Support Email</label>
                <input
                  type="email"
                  placeholder="support@revenueforge.com"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </AnimatedContent>
      </main>
    </div>
  )
}
