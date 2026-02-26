'use client'

import { useState } from 'react'
import { AnimatedContent, LiquidCard, SpringButton } from '@/app/components'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'RevenueForge',
    email: 'admin@revenueforge.com',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
    notifications: true,
    autoApproveQuotes: false
  })

  const handleSave = () => {
    // Mock save - replace with actual API
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure your admin preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <AnimatedContent>
          <LiquidCard glassIntensity="low">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Admin Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </div>
          </LiquidCard>
        </AnimatedContent>

        {/* Notification Settings */}
        <AnimatedContent delay={0.1}>
          <LiquidCard glassIntensity="low">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <div>
                  <p className="text-sm font-medium text-zinc-100">Email Notifications</p>
                  <p className="text-xs text-zinc-500">Receive email alerts for new RFQs</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-purple-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <div>
                  <p className="text-sm font-medium text-zinc-100">Auto-Approve Quotes</p>
                  <p className="text-xs text-zinc-500">Automatically approve quotes under threshold</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoApproveQuotes: !settings.autoApproveQuotes })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoApproveQuotes ? 'bg-purple-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoApproveQuotes ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </LiquidCard>
        </AnimatedContent>

        {/* Danger Zone */}
        <AnimatedContent delay={0.2} className="lg:col-span-2">
          <LiquidCard glassIntensity="low" className="border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/20">
              <div>
                <p className="text-sm font-medium text-zinc-100">Delete All Data</p>
                <p className="text-xs text-zinc-500">Permanently delete all products, RFQs, and quotes</p>
              </div>
              <SpringButton
                variant="secondary"
                onClick={() => {
                  if (confirm('Are you sure? This action cannot be undone.')) {
                    alert('Data deletion requested')
                  }
                }}
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                Delete Data
              </SpringButton>
            </div>
          </LiquidCard>
        </AnimatedContent>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <SpringButton variant="primary" onClick={handleSave}>
          Save Changes
        </SpringButton>
      </div>
    </div>
  )
}
