'use client'

import { useState, useEffect } from 'react'
import {
  BlurText,
  AnimatedContent,
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover,
  SpringButton
} from '@/app/components'
import { generateInvoicePDF, downloadPDF } from '@/lib/pdf-generator'
import { useSettings } from '@/lib/use-settings'
import type { Invoice } from '@/lib/pdf-generator'

interface InvoiceItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  total: number
}

const DEFAULT_TERMS = `1. Payment terms: Net 30 days from invoice date.
2. Late payment fee: 1.5% per month on overdue amounts.
3. Goods remain property of seller until payment is received in full.
4. Any disputes must be raised within 14 days of invoice date.
5. Taxes: Applicable taxes are included unless otherwise noted.`

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { branding } = useSettings()

  useEffect(() => {
    // Mock data - replace with API call
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        quote_id: 'QT-001',
        company_name: 'TechCorp Industries',
        contact_person: 'Sarah Chen',
        email: 'sarah@techcorp.com',
        phone: '+1-555-0123',
        status: 'pending',
        subtotal: 23000,
        tax_rate: 18,
        tax_amount: 4140,
        total_amount: 27140,
        due_date: '2026-04-20',
        created_at: '2026-03-20',
        paid_date: null,
        terms: DEFAULT_TERMS,
        notes: 'Payment expected by due date.',
        items: [
          { id: '1', product_id: 'p1', product_name: 'Industrial Pump Assembly', quantity: 5, unit_price: 4500, discount_percent: 0, discount_amount: 0, total: 22500 },
          { id: '2', product_id: 'p2', product_name: 'Installation Kit', quantity: 5, unit_price: 400, discount_percent: 25, discount_amount: 100, total: 1500 },
        ]
      },
      {
        id: 'INV-002',
        quote_id: 'QT-002',
        company_name: 'BuildRight Construction',
        contact_person: 'Mike Johnson',
        email: 'mike@buildright.com',
        phone: '+1-555-0456',
        status: 'paid',
        subtotal: 17500,
        tax_rate: 18,
        tax_amount: 3150,
        total_amount: 20650,
        due_date: '2026-03-25',
        created_at: '2026-02-25',
        paid_date: '2026-03-20',
        terms: DEFAULT_TERMS,
        notes: '',
        items: [
          { id: '1', product_id: 'p3', product_name: 'Heavy Duty Valve Set', quantity: 25, unit_price: 750, discount_percent: 7, discount_amount: 52.5, total: 17500 },
        ]
      },
      {
        id: 'INV-003',
        quote_id: null,
        company_name: 'AquaFlow Systems',
        contact_person: 'Linda Park',
        email: 'linda@aquaflow.com',
        phone: '+1-555-0789',
        status: 'overdue',
        subtotal: 30000,
        tax_rate: 18,
        tax_amount: 5400,
        total_amount: 35400,
        due_date: '2026-03-15',
        created_at: '2026-02-15',
        paid_date: null,
        terms: DEFAULT_TERMS,
        notes: 'Follow up required - payment overdue.',
        items: [
          { id: '1', product_id: 'p4', product_name: 'Centrifugal Pump System', quantity: 2, unit_price: 15000, discount_percent: 0, discount_amount: 0, total: 30000 },
        ]
      },
      {
        id: 'INV-004',
        quote_id: null,
        company_name: 'Global Manufacturing Co',
        contact_person: 'Emma Wilson',
        email: 'emma@globalmfg.com',
        phone: '+1-555-0654',
        status: 'cancelled',
        subtotal: 12000,
        tax_rate: 18,
        tax_amount: 2160,
        total_amount: 14160,
        due_date: '2026-03-10',
        created_at: '2026-02-10',
        paid_date: null,
        terms: DEFAULT_TERMS,
        notes: 'Order cancelled by customer.',
        items: [
          { id: '1', product_id: 'p6', product_name: 'Control Panel Module', quantity: 4, unit_price: 3000, discount_percent: 0, discount_amount: 0, total: 12000 },
        ]
      },
    ]

    setInvoices(mockInvoices)
    setLoading(false)
  }, [])

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter(i => i.status === filterStatus)

  const handleStatusChange = async (invoiceId: string, newStatus: 'pending' | 'paid' | 'overdue' | 'cancelled') => {
    setInvoices(invoices.map(i =>
      i.id === invoiceId ? { ...i, status: newStatus } : i
    ))

    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus })
    }

    // In production, this would trigger an API call
    console.log(`Invoice ${invoiceId} status changed to ${newStatus}`)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    }
    return styles[status] || styles.pending
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      paid: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      overdue: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      cancelled: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
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
                <BlurText text="Invoice Management" />
              </h1>
              <p className="text-zinc-400">
                Create, send, and track invoices
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
                Create Invoice
              </button>
            </ClickSpark>
          </AnimatedContent>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All Invoices', value: invoices.length, color: 'text-zinc-100' },
            { label: 'Pending', value: invoices.filter(i => i.status === 'pending').length, color: 'text-amber-400' },
            { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, color: 'text-emerald-400' },
            { label: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length, color: 'text-red-400' },
            { label: 'Cancelled', value: invoices.filter(i => i.status === 'cancelled').length, color: 'text-zinc-400' },
          ].map((stat, i) => (
            <AnimatedContent key={stat.label} delay={0.05 * i}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
                <button
                  onClick={() => setFilterStatus(stat.label.toLowerCase().replace('all_invoices', 'all'))}
                  className="w-full p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-zinc-600/50 transition-all text-left"
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                </button>
              </GlareHover>
            </AnimatedContent>
          ))}
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <AnimatedContent>
            <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={300}>
              <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-zinc-100 mb-2">No invoices found</h3>
                <p className="text-zinc-500">Create your first invoice to get started.</p>
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
                          Invoice ID
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
                          Due Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-zinc-100">{invoice.id}</div>
                            <div className="text-xs text-zinc-500">{invoice.quote_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-zinc-100">{invoice.company_name}</div>
                            <div className="text-xs text-zinc-500">{invoice.contact_person}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-zinc-100">
                              {formatCurrency(invoice.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(invoice.status)}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(invoice.status)} />
                              </svg>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-400">{invoice.due_date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="text-purple-400 hover:text-purple-300 mr-3 transition-colors text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={async () => {
                                const pdfBytes = await generateInvoicePDF(invoice, branding)
                                downloadPDF(pdfBytes, `Invoice-${invoice.id}.pdf`)
                              }}
                              className="text-zinc-400 hover:text-zinc-300 transition-colors text-sm"
                            >
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onStatusChange={handleStatusChange}
          branding={branding}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newInvoice) => {
            setInvoices([...invoices, newInvoice])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function InvoiceDetailModal({
  invoice,
  onClose,
  onStatusChange,
  branding
}: {
  invoice: Invoice
  onClose: () => void
  onStatusChange: (id: string, status: 'pending' | 'paid' | 'overdue' | 'cancelled') => void
  branding: any
}) {
  const [actionLoading, setActionLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAction = async (action: 'paid' | 'overdue' | 'cancelled') => {
    setActionLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onStatusChange(invoice.id, action)
    setActionLoading(false)
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const pdfBytes = await generateInvoicePDF(invoice, branding)
      downloadPDF(pdfBytes, `Invoice-${invoice.id}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
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
                  <h2 className="text-2xl font-bold text-zinc-100">{invoice.id}</h2>
                  <p className="text-sm text-zinc-500 mt-1">Reference: {invoice.quote_id}</p>
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
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Company</div>
                    <div className="text-sm font-medium text-zinc-100">{invoice.company_name}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Contact</div>
                    <div className="text-sm font-medium text-zinc-100">{invoice.contact_person}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</div>
                    <a href={`mailto:${invoice.email}`} className="text-sm text-purple-400 hover:text-purple-300">
                      {invoice.email}
                    </a>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</div>
                    <a href={`tel:${invoice.phone}`} className="text-sm text-zinc-100">
                      {invoice.phone}
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
                          <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Discount</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-700/50">
                        {invoice.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-zinc-100">{item.product_name}</td>
                            <td className="px-4 py-3 text-sm text-zinc-400 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-3 text-sm text-zinc-400 text-right">
                              {item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-zinc-100 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="text-zinc-300">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Tax ({invoice.tax_rate}%)</span>
                      <span className="text-zinc-300">{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-700">
                      <span className="text-zinc-100">Total Due</span>
                      <span className="text-zinc-100">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                  Terms &amp; Conditions
                </h3>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-sans">
                    {invoice.terms}
                  </pre>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                    Notes
                  </h3>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <p className="text-sm text-zinc-400">{invoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Created</div>
                  <div className="text-sm text-zinc-100">{invoice.created_at}</div>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Due Date</div>
                  <div className="text-sm text-zinc-100">{invoice.due_date}</div>
                </div>
                {invoice.paid_date && (
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Paid Date</div>
                    <div className="text-sm text-zinc-100">{invoice.paid_date}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex flex-wrap justify-end gap-3 border-t border-zinc-800">
              {invoice.status === 'pending' && (
                <>
                  <SpringButton
                    variant="secondary"
                    onClick={() => handleAction('cancelled')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </SpringButton>
                  <SpringButton
                    variant="primary"
                    onClick={() => handleAction('paid')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actionLoading ? 'Marking...' : 'Mark Paid'}
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
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {downloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </ClickSpark>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}

// Placeholder CreateInvoiceModal component
function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (invoice: any) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-zinc-100 mb-4">Create Invoice</h2>
        <p className="text-zinc-400 mb-6">Invoice creation form coming soon.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
