'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { AnimatedContent } from '@/app/components'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({ quotes: [], leads: [], products: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    const h = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    Promise.all([
      fetch(`${API_BASE_URL}/api/quotes`, { headers: h }).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE_URL}/api/leads`, { headers: h }).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE_URL}/api/products`).then(r => r.json()).catch(() => ({})),
    ]).then(([q, l, p]: any[]) => {
      setData({
        quotes: q.success ? q.data : (Array.isArray(q) ? q : []),
        leads: l.leads || [],
        products: p.products || [],
      })
      setLoading(false)
    })
  }, [])

  const totalPipeline = data.leads.reduce((s: number, l: any) => s + (l.estimated_value || 0), 0)
  const totalQuoteValue = data.quotes.reduce((s: number, q: any) => s + (q.amount || 0), 0)
  const wonLeads = data.leads.filter((l: any) => l.status === 'won').length
  const convRate = data.leads.length ? Math.round((wonLeads / data.leads.length) * 100) : 0

  const leadsByStatus = data.leads.reduce((acc: any, l: any) => {
    acc[l.status] = (acc[l.status] || 0) + 1; return acc
  }, {})

  const quotesByStatus = data.quotes.reduce((acc: any, q: any) => {
    acc[q.status] = (acc[q.status] || 0) + 1; return acc
  }, {})

  const fmt = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

  const kpis = [
    { label: 'Total Pipeline', value: loading ? '—' : fmt(totalPipeline), sub: `${data.leads.length} active leads`, color: '#6366f1' },
    { label: 'Quotes Issued', value: loading ? '—' : data.quotes.length, sub: fmt(totalQuoteValue) + ' total value', color: '#f59e0b' },
    { label: 'Conversion Rate', value: loading ? '—' : `${convRate}%`, sub: `${wonLeads} won / ${data.leads.length} total`, color: '#10b981' },
    { label: 'Products Listed', value: loading ? '—' : data.products.length, sub: 'Active catalog', color: '#ec4899' },
  ]

  const statusColors: Record<string, string> = {
    new: '#6366f1', contacted: '#f59e0b', qualified: '#3b82f6', rfq: '#a855f7',
    quoted: '#f97316', won: '#10b981', lost: '#ef4444',
    draft: '#6b7280', sent: '#3b82f6', accepted: '#10b981', rejected: '#ef4444',
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <header className="relative px-6 lg:px-12 py-8 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h1 className="text-3xl font-bold text-zinc-100 mb-1">Analytics</h1>
            <p className="text-zinc-400 text-sm">{loading ? 'Loading live data...' : 'Real-time pipeline intelligence'}</p>
          </AnimatedContent>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((k, i) => (
            <AnimatedContent key={k.label} delay={i * 0.08}>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full mb-3" style={{ background: k.color }} />
                <p className="text-xs text-zinc-400 mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-zinc-100 mb-0.5">{k.value}</p>
                <p className="text-xs text-zinc-500">{k.sub}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads by Stage */}
          <AnimatedContent delay={0.3}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <h2 className="text-base font-semibold text-zinc-100 mb-4">Lead Pipeline by Stage</h2>
              {loading ? <div className="text-zinc-500 text-sm">Loading...</div> :
                Object.entries(leadsByStatus).length === 0 ? <div className="text-zinc-500 text-sm">No leads yet</div> :
                <div className="space-y-3">
                  {Object.entries(leadsByStatus).map(([status, count]: [string, any]) => {
                    const total = data.leads.length || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300 capitalize">{status}</span>
                          <span className="text-zinc-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: statusColors[status] || '#6b7280' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              }
            </div>
          </AnimatedContent>

          {/* Quotes by Status */}
          <AnimatedContent delay={0.4}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <h2 className="text-base font-semibold text-zinc-100 mb-4">Quotes by Status</h2>
              {loading ? <div className="text-zinc-500 text-sm">Loading...</div> :
                data.quotes.length === 0 ? <div className="text-zinc-500 text-sm">No quotes yet</div> :
                <div className="space-y-3">
                  {Object.entries(quotesByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] || '#6b7280' }} />
                        <span className="text-sm text-zinc-300 capitalize">{status}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-100">{count}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800/50">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Total Quote Value</span>
                      <span className="text-zinc-200 font-medium">{fmt(totalQuoteValue)}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </AnimatedContent>

          {/* Top Leads by Value */}
          <AnimatedContent delay={0.5}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 lg:col-span-2">
              <h2 className="text-base font-semibold text-zinc-100 mb-4">Top Leads by Pipeline Value</h2>
              {loading ? <div className="text-zinc-500 text-sm">Loading...</div> :
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                        <th className="pb-2 pr-4">Company</th>
                        <th className="pb-2 pr-4">Contact</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 text-right">Est. Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leads
                        .filter((l: any) => l.estimated_value > 0)
                        .sort((a: any, b: any) => b.estimated_value - a.estimated_value)
                        .map((l: any) => (
                          <tr key={l.id} className="border-b border-zinc-800/50">
                            <td className="py-2 pr-4 text-zinc-200 font-medium">{l.company_name}</td>
                            <td className="py-2 pr-4 text-zinc-400">{l.contact_name || '—'}</td>
                            <td className="py-2 pr-4">
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: (statusColors[l.status] || '#6b7280') + '25', color: statusColors[l.status] || '#6b7280' }}>
                                {l.status}
                              </span>
                            </td>
                            <td className="py-2 text-right text-zinc-100 font-semibold">{fmt(l.estimated_value)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </AnimatedContent>
        </div>
      </main>
    </div>
  )
}
