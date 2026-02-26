'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover
} from '@/app/components'

interface Template {
  id: string
  name: string
  type: 'email' | 'quote' | 'rfq_response' | 'invoice'
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  lastUsed: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    // Mock data
    const mockTemplates: Template[] = [
      {
        id: 'TMP-001',
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to {{company_name}}',
        content: 'Dear {{customer_name}},\n\nWelcome to our platform...',
        variables: ['company_name', 'customer_name'],
        isActive: true,
        lastUsed: '2026-02-25',
      },
      {
        id: 'TMP-002',
        name: 'Quote Follow-up',
        type: 'email',
        subject: 'Follow-up: Quote {{quote_id}}',
        content: 'Dear {{contact_name}},\n\nI hope this email finds you well...',
        variables: ['contact_name', 'quote_id'],
        isActive: true,
        lastUsed: '2026-02-24',
      },
      {
        id: 'TMP-003',
        name: 'Standard Quote',
        type: 'quote',
        subject: 'Quotation {{quote_id}} - {{company_name}}',
        content: 'Quote template with standard terms...',
        variables: ['quote_id', 'company_name', 'total_amount'],
        isActive: true,
        lastUsed: '2026-02-26',
      },
      {
        id: 'TMP-004',
        name: 'RFQ Response',
        type: 'rfq_response',
        subject: 'Re: RFQ {{rfq_id}}',
        content: 'Thank you for your RFQ. Here is our response...',
        variables: ['rfq_id', 'customer_name'],
        isActive: true,
        lastUsed: '2026-02-23',
      },
      {
        id: 'TMP-005',
        name: 'Invoice Template',
        type: 'invoice',
        subject: 'Invoice {{invoice_id}}',
        content: 'Invoice details...',
        variables: ['invoice_id', 'order_id', 'total_amount'],
        isActive: false,
        lastUsed: '2026-02-20',
      },
    ]
    
    setTemplates(mockTemplates)
    setLoading(false)
  }, [])

  const filteredTemplates = filterType === 'all' 
    ? templates 
    : templates.filter(t => t.type === filterType)

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      quote: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      rfq_response: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      invoice: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }
    return styles[type] || styles.email
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      rfq_response: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      invoice: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
    }
    return icons[type]
  }

  const toggleActive = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ))
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Template Library" />
              </h1>
              <p className="text-zinc-400">
                Manage email and document templates
              </p>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
          </div>
        </AnimatedContent>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'All Templates', value: templates.length },
          { label: 'Email', value: templates.filter(t => t.type === 'email').length },
          { label: 'Quote', value: templates.filter(t => t.type === 'quote').length },
          { label: 'RFQ Response', value: templates.filter(t => t.type === 'rfq_response').length },
          { label: 'Invoice', value: templates.filter(t => t.type === 'invoice').length },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <button
              onClick={() => setFilterType(stat.label.toLowerCase().replace(' ', '_').replace('all_templates', 'all'))}
              className={`w-full p-4 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all text-left ${
                filterType === stat.label.toLowerCase().replace(' ', '_').replace('all_templates', 'all')
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

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <AnimatedContent>
          <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No templates found</h3>
            <p className="text-zinc-500">Create your first template to get started.</p>
          </div>
        </AnimatedContent>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTemplates.map((template, i) => (
            <AnimatedContent key={template.id} delay={0.05 * i}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                <div className={`p-5 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all ${
                  template.isActive ? 'border-zinc-800/50' : 'border-zinc-800/30 opacity-60'
                }`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadge(template.type).replace('text-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                        <svg className={`w-5 h-5 ${getTypeBadge(template.type).split(' ')[1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getTypeIcon(template.type)} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100">{template.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadge(template.type)}`}>
                          {template.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(template.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        template.isActive ? 'bg-purple-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        template.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Subject</div>
                    <div className="text-sm text-zinc-300 bg-zinc-800/30 p-2 rounded">{template.subject}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(v => (
                        <span key={v} className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs text-zinc-500">
                          {'{{'}{v}{'}}'}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs text-zinc-500">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Last used: {template.lastUsed}
                    </div>
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          ))}
        </div>
      )}
    </div>
  )
}
