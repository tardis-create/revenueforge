'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { AnimatedContent } from '@/app/components'

interface DashboardStats {
  products: number
  rfqs: number
  leads: number
  quotes: number
  users: number
  recentRfqs: any[]
  recentLeads: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, rfqs: 0, leads: 0, quotes: 0, users: 0, recentRfqs: [], recentLeads: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    const h = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE_URL}/api/products`, { headers: h }).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE_URL}/api/rfqs`, { headers: h }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/api/leads`, { headers: h }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/api/quotes`, { headers: h }).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/api/users`, { headers: h }).then(r => r.json()).catch(() => ({})),
    ]).then((results: unknown[]) => {
      const [prods, rfqs, leads, quotes, users] = results as any[]
      const productList = prods.data || prods.products || (Array.isArray(prods) ? prods : [])
      const rfqList = rfqs.rfqs || rfqs.data || (Array.isArray(rfqs) ? rfqs : [])
      const leadList = leads.leads || leads.data || (Array.isArray(leads) ? leads : [])
      const quoteList = (quotes.success ? quotes.data : null) || quotes.quotes || (Array.isArray(quotes) ? quotes : [])
      const userList = users.users || users.data || (Array.isArray(users) ? users : [])
      setStats({
        products: productList.length,
        rfqs: rfqList.length,
        leads: leadList.length,
        quotes: quoteList.length,
        users: userList.length,
        recentRfqs: rfqList.slice(0, 5),
        recentLeads: leadList.slice(0, 5),
      })
      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products, color: 'purple', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Pending RFQs', value: stats.rfqs, color: 'cyan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Active Leads', value: stats.leads, color: 'emerald', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Quotes Generated', value: stats.quotes, color: 'amber', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { label: 'Users', value: stats.users, color: 'pink', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  const colorMap: Record<string, string> = {
    purple: 'bg-purple-500/10 text-purple-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    pink: 'bg-pink-500/10 text-pink-400',
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400',
      reviewing: 'bg-yellow-500/20 text-yellow-400',
      quoted: 'bg-purple-500/20 text-purple-400',
      accepted: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      contacted: 'bg-cyan-500/20 text-cyan-400',
    }
    return colors[status] || 'bg-zinc-500/20 text-zinc-400'
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      <header className="relative px-6 lg:px-12 py-8 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h1 className="text-3xl font-bold text-zinc-100 mb-1">Dashboard</h1>
            <p className="text-zinc-400 text-sm">{loading ? 'Loading live data...' : 'Live data from your RevenueForge backend'}</p>
          </AnimatedContent>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24 lg:pb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((s, i) => (
            <AnimatedContent key={s.label} delay={i * 0.08}>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[s.color]}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
                <p className="text-xs text-zinc-400 mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-100">{loading ? '—' : s.value}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent RFQs */}
          <AnimatedContent delay={0.3}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-100">Recent RFQs</h2>
                <a href="/rfqs" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">View all →</a>
              </div>
              {loading ? <div className="text-zinc-500 text-sm">Loading...</div> :
                stats.recentRfqs.length === 0 ? <div className="text-zinc-500 text-sm">No RFQs yet</div> :
                <div className="space-y-3">
                  {stats.recentRfqs.map((rfq: any) => (
                    <div key={rfq.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{rfq.company_name}</p>
                        <p className="text-xs text-zinc-500">{rfq.service_type || 'General'} · {rfq.contact_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(rfq.status)}`}>{rfq.status}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          </AnimatedContent>

          {/* Recent Leads */}
          <AnimatedContent delay={0.4}>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-100">Recent Leads</h2>
                <a href="/leads" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">View all →</a>
              </div>
              {loading ? <div className="text-zinc-500 text-sm">Loading...</div> :
                stats.recentLeads.length === 0 ? <div className="text-zinc-500 text-sm">No leads yet</div> :
                <div className="space-y-3">
                  {stats.recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{lead.company_name}</p>
                        <p className="text-xs text-zinc-500">{lead.contact_name} · ₹{Number(lead.estimated_value || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(lead.status)}`}>{lead.status}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          </AnimatedContent>
        </div>
      </main>
    </div>
  )
}
