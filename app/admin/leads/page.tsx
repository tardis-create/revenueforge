'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  ErrorState
} from '@/app/components'
import { apiFetch } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = 'new' | 'qualified' | 'rfq' | 'quoted' | 'won' | 'lost'

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  status: LeadStatus
  assigned_to: string | null
  dealer_id: string | null
  source: string | null
  estimated_value: number
  notes: string | null
  created_at: string
  updated_at: string
  activities?: LeadActivity[]
}

interface LeadActivity {
  id: string
  lead_id: string
  type: string
  description: string | null
  created_at: string
  created_by: string | null
}

interface Dealer {
  id: string
  name: string
}

interface LeadStats {
  new: number
  qualified: number
  rfq: number
  quoted: number
  won: number
  lost: number
}

// ─── Column Configuration ─────────────────────────────────────────────────────

const COLUMNS: { id: LeadStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'new', label: 'New', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'qualified', label: 'Qualified', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'rfq', label: 'RFQ', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'quoted', label: 'Quoted', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'won', label: 'Won', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'lost', label: 'Lost', color: 'text-zinc-500', bgColor: 'bg-zinc-800/50 border-zinc-700' },
]

const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Trade Show', 'Cold Call', 'Email Campaign', 'Other']

// ─── Utility Functions ────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

function generateId(): string {
  return 'ld_' + Math.random().toString(36).substring(2, 11)
}

// ─── Lead Card Component ──────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  onDragStart: (e: React.DragEvent, lead: Lead) => void
  isDragging: boolean
}

