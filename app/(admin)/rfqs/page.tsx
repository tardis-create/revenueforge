'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { 
  AnimatedContent, 
  EmptyState,
  BlurText
} from '@/app/components'

interface RFQ {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  service_type: string | null
  project_description: string | null
  quantity: number | null
  unit: string | null
  timeline: string | null
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export default function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchRfqs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await fetch(`${API_BASE_URL}/api/rfqs${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      const data: ApiResponse<RFQ[]> = await response.json()
      
      if (data.success && data.data) {
        setRfqs(data.data)
      } else {
        setError(data.error || 'Failed to load RFQs')
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err)
      setError('Failed to load RFQs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRfqs()
  }, [filterStatus])

  const handleStatusChange = async (rfqId: string, newStatus: 'reviewing' | 'quoted' | 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data: ApiResponse<RFQ> = await response.json()
      
      if (data.success && data.data) {
        setRfqs(rfqs.map(r => 
          r.id === rfqId ? data.data! : r
        ))
        
        if (selectedRfq?.id === rfqId) {
          setSelectedRfq(data.data)
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
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return styles[status] || styles.new
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      reviewing: 'Under Review',
      quoted: 'Quoted',
      accepted: 'Accepted',
      rejected: 'Rejected'
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                  <BlurText text="RFQ Management" />
                </h1>
                <p className="text-zinc-400">
                  Review and respond to Request for Quotations
                </p>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewing">Under Review</option>
                  <option value="quoted">Quoted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <button
                  onClick={fetchRfqs}
                  className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <AnimatedContent>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={fetchRfqs}
                className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
              >
                Try again
              </button>
            </div>
          </AnimatedContent>
        )}

        {/* Empty State */}
        {!loading && !error && rfqs.length === 0 && (
          <AnimatedContent delay={0.1}>
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0-2V5 01-2a2 2 0 012-2h5 1 0.586a1 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No RFQs found"
              description={filterStatus !== 'all' 
                ? `No RFQs with status "${getStatusLabel(filterStatus)}" were found.` 
                : "When customers submit RFQs, they'll appear here for review."
              }
            />
          </AnimatedContent>
        )}

        {/* RFQs List */}
        {!loading && !error && rfqs.length > 0 && (
          <AnimatedContent delay={0.1}>
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-zinc-700/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRfq(rfq)}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-100">
                          {rfq.company_name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(rfq.status)}`}>
                          {getStatusLabel(rfq.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-zinc-500">Contact:</span>
                          <span className="text-zinc-300 ml-2">{rfq.contact_name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Email:</span>
                          <span className="text-zinc-300 ml-2">{rfq.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Phone:</span>
                          <span className="text-zinc-300 ml-2">{rfq.phone || '-'}</span>
                        </div>
                        {rfq.quantity && (
                          <div>
                            <span className="text-zinc-500">Quantity:</span>
                            <span className="text-zinc-300 ml-2">{rfq.quantity} {rfq.unit}</span>
                          </div>
                        )}
                        {rfq.timeline && (
                          <div>
                            <span className="text-zinc-500">Timeline:</span>
                            <span className="text-zinc-300 ml-2">{rfq.timeline}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-500">Submitted:</span>
                          <span className="text-zinc-300 ml-2">{formatDate(rfq.created_at)}</span>
                        </div>
                      </div>
                      
                      {rfq.service_type && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/50">
                          <p className="text-sm text-zinc-400 line-clamp-2">
                            {rfq.service_type}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedContent>
        )}

        {/* RFQ Detail Modal */}
        {selectedRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedRfq(null)}
            />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <button
                onClick={() => setSelectedRfq(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-zinc-100">
                    {selectedRfq.company_name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedRfq.status)}`}>
                    {getStatusLabel(selectedRfq.status)}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">
                  Submitted on {formatDate(selectedRfq.created_at)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Contact Person
                    </label>
                    <p className="text-zinc-100">{selectedRfq.contact_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <p className="text-zinc-100">{selectedRfq.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Phone
                    </label>
                    <p className="text-zinc-100">{selectedRfq.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Timeline
                    </label>
                    <p className="text-zinc-100">{selectedRfq.timeline || '-'}</p>
                  </div>
                  {selectedRfq.quantity && (
                    <>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                          Quantity
                        </label>
                        <p className="text-zinc-100">{selectedRfq.quantity}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                          Unit
                        </label>
                        <p className="text-zinc-100">{selectedRfq.unit}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Product Requirements
                  </label>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-zinc-300 whitespace-pre-wrap">
                      {selectedRfq.service_type || '-'}
                    </p>
                  </div>
                </div>
                
                {selectedRfq.project_description && (
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Project Description
                    </label>
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-zinc-300 whitespace-pre-wrap">
                        {selectedRfq.project_description}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Status Actions */}
                <div className="pt-4 border-t border-zinc-800">
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedRfq.id, 'reviewing')}
                      disabled={selectedRfq.status === 'reviewing'}
                      className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRfq.id, 'quoted')}
                      disabled={selectedRfq.status === 'quoted'}
                      className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Quoted
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRfq.id, 'accepted')}
                      disabled={selectedRfq.status === 'accepted'}
                      className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Accepted
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRfq.id, 'rejected')}
                      disabled={selectedRfq.status === 'rejected'}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
