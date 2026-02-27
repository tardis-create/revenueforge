'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  CardSkeleton,
  ErrorState
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
  created_at: string
  notes: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
          created_at: '2026-02-24',
          notes: 'Interested in industrial pumps. Budget confirmed.',
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
          created_at: '2026-02-22',
          notes: 'Proposal sent. Awaiting response.',
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
          created_at: '2026-02-26',
          notes: 'New lead from LinkedIn campaign.',
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
          created_at: '2026-02-20',
          notes: 'Initial contact made. Follow-up scheduled.',
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
          created_at: '2026-02-15',
          notes: 'Deal closed. Contract signed.',
        },
      ]
      
      setLeads(mockLeads)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch leads')
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === filterStatus)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      proposal: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lost: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    }
    return styles[status] || styles.new
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Lead Management" />
              </h1>
              <p className="text-zinc-400">
                Track and manage your sales pipeline
              </p>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </AnimatedContent>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'All Leads', value: leads.length },
          { label: 'New', value: leads.filter(l => l.status === 'new').length },
          { label: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
          { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
          { label: 'Proposal', value: leads.filter(l => l.status === 'proposal').length },
          { label: 'Won', value: leads.filter(l => l.status === 'won').length },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <button
              onClick={() => setFilterStatus(stat.label.toLowerCase().replace(' ', '_').replace('all_leads', 'all'))}
              className={`w-full p-4 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all text-left ${
                filterStatus === stat.label.toLowerCase().replace(' ', '_').replace('all_leads', 'all')
                  ? 'border-purple-500/50 bg-purple-600/10'
                  : 'border-zinc-800/50 hover:border-zinc-600/50'
              }`}
            >
              <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </button>
          </AnimatedContent>
        ))}
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState 
          title="Failed to load leads"
          description="We couldn't fetch the lead list. Please check your connection and try again."
          retry={fetchLeads}
        />
      ) : filteredLeads.length === 0 ? (
        <AnimatedContent>
          <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No leads found</h3>
            <p className="text-zinc-500">Add your first lead to get started.</p>
          </div>
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
                        Source
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(lead.status)}`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(lead.status)} />
                            </svg>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-400">{lead.source}</div>
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
              className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-zinc-800">
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

              <div className="p-6 space-y-4">
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
                
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Notes</div>
                  <div className="text-sm text-zinc-300 mt-1">{selectedLead.notes}</div>
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
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
    </div>
  )
}
