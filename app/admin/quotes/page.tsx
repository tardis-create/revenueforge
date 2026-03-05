'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover
} from '@/app/components'

interface Quote {
  id: string
  rfq_id: string
  company_name: string
  contact_person: string
  email: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  total_amount: number
  valid_until: string
  created_at: string
  items: QuoteItem[]
}

interface QuoteItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Mock data - replace with API call
    const mockQuotes: Quote[] = [
      {
        id: 'QT-001',
        rfq_id: 'RFQ-2026-001',
        company_name: 'TechCorp Industries',
        contact_person: 'Sarah Chen',
        email: 'sarah@techcorp.com',
        status: 'sent',
        total_amount: 24500,
        valid_until: '2026-03-15',
        created_at: '2026-02-20',
        items: [
          { id: '1', product_name: 'Industrial Pump Assembly', quantity: 5, unit_price: 4500, total: 22500 },
          { id: '2', product_name: 'Installation Kit', quantity: 5, unit_price: 400, total: 2000 },
        ]
      },
      {
        id: 'QT-002',
        rfq_id: 'RFQ-2026-002',
        company_name: 'BuildRight Construction',
        contact_person: 'Mike Johnson',
        email: 'mike@buildright.com',
        status: 'accepted',
        total_amount: 18750,
        valid_until: '2026-03-10',
        created_at: '2026-02-18',
        items: [
          { id: '1', product_name: 'Heavy Duty Valve Set', quantity: 25, unit_price: 750, total: 18750 },
        ]
      },
      {
        id: 'QT-003',
        rfq_id: 'RFQ-2026-003',
        company_name: 'AquaFlow Systems',
        contact_person: 'Linda Park',
        email: 'linda@aquaflow.com',
        status: 'draft',
        total_amount: 32000,
        valid_until: '2026-03-20',
        created_at: '2026-02-25',
        items: [
          { id: '1', product_name: 'Centrifugal Pump System', quantity: 2, unit_price: 15000, total: 30000 },
          { id: '2', product_name: 'Control Panel', quantity: 2, unit_price: 1000, total: 2000 },
        ]
      },
      {
        id: 'QT-004',
        rfq_id: 'RFQ-2026-004',
        company_name: 'EnergyPlus Ltd',
        contact_person: 'David Kim',
        email: 'david@energyplus.com',
        status: 'rejected',
        total_amount: 8900,
        valid_until: '2026-02-28',
        created_at: '2026-02-15',
        items: [
          { id: '1', product_name: 'Motor Assembly Unit', quantity: 10, unit_price: 890, total: 8900 },
        ]
      },
    ]
    
    setQuotes(mockQuotes)
    setLoading(false)
  }, [])

  const filteredQuotes = filterStatus === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filterStatus)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      expired: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    }
    return styles[status] || styles.draft
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      draft: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      sent: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      accepted: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      expired: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    }
    return icons[status]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Radial glow */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <AnimatedContent>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Quotation Management" />
              </h1>
              <p className="text-zinc-400">
                Create, send, and track quotations
              </p>
            </div>
          </AnimatedContent>
            
            <AnimatedContent delay={0.1}>
              <ClickSpark sparkColor="#a855f7" sparkCount={8}>
                <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Quote
                </button>
              </ClickSpark>
            </AnimatedContent>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'All Quotes', value: quotes.length, color: 'text-zinc-100' },
              { label: 'Draft', value: quotes.filter(q => q.status === 'draft').length, color: 'text-zinc-400' },
              { label: 'Sent', value: quotes.filter(q => q.status === 'sent').length, color: 'text-blue-400' },
              { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length, color: 'text-emerald-400' },
              { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length, color: 'text-red-400' },
            ].map((stat, i) => (
              <AnimatedContent key={stat.label} delay={0.05 * i}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
                  <button
                    onClick={() => setFilterStatus(stat.label.toLowerCase().replace(' ', '_').replace('all_quotes', 'all'))}
                    className="w-full p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-zinc-600/50 transition-all text-left"
                  >
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                  </button>
                </GlareHover>
              </AnimatedContent>
            ))}
          </div>

          {/* Quotes Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredQuotes.length === 0 ? (
            <AnimatedContent>
              <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={300}>
                <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">No quotes found</h3>
                  <p className="text-zinc-500">Create your first quotation to get started.</p>
                </div>
              </GlareHover>
            </AnimatedContent>
          ) : (
            <AnimatedContent>
              <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={500}>
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Quote ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Valid Until
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {filteredQuotes.map((quote) => (
                          <tr key={quote.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-zinc-100">{quote.id}</div>
                              <div className="text-xs text-zinc-500">{quote.rfq_id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-zinc-100">{quote.company_name}</div>
                              <div className="text-xs text-zinc-500">{quote.contact_person}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-zinc-100">
                                {formatCurrency(quote.total_amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(quote.status)}`}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(quote.status)} />
                                </svg>
                                {quote.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-zinc-400">{quote.valid_until}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedQuote(quote)}
                                className="text-purple-400 hover:text-purple-300 mr-3 transition-colors text-sm"
                              >
                                View
                              </button>
                              <button className="text-zinc-400 hover:text-zinc-300 transition-colors text-sm">
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}
        </main>

        {/* Quote Detail Modal */}
        {selectedQuote && (
          <QuoteDetailModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
          />
        )}
    </div>
  )
}

function QuoteDetailModal({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

        <AnimatedContent>
          <div 
            className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">{quote.id}</h2>
                  <p className="text-sm text-zinc-500 mt-1">Reference: {quote.rfq_id}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Company</div>
                  <div className="text-sm font-medium text-zinc-100">{quote.company_name}</div>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Contact</div>
                  <div className="text-sm font-medium text-zinc-100">{quote.contact_person}</div>
                  <div className="text-xs text-zinc-500">{quote.email}</div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                  Line Items
                </h3>
                <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700/50">
                      {quote.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-zinc-100">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-zinc-400 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-100 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700">
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Total</td>
                        <td className="px-4 py-3 text-lg font-bold text-zinc-100 text-right">{formatCurrency(quote.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Created</div>
                  <div className="text-sm text-zinc-100">{quote.created_at}</div>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Valid Until</div>
                  <div className="text-sm text-zinc-100">{quote.valid_until}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
              <Magnet padding={30} magnetStrength={2}>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all"
                >
                  Close
                </button>
              </Magnet>
              <ClickSpark sparkColor="#a855f7" sparkCount={8}>
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all">
                  Download PDF
                </button>
              </ClickSpark>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
