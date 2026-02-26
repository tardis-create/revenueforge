'use client'

import { useState } from 'react'
import { AnimatedContent, LiquidCard } from '@/app/components'

interface NotificationRule { id: string; name: string; trigger: string; channels: string[]; isActive: boolean }

export default function AdminNotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([
    { id: '1', name: 'New RFQ Alert', trigger: 'RFQ Received', channels: ['email', 'whatsapp'], isActive: true },
    { id: '2', name: 'Quote Sent Confirmation', trigger: 'Quote Sent', channels: ['email'], isActive: true },
    { id: '3', name: 'Order Confirmation', trigger: 'Order Placed', channels: ['email', 'whatsapp'], isActive: true },
    { id: '4', name: 'Quote Accepted - Internal', trigger: 'Quote Accepted', channels: ['email'], isActive: false },
  ])
  const logs = [
    { id: '1', rule: 'New RFQ Alert', recipient: 'sales@company.com', channel: 'email', status: 'delivered', time: '2026-02-26 10:45' },
    { id: '2', rule: 'Quote Sent Confirmation', recipient: 'sarah@techcorp.com', channel: 'email', status: 'sent', time: '2026-02-26 09:30' },
    { id: '3', rule: 'Order Confirmation', recipient: 'mike@buildright.com', channel: 'email', status: 'delivered', time: '2026-02-25 16:20' },
    { id: '4', rule: 'Quote Accepted', recipient: 'finance@company.com', channel: 'email', status: 'failed', time: '2026-02-25 14:15' },
  ]

  const toggleRule = (id: string) => setRules(rules.map(rule => rule.id === id ? { ...rule, isActive: !rule.isActive } : rule))
  const getStatusBadge = (status: string) => ({ sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20', delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', failed: 'bg-red-500/10 text-red-400 border-red-500/20' }[status] || 'bg-blue-500/10 text-blue-400')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">Notifications</h1><p className="text-zinc-400 mt-1">Configure triggers</p></div>
        <button className="px-5 py-2.5 bg-purple-600 border border-purple-500/30 rounded-lg text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Rule
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Active Rules', value: rules.filter(r => r.isActive).length, color: 'text-emerald-400' }, { label: 'Emails Today', value: 24, color: 'text-blue-400' }, { label: 'WhatsApp Today', value: 18, color: 'text-green-400' }].map(stat => (
          <div key={stat.label} className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl"><div className="text-2xl font-bold text-zinc-100">{stat.value}</div><div className={`text-xs ${stat.color}`}>{stat.label}</div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Active Rules</h2>
          <div className="space-y-3">
            {rules.map((rule, i) => (
              <AnimatedContent key={rule.id} delay={0.05 * i}>
                <div className={`p-5 bg-zinc-900/60 border rounded-xl ${rule.isActive ? 'border-zinc-800/50' : 'border-zinc-800/30 opacity-60'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-zinc-100">{rule.name}</h3><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400">{rule.trigger}</span></div>
                      <div className="flex gap-2">{rule.channels.map(channel => <span key={channel} className="px-2 py-1 rounded bg-zinc-800/50 text-xs text-zinc-400">{channel}</span>)}</div>
                    </div>
                    <button onClick={() => toggleRule(rule.id)} className={`relative w-11 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-purple-600' : 'bg-zinc-700'}`}><span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Recent Activity</h2>
          <LiquidCard glassIntensity="low" className="overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {logs.map(log => (
                <div key={log.id} className="p-4 hover:bg-zinc-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.channel === 'email' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                        <svg className={`w-4 h-4 ${log.channel === 'email' ? 'text-blue-400' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-medium text-zinc-100">{log.rule}</div><div className="text-xs text-zinc-500 truncate">{log.recipient}</div></div>
                    </div>
                    <div className="text-right"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(log.status)}`}>{log.status}</span><div className="text-xs text-zinc-600 mt-1">{log.time}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </LiquidCard>
        </div>
      </div>
    </div>
  )
}
