'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  DataTableSkeleton,
  ApiError,
  useToast
} from '@/app/components'

interface Lead {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  industry: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  source: string
  dealer_id: string | null
  dealer_name: string | null
  created_at: string
  notes: string
  activities: LeadActivity[]
}

interface LeadActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change'
  description: string
  created_at: string
  created_by: string
}

type ViewMode = 'kanban' | 'list'

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const
type Stage = typeof STAGES[number]

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  contacted: { label: 'Contacted', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  qualified: { label: 'Qualified', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  proposal: { label: 'Proposal', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  won: { label: 'Won', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  lost: { label: 'Lost', color: 'text-zinc-500', bgColor: 'bg-zinc-800/50' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDealer, setFilterDealer] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [newActivityNote, setNewActivityNote] = useState('')
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const { error: showError } = useToast()

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data - replace with API call
      const mockLeads: Lead[] = [
        {
          id: 'LD-001',
          company_name: 'TechCorp Industries',
          contact_person: 'Sarah Chen',
          email: 'sarah@techcorp.com',
          phone: '+1-555-0123',
          industry: 'Manufacturing',
          status: 'qualified',
          source: 'Website',
          dealer_id: 'D-001',
          dealer_name: 'Alpha Distributors',
          created_at: '2026-02-24',
          notes: 'Interested in industrial pumps. Budget confirmed.',
          activities: [
            { id: 'A1', type: 'call', description: 'Initial discovery call - interested in pump systems', created_at: '2026-02-24 10:30', created_by: 'John Smith' },
            { id: 'A2', type: 'email', description: 'Sent product catalog and pricing', created_at: '2026-02-25 14:00', created_by: 'John Smith' },
            { id: 'A3', type: 'status_change', description: 'Status changed from Contacted to Qualified', created_at: '2026-02-26 09:15', created_by: 'System' },
          ]
        },
        {
          id: 'LD-002',
          company_name: 'BuildRight Construction',
          contact_person: 'Mike Johnson',
          email: 'mike@buildright.com',
          phone: '+1-555-0456',
          industry: 'Construction',
          status: 'proposal',
          source: 'Referral',
          dealer_id: 'D-002',
          dealer_name: 'Beta Supply Co',
          created_at: '2026-02-22',
          notes: 'Proposal sent. Awaiting response.',
          activities: [
            { id: 'A4', type: 'meeting', description: 'Site visit to assess requirements', created_at: '2026-02-22 11:00', created_by: 'Jane Doe' },
            { id: 'A5', type: 'note', description: 'Large project - needs bulk pricing', created_at: '2026-02-23 16:00', created_by: 'Jane Doe' },
          ]
        },
        {
          id: 'LD-003',
          company_name: 'AquaFlow Systems',
          contact_person: 'Linda Park',
          email: 'linda@aquaflow.com',
          phone: '+1-555-0789',
          industry: 'Water Treatment',
          status: 'new',
          source: 'LinkedIn',
          dealer_id: null,
          dealer_name: null,
          created_at: '2026-02-26',
          notes: 'New lead from LinkedIn campaign.',
          activities: [
            { id: 'A6', type: 'note', description: 'Lead captured from LinkedIn ad campaign', created_at: '2026-02-26 08:00', created_by: 'System' },
          ]
        },
        {
          id: 'LD-004',
          company_name: 'EnergyPlus Ltd',
          contact_person: 'David Kim',
          email: 'david@energyplus.com',
          phone: '+1-555-0321',
          industry: 'Energy',
          status: 'contacted',
          source: 'Trade Show',
          dealer_id: 'D-001',
          dealer_name: 'Alpha Distributors',
          created_at: '2026-02-20',
          notes: 'Initial contact made. Follow-up scheduled.',
          activities: [
            { id: 'A7', type: 'call', description: 'Met at Industrial Expo 2026', created_at: '2026-02-20 15:00', created_by: 'John Smith' },
            { id: 'A8', type: 'email', description: 'Follow-up email sent', created_at: '2026-02-21 09:00', created_by: 'John Smith' },
          ]
        },
        {
          id: 'LD-005',
          company_name: 'Global Manufacturing Co',
          contact_person: 'Emma Wilson',
          email: 'emma@globalmfg.com',
          phone: '+1-555-0654',
          industry: 'Manufacturing',
          status: 'won',
          source: 'Website',
          dealer_id: 'D-003',
          dealer_name: 'Gamma Industrial',
          created_at: '2026-02-15',
          notes: 'Deal closed. Contract signed.',
          activities: [
            { id: 'A9', type: 'meeting', description: 'Final negotiation meeting', created_at: '2026-02-18 14:00', created_by: 'Jane Doe' },
            { id: 'A10', type: 'status_change', description: 'Deal marked as Won - $125,000 contract', created_at: '2026-02-19 16:30', created_by: 'Jane Doe' },
          ]
        },
        {
          id: 'LD-006',
          company_name: 'Precision Tools Inc',
          contact_person: 'Robert Brown',
          email: 'robert@precisiontools.com',
          phone: '+1-555-0987',
          industry: 'Manufacturing',
          status: 'new',
          source: 'Cold Call',
          dealer_id: null,
          dealer_name: null,
          created_at: '2026-02-27',
          notes: 'Cold outreach - interested in learning more.',
          activities: []
        },
        {
          id: 'LD-007',
          company_name: 'Marine Solutions LLC',
          contact_person: 'Amanda Lee',
          email: 'amanda@marinesolutions.com',
          phone: '+1-555-0555',
          industry: 'Marine',
          status: 'lost',
          source: 'Referral',
          dealer_id: 'D-002',
          dealer_name: 'Beta Supply Co',
          created_at: '2026-02-10',
          notes: 'Lost to competitor - price sensitive.',
          activities: [
            { id: 'A11', type: 'status_change', description: 'Lost to competitor - went with cheaper option', created_at: '2026-02-17 10:00', created_by: 'John Smith' },
          ]
        },
      ]
      
      setLeads(mockLeads)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch leads')
      setError(error)
      showError('Failed to load leads', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false
    if (filterDealer !== 'all' && lead.dealer_id !== filterDealer) return false
    if (filterDateFrom && lead.created_at < filterDateFrom) return false
    if (filterDateTo && lead.created_at > filterDateTo) return false
    return true
  })

  // Get unique dealers for filter
  const dealers = Array.from(new Set(leads.map(l => l.dealer_id).filter(Boolean)))
    .map(id => {
      const lead = leads.find(l => l.dealer_id === id)
      return { id, name: lead?.dealer_name }
    })

  // Group leads by stage for Kanban
  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredLeads.filter(l => l.status === stage)
    return acc
  }, {} as Record<Stage, Lead[]>)

  // Drag and drop handlers
  const handleDragStart = useCallback((lead: Lead) => {
    setDraggedLead(lead)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault()
    if (draggedLead && draggedLead.status !== targetStage) {
      // Update lead status
      setLeads(prev => prev.map(lead => 
        lead.id === draggedLead.id 
          ? { 
              ...lead, 
              status: targetStage,
              activities: [
                ...lead.activities,
                {
                  id: `A${Date.now()}`,
                  type: 'status_change' as const,
                  description: `Status changed from ${lead.status} to ${targetStage}`,
                  created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  created_by: 'Current User'
                }
              ]
            }
          : lead
      ))
    }
    setDraggedLead(null)
  }, [draggedLead])

  const handleAddActivity = () => {
    if (!selectedLead || !newActivityNote.trim()) return
    
    const newActivity: LeadActivity = {
      id: `A${Date.now()}`,
      type: 'note',
      description: newActivityNote,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created_by: 'Current User'
    }
    
    setLeads(prev => prev.map(lead => 
      lead.id === selectedLead.id 
        ? { ...lead, activities: [...lead.activities, newActivity] }
        : lead
    ))
    
    setSelectedLead(prev => prev ? { ...prev, activities: [...prev.activities, newActivity] } : null)
    setNewActivityNote('')
    setShowActivityModal(false)
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      new: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      contacted: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      qualified: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      proposal: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      won: 'M5 13l4 4L19 7',
      lost: 'M6 18L18 6M6 6l12 12',
    }
    return icons[status]
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      call: { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: 'text-emerald-400' },
      email: { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-blue-400' },
      meeting: { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-purple-400' },
      note: { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-amber-400' },
      status_change: { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: 'text-cyan-400' },
    }
    return icons[type] || icons.note
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <AnimatedContent>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="CRM Pipeline" />
              </h1>
              <p className="text-zinc-400">
                Track and manage your sales pipeline
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'kanban' 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' 
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Kanban
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' 
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </span>
                </button>
              </div>
              
              <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lead
              </button>
            </div>
          </div>
        </AnimatedContent>
      </div>

      {/* Filters */}
      <AnimatedContent delay={0.1}>
        <div className="mb-6 p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Statuses</option>
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>{STAGE_CONFIG[stage].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Dealer</label>
              <select
                value={filterDealer}
                onChange={(e) => setFilterDealer(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Dealers</option>
                {dealers.filter(d => d.id).map(d => (
                  <option key={d.id} value={d.id || ''}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>
      </AnimatedContent>

      {/* Stats Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {STAGES.map((stage, i) => (
          <AnimatedContent key={stage} delay={0.05 * i}>
            <button
              onClick={() => setFilterStatus(filterStatus === stage ? 'all' : stage)}
              className={`w-full p-3 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all text-left ${
                filterStatus === stage
                  ? 'border-purple-500/50 bg-purple-600/10'
                  : 'border-zinc-800/50 hover:border-zinc-600/50'
              }`}
            >
              <div className={`text-2xl font-bold ${STAGE_CONFIG[stage].color}`}>
                {leadsByStage[stage]?.length || 0}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{STAGE_CONFIG[stage].label}</div>
            </button>
          </AnimatedContent>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <DataTableSkeleton rows={5} columns={7} showStats={6} />
      ) : error ? (
        <ApiError 
          error={error} 
          onRetry={fetchLeads}
          title="Failed to load leads"
          message="We couldn't fetch the lead list. Please check your connection and try again."
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <AnimatedContent delay={0.2}>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {STAGES.map((stage) => (
                <div
                  key={stage}
                  className="w-72 flex-shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  {/* Column Header */}
                  <div className={`px-4 py-3 rounded-t-xl ${STAGE_CONFIG[stage].bgColor} border border-zinc-800/50 border-b-0`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${STAGE_CONFIG[stage].color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(stage)} />
                        </svg>
                        <span className={`font-semibold ${STAGE_CONFIG[stage].color}`}>{STAGE_CONFIG[stage].label}</span>
                      </div>
                      <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                        {leadsByStage[stage]?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cards */}
                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-b-xl p-2 min-h-[200px] space-y-2">
                    {leadsByStage[stage]?.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                        onClick={() => setSelectedLead(lead)}
                        className={`p-3 bg-zinc-900/80 border border-zinc-800/50 rounded-lg cursor-pointer hover:border-zinc-600/50 transition-all ${
                          draggedLead?.id === lead.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium text-zinc-100 truncate flex-1">{lead.company_name}</div>
                          <span className="text-xs text-zinc-500 ml-2">{lead.id}</span>
                        </div>
                        <div className="text-xs text-zinc-400 mb-2">{lead.contact_person}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">{lead.industry}</span>
                          {lead.dealer_name && (
                            <span className="text-purple-400/70">{lead.dealer_name}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {leadsByStage[stage]?.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-zinc-600">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContent>
      ) : (
        /* List View */
        <AnimatedContent>
          <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={500}>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Dealer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-zinc-100">{lead.company_name}</div>
                          <div className="text-xs text-zinc-500">{lead.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-100">{lead.contact_person}</div>
                          <div className="text-xs text-zinc-500">{lead.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {lead.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${STAGE_CONFIG[lead.status].bgColor} ${STAGE_CONFIG[lead.status].color} border-current/20`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(lead.status)} />
                            </svg>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-400">{lead.dealer_name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-400">{lead.created_at}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                          >
                            View
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

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedLead(null)}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            
            <div 
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-100">{selectedLead.company_name}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{selectedLead.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Lead Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Contact Person</div>
                    <div className="text-sm font-medium text-zinc-100">{selectedLead.contact_person}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone</div>
                    <div className="text-sm font-medium text-zinc-100">{selectedLead.phone}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-sm font-medium text-zinc-100">{selectedLead.email}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Industry</div>
                    <div className="text-sm font-medium text-zinc-100">{selectedLead.industry}</div>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Source</div>
                    <div className="text-sm font-medium text-zinc-100">{selectedLead.source}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${STAGE_CONFIG[selectedLead.status].bgColor} ${STAGE_CONFIG[selectedLead.status].color} border-current/20`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Dealer</div>
                    <div className="text-sm font-medium text-zinc-100">{selectedLead.dealer_name || 'Unassigned'}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Notes</div>
                  <div className="text-sm text-zinc-300 mt-1">{selectedLead.notes}</div>
                </div>

                {/* Activity History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                      Activity History
                    </h3>
                    <button
                      onClick={() => setShowActivityModal(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Note
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedLead.activities.length === 0 ? (
                      <div className="text-sm text-zinc-500 text-center py-4">No activity yet</div>
                    ) : (
                      selectedLead.activities.map((activity) => {
                        const { icon, color } = getActivityIcon(activity.type)
                        return (
                          <div key={activity.id} className="flex gap-3 p-3 bg-zinc-800/30 rounded-lg">
                            <div className={`w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center flex-shrink-0 ${color}`}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-zinc-100">{activity.description}</div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {activity.created_at} • {activity.created_by}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all"
                >
                  Close
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all">
                  Edit Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showActivityModal && selectedLead && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" onClick={() => setShowActivityModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            
            <div 
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-100">Add Activity Note</h3>
                <p className="text-sm text-zinc-500 mt-1">For {selectedLead.company_name}</p>
              </div>
              
              <div className="p-6">
                <textarea
                  value={newActivityNote}
                  onChange={(e) => setNewActivityNote(e.target.value)}
                  placeholder="Enter your note..."
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
              
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-5 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivityNote.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
