'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent,
  Magnet,
  ClickSpark,
  GlareHover,
  SpringButton
} from '@/app/components'

interface QuoteItem {
  id: string
  quote_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
  product_name?: string
}

interface Quote {
  id: string
  rfq_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  amount: number
  currency: string
  validity_days: number
  valid_until: string
  terms: string | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  pdf_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  items: QuoteItem[]
}

interface RFQ {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  status: string
  created_at: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const DEFAULT_TERMS = `1. Prices are valid for 30 days from the quote date.
2. Payment terms: Net 30 days from invoice date.
3. Delivery: Within 2-4 weeks from order confirmation.
4. Warranty: 12 months from delivery date.
5. Taxes: Applicable taxes extra unless mentioned otherwise.`

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await fetch(`${API_BASE_URL}/api/quotes${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      const data: ApiResponse<Quote[]> = await response.json()
      
      if (data.success && data.data) {
        setQuotes(data.data)
      } else {
        setError(data.error || 'Failed to load quotes')
      }
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError('Failed to load quotes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [filterStatus])

  const handleStatusChange = async (quoteId: string, newStatus: 'sent' | 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data: ApiResponse<Quote> = await response.json()
      
      if (data.success && data.data) {
        setQuotes(quotes.map(q => 
          q.id === quoteId ? data.data! : q
        ))
        
        if (selectedQuote?.id === quoteId) {
          setSelectedQuote(data.data)
        }
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
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
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Quote
              </button>
            </ClickSpark>
          </AnimatedContent>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All Quotes', value: quotes.length, color: 'text-zinc-100', filter: 'all' },
            { label: 'Draft', value: quotes.filter(q => q.status === 'draft').length, color: 'text-zinc-400', filter: 'draft' },
            { label: 'Sent', value: quotes.filter(q => q.status === 'sent').length, color: 'text-blue-400', filter: 'sent' },
            { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length, color: 'text-emerald-400', filter: 'accepted' },
            { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length, color: 'text-red-400', filter: 'rejected' },
          ].map((stat, i) => (
            <AnimatedContent key={stat.label} delay={0.05 * i}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
                <button
                  onClick={() => setFilterStatus(stat.filter)}
                  className={`w-full p-4 bg-zinc-900/60 border rounded-xl backdrop-blur-sm hover:border-zinc-600/50 transition-all text-left ${
                    filterStatus === stat.filter ? 'border-purple-500/50' : 'border-zinc-800/50'
                  }`}
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                </button>
              </GlareHover>
            </AnimatedContent>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <AnimatedContent>
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={fetchQuotes}
                className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
              >
                Try again
              </button>
            </div>
          </AnimatedContent>
        )}

        {/* Quotes Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
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
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-zinc-100">{quote.id}</div>
                            <div className="text-xs text-zinc-500">{quote.rfq_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-zinc-100">{quote.company_name || 'N/A'}</div>
                            <div className="text-xs text-zinc-500">{quote.contact_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-zinc-100">
                              {formatCurrency(quote.amount, quote.currency)}
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
                            <div className="text-sm text-zinc-400">{formatDate(quote.valid_until)}</div>
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
          onStatusChange={handleStatusChange}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Create Quote Modal */}
      {showCreateModal && (
        <CreateQuoteModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newQuote) => {
            setQuotes([...quotes, newQuote])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function QuoteDetailModal({ 
  quote, 
  onClose, 
  onStatusChange,
  formatCurrency,
  formatDate
}: { 
  quote: Quote
  onClose: () => void
  onStatusChange: (id: string, status: 'sent' | 'accepted' | 'rejected') => void
  formatCurrency: (amount: number, currency?: string) => string
  formatDate: (dateStr: string) => string
}) {
  const [actionLoading, setActionLoading] = useState(false)

  const handleAction = async (action: 'sent' | 'accepted' | 'rejected') => {
    setActionLoading(true)
    await onStatusChange(quote.id, action)
    setActionLoading(false)
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
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Company</div>
                    <div className="text-sm font-medium text-zinc-100">{quote.company_name || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Contact</div>
                    <div className="text-sm font-medium text-zinc-100">{quote.contact_name || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</div>
                    <a href={`mailto:${quote.email}`} className="text-sm text-purple-400 hover:text-purple-300">
                      {quote.email || 'N/A'}
                    </a>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</div>
                    <a href={`tel:${quote.phone}`} className="text-sm text-zinc-100">
                      {quote.phone || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                  Line Items
                </h3>
                <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
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
                        {quote.items && quote.items.length > 0 ? (
                          quote.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm text-zinc-100">{item.product_name || item.description}</td>
                              <td className="px-4 py-3 text-sm text-zinc-400 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCurrency(item.unit_price, quote.currency)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-zinc-100 text-right">{formatCurrency(item.total_price, quote.currency)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-zinc-500 text-center">No items</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-700">
                      <span className="text-zinc-100">Total</span>
                      <span className="text-zinc-100">{formatCurrency(quote.amount, quote.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {quote.terms && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                    Terms &amp; Conditions
                  </h3>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-sans">
                      {quote.terms}
                    </pre>
                  </div>
                </div>
              )}

              {/* Notes */}
              {quote.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                    Notes
                  </h3>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <p className="text-sm text-zinc-400">{quote.notes}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Created</div>
                  <div className="text-sm text-zinc-100">{formatDate(quote.created_at)}</div>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Valid Until</div>
                  <div className="text-sm text-zinc-100">{formatDate(quote.valid_until)}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex flex-wrap justify-end gap-3 border-t border-zinc-800">
              {quote.status === 'draft' && (
                <SpringButton
                  variant="primary"
                  onClick={() => handleAction('sent')}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {actionLoading ? 'Sending...' : 'Send to Customer'}
                </SpringButton>
              )}
              {quote.status === 'sent' && (
                <>
                  <SpringButton
                    variant="secondary"
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Mark Rejected
                  </SpringButton>
                  <SpringButton
                    variant="primary"
                    onClick={() => handleAction('accepted')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Accepted
                  </SpringButton>
                </>
              )}
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

// CreateQuoteModal with RFQ selection
function CreateQuoteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (quote: Quote) => void }) {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRFQ, setSelectedRFQ] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leads?status=new,reviewing`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        const data: ApiResponse<RFQ[]> = await response.json()
        if (data.success && data.data) {
          setRfqs(data.data.filter((rfq: RFQ) => rfq.status !== 'quoted'))
        }
      } catch (err) {
        console.error('Error fetching RFQs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRFQs()
  }, [])

  const handleSubmit = async () => {
    if (!selectedRFQ) {
      alert('Please select an RFQ')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          rfq_id: selectedRFQ,
          validity_days: 30,
          terms: DEFAULT_TERMS,
          items: []
        })
      })

      const data: ApiResponse<Quote> = await response.json()
      if (data.success && data.data) {
        onSuccess(data.data)
      } else {
        alert(data.error || 'Failed to create quote')
      }
    } catch (err) {
      console.error('Error creating quote:', err)
      alert('Failed to create quote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-zinc-100 mb-4">Create Quote</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rfqs.length === 0 ? (
          <p className="text-zinc-400 mb-6">No RFQs available to quote. Create an RFQ first.</p>
        ) : (
          <>
            <p className="text-zinc-400 mb-4">Select an RFQ to create a quote:</p>
            <select
              value={selectedRFQ}
              onChange={(e) => setSelectedRFQ(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 mb-6"
            >
              <option value="">Select an RFQ...</option>
              {rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id}>
                  {rfq.company_name} - {rfq.contact_name} ({rfq.id})
                </option>
              ))}
            </select>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          {!loading && rfqs.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedRFQ}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Quote'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