function LeadCard({ lead, onClick, onDragStart, isDragging }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={onClick}
      className={`
        p-3 bg-zinc-900/80 border border-zinc-800/50 rounded-lg cursor-pointer
        hover:border-zinc-600/50 hover:bg-zinc-800/60 transition-all
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      {/* Company Name */}
      <div className="font-medium text-zinc-100 text-sm truncate mb-1">
        {lead.company_name}
      </div>
      
      {/* Contact */}
      {lead.contact_name && (
        <div className="text-xs text-zinc-400 truncate mb-2">
          {lead.contact_name}
        </div>
      )}
      
      {/* Value & Last Activity */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-emerald-400 font-medium">
          {formatCurrency(lead.estimated_value || 0)}
        </span>
        <span className="text-zinc-500">
          {formatRelativeTime(lead.updated_at)}
        </span>
      </div>
      
      {/* Source Badge */}
      {lead.source && (
        <div className="mt-2">
          <span className="inline-block px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded border border-zinc-700/50">
            {lead.source}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Add Lead Form Modal ──────────────────────────────────────────────────────

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (lead: Partial<Lead>) => void
  dealers: Dealer[]
}

function AddLeadModal({ isOpen, onClose, onAdd, dealers }: AddLeadModalProps) {
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    source: '',
    estimated_value: '',
    dealer_id: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    
    if (!form.company_name.trim()) {
      setErrors(['Company name is required'])
      return
    }

    setLoading(true)
    try {
      await onAdd({
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source || null,
        estimated_value: parseFloat(form.estimated_value) || 0,
        dealer_id: form.dealer_id || null,
        notes: form.notes.trim() || null,
        status: 'new',
      })
      
      // Reset form
      setForm({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        source: '',
        estimated_value: '',
        dealer_id: '',
        notes: '',
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        
        <div 
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Add New Lead</h2>
                  <p className="text-sm text-zinc-500 mt-1">Create a new lead in the pipeline</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {errors.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  {errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-400">{err}</p>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="john@acme.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="">Select source</option>
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Estimated Value</label>
                  <input
                    type="number"
                    value={form.estimated_value}
                    onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Assigned Dealer</label>
                  <select
                    value={form.dealer_id}
                    onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="">No assignment</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Lead Detail Panel ────────────────────────────────────────────────────────

interface LeadDetailPanelProps {
  lead: Lead | null
  onClose: () => void
  onAddActivity: (leadId: string, type: string, description: string) => Promise<void>
}

function LeadDetailPanel({ lead, onClose, onAddActivity }: LeadDetailPanelProps) {
  const [newActivityType, setNewActivityType] = useState('call')
  const [newActivityDesc, setNewActivityDesc] = useState('')
  const [addingActivity, setAddingActivity] = useState(false)

  const handleAddActivity = async () => {
    if (!newActivityDesc.trim()) return
    setAddingActivity(true)
    try {
      await onAddActivity(lead!.id, newActivityType, newActivityDesc.trim())
      setNewActivityDesc('')
    } finally {
      setAddingActivity(false)
    }
  }

  if (!lead) return null

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{lead.company_name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{lead.id}</p>
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
        
        {/* Status Badge */}
        <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            COLUMNS.find(c => c.id === lead.status)?.bgColor || 'bg-zinc-800'
          } ${COLUMNS.find(c => c.id === lead.status)?.color || 'text-zinc-400'}`}>
            {COLUMNS.find(c => c.id === lead.status)?.label || lead.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Contact Information</h3>
          
          {lead.contact_name && (
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Contact Person</div>
              <div className="text-sm font-medium text-zinc-100">{lead.contact_name}</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Email</div>
              <div className="text-sm text-zinc-100 truncate">{lead.email || '-'}</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Phone</div>
              <div className="text-sm text-zinc-100">{lead.phone || '-'}</div>
            </div>
          </div>
        </div>

        {/* Deal Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Deal Information</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Estimated Value</div>
              <div className="text-lg font-bold text-emerald-400">{formatCurrency(lead.estimated_value || 0)}</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Source</div>
              <div className="text-sm text-zinc-100">{lead.source || '-'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Created</div>
              <div className="text-sm text-zinc-100">{formatDate(lead.created_at)}</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Last Updated</div>
              <div className="text-sm text-zinc-100">{formatRelativeTime(lead.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Notes</h3>
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Activity Log</h3>
          
          {/* Add Activity */}
          <div className="p-3 bg-zinc-800/30 rounded-lg space-y-2">
            <div className="flex gap-2">
              <select
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                className="px-3 py-1.5 bg-zinc-700/50 border border-zinc-600/50 rounded text-xs text-zinc-200 focus:outline-none"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={newActivityDesc}
                onChange={(e) => setNewActivityDesc(e.target.value)}
                placeholder="Add activity note..."
                className="flex-1 px-3 py-1.5 bg-zinc-700/50 border border-zinc-600/50 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddActivity}
              disabled={addingActivity || !newActivityDesc.trim()}
              className="w-full py-1.5 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-300 font-medium hover:bg-purple-600/30 transition-colors disabled:opacity-50"
            >
              {addingActivity ? 'Adding...' : 'Add Activity'}
            </button>
          </div>

          {/* Activity List */}
          <div className="space-y-2">
            {lead.activities && lead.activities.length > 0 ? (
              lead.activities.map((activity) => (
                <div key={activity.id} className="p-3 bg-zinc-800/20 rounded-lg border border-zinc-800/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-zinc-300 capitalize">{activity.type}</span>
                        <span className="text-[10px] text-zinc-500">{formatRelativeTime(activity.created_at)}</span>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-zinc-400">{activity.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-500 text-sm">
                No activities yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  dealers: Dealer[]
  filters: {
    dealer_id: string
    date_from: string
    date_to: string
    min_value: string
    max_value: string
  }
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

function FilterPanel({ dealers, filters, onFilterChange, onReset }: FilterPanelProps) {
  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-zinc-500 mb-1.5">Assigned Dealer</label>
          <select
            value={filters.dealer_id}
            onChange={(e) => onFilterChange('dealer_id', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
          >
            <option value="">All Dealers</option>
            {dealers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-zinc-500 mb-1.5">Date From</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-zinc-500 mb-1.5">Date To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-zinc-500 mb-1.5">Min Value</label>
          <input
            type="number"
            value={filters.min_value}
            onChange={(e) => onFilterChange('min_value', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-zinc-500 mb-1.5">Max Value</label>
          <input
            type="number"
            value={filters.max_value}
            onChange={(e) => onFilterChange('max_value', e.target.value)}
            placeholder="Any"
            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({ new: 0, qualified: 0, rfq: 0, quoted: 0, won: 0, lost: 0 })
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  
  const [filters, setFilters] = useState({
    dealer_id: '',
    date_from: '',
    date_to: '',
    min_value: '',
    max_value: '',
  })

  // Fetch leads, stats, and dealers
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters.dealer_id) params.set('dealer_id', filters.dealer_id)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
      if (filters.min_value) params.set('min_value', filters.min_value)
      if (filters.max_value) params.set('max_value', filters.max_value)
      
      const [leadsRes, statsRes, dealersRes] = await Promise.all([
        apiFetch(`/api/leads?limit=200&${params.toString()}`),
        apiFetch('/api/leads/stats'),
        apiFetch('/api/dealers?limit=100'),
      ])
      
      if (!leadsRes.ok) throw new Error('Failed to fetch leads')
      
      const leadsData = await leadsRes.json() as { data: Lead[] } as { data: Lead[] }
      const statsData = statsRes.ok ? await statsRes.json() as { data: LeadStats } : { data: stats }
      const dealersData = dealersRes.ok ? await dealersRes.json() as { data: { id: string; name: string }[] } : { data: [] }
      
      setLeads(leadsData.data || [])
      setStats(statsData.data || stats)
      setDealers((dealersData.data || []).map((d: any) => ({ id: d.id, name: d.name })))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch leads')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch single lead with activities
  const fetchLeadDetail = async (id: string) => {
    try {
      const res = await apiFetch(`/api/leads/${id}`)
      if (res.ok) {
        const data = await res.json() as { data: Lead }
        setSelectedLead(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch lead detail:', err)
    }
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault()
    if (!draggedLead || draggedLead.status === newStatus) {
      setDraggedLead(null)
      return
    }

    // Optimistic update
    setLeads(prev => prev.map(l => 
      l.id === draggedLead.id ? { ...l, status: newStatus } : l
    ))
    setStats(prev => ({
      ...prev,
      [draggedLead.status]: Math.max(0, prev[draggedLead.status] - 1),
      [newStatus]: prev[newStatus] + 1,
    }))

    try {
      const res = await apiFetch(`/api/leads/${draggedLead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) {
        // Revert on error
        fetchData()
        throw new Error('Failed to update lead')
      }
    } catch (err) {
      console.error('Failed to update lead status:', err)
    }

    setDraggedLead(null)
  }

  // Add new lead
  const handleAddLead = async (leadData: Partial<Lead>) => {
    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      })
      
      if (!res.ok) throw new Error('Failed to create lead')
      
      const data = await res.json() as { data: Lead }
      setLeads(prev => [data.data, ...prev])
      setStats(prev => ({ ...prev, new: prev.new + 1 }))
    } catch (err) {
      console.error('Failed to create lead:', err)
      throw err
    }
  }

  // Add activity to lead
  const handleAddActivity = async (leadId: string, type: string, description: string) => {
    const res = await apiFetch(`/api/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify({ type, description }),
    })
    
    if (!res.ok) throw new Error('Failed to add activity')
    
    // Refresh lead detail
    await fetchLeadDetail(leadId)
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFilterReset = () => {
    setFilters({
      dealer_id: '',
      date_from: '',
      date_to: '',
      min_value: '',
      max_value: '',
    })
  }

  // Get leads by status
  const getLeadsByStatus = (status: LeadStatus) => 
    leads.filter(l => l.status === status)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Lead Pipeline" />
              </h1>
              <p className="text-zinc-400">
                Manage your sales pipeline with drag-and-drop
              </p>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </AnimatedContent>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterPanel
          dealers={dealers}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <ErrorState 
          title="Failed to load leads"
          description="We couldn't fetch the lead pipeline. Please check your connection and try again."
          retry={fetchData}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
          {COLUMNS.map((column) => {
            const columnLeads = getLeadsByStatus(column.id)
            const count = stats[column.id]
            
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={`p-3 rounded-t-xl border border-b-0 ${column.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${column.color}`}>{column.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${column.bgColor} ${column.color}`}>
                      {count}
                    </span>
                  </div>
                </div>
                
                {/* Column Content */}
                <div className={`p-2 bg-zinc-900/40 border border-t-0 ${column.bgColor.replace('bg-', 'border-').replace('/10', '/20')} rounded-b-xl min-h-[400px] space-y-2`}>
                  {columnLeads.length === 0 ? (
                    <div className="p-4 text-center text-zinc-600 text-sm">
                      No leads
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => fetchLeadDetail(lead.id)}
                        onDragStart={handleDragStart}
                        isDragging={draggedLead?.id === lead.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddLead}
        dealers={dealers}
      />

      {/* Lead Detail Panel */}
      {selectedLead && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-30" 
            onClick={() => setSelectedLead(null)}
          />
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onAddActivity={handleAddActivity}
          />
        </>
      )}
    </div>
  )
}
