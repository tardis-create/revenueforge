'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent,
  SpringButton, 
  LiquidCard, 
  EmptyState,
  ErrorState,
  CardSkeleton
} from '@/app/components'

// Template interface matching the API response
interface Template {
  id: string
  name: string
  subject: string
  body: string
  description: string | null
  variables: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// Template input for create/update
interface TemplateInput {
  name: string
  subject: string
  body: string
  description?: string
  variables?: string[]
  is_active?: boolean
}

// Preview response from API
interface TemplatePreview {
  id: string
  name: string
  subject: string
  body: string
  sample_data: Record<string, string>
}

// Standard template variables that users can reference
const TEMPLATE_VARIABLES = [
  { name: 'company_name', description: 'Customer company name' },
  { name: 'contact_name', description: 'Primary contact person name' },
  { name: 'quote_url', description: 'Link to view the quotation' },
] as const

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      
      const data = await response.json() as { templates?: Template[]; error?: string }
      
      if (response.ok && data.templates) {
        setTemplates(data.templates)
      } else {
        setError(data.error || 'Failed to load templates')
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err)
      setError('Failed to load templates. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Handle delete with confirmation
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      
      const data = await response.json() as { message?: string; error?: string }
      
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id))
      } else {
        alert(data.error || 'Failed to delete template')
      }
    } catch (err) {
      console.error('Failed to delete template:', err)
      alert('Failed to delete template. Please try again.')
    }
  }

  // Handle edit
  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  // Handle preview
  const handlePreview = async (id: string) => {
    try {
      setPreviewLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/api/templates/${id}/preview`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      
      const data = await response.json() as { preview?: TemplatePreview; error?: string }
      
      if (response.ok && data.preview) {
        setPreviewData(data.preview)
        setShowPreview(true)
      } else {
        alert(data.error || 'Failed to load preview')
      }
    } catch (err) {
      console.error('Failed to load preview:', err)
      alert('Failed to load preview. Please try again.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTemplate(null)
    fetchTemplates()
  }

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <AnimatedContent>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Email Templates" />
              </h1>
              <p className="text-zinc-400">
                Create and manage email templates for quotations and communications
              </p>
            </div>
          </AnimatedContent>
          
          <AnimatedContent delay={0.1}>
            <SpringButton
              variant="primary"
              onClick={() => {
                setEditingTemplate(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </SpringButton>
          </AnimatedContent>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 md:pb-12">
        {/* Form Modal */}
        {showForm && (
          <TemplateForm 
            template={editingTemplate}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false)
              setEditingTemplate(null)
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreview && previewData && (
          <TemplatePreviewModal
            preview={previewData}
            onClose={() => {
              setShowPreview(false)
              setPreviewData(null)
            }}
          />
        )}

        {/* Error State */}
        {error && (
          <ErrorState 
            description={error}
            retry={fetchTemplates}
          />
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            title="No email templates"
            description="Create your first email template to streamline your communications."
            action={{
              label: "Create Template",
              onClick: () => setShowForm(true)
            }}
          />
        ) : (
          <LiquidCard glassIntensity="low">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Template
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Variables
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-zinc-100">
                              {template.name}
                            </div>
                            {template.description && (
                              <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300 line-clamp-1 max-w-[250px]">
                          {template.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {template.variables?.slice(0, 3).map(v => (
                            <span key={v} className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-400 font-mono">
                              {`{{${v}}}`}
                            </span>
                          ))}
                          {template.variables?.length > 3 && (
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-500">
                              +{template.variables.length - 3}
                            </span>
                          )}
                          {(!template.variables || template.variables.length === 0) && (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          template.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {formatDate(template.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handlePreview(template.id)}
                          disabled={previewLoading}
                          className="text-cyan-400 hover:text-cyan-300 mr-3 transition-colors disabled:opacity-50"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-purple-400 hover:text-purple-300 mr-3 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, template.name)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiquidCard>
        )}

        {/* Variables Reference Card */}
        <div className="mt-8">
          <AnimatedContent delay={0.2}>
            <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available Template Variables
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Use these variables in your subject and body. They will be replaced with actual values when sending emails.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {TEMPLATE_VARIABLES.map(v => (
                  <div key={v.name} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                    <code className="text-purple-400 font-mono text-sm">{`{{${v.name}}}`}</code>
                    <p className="text-xs text-zinc-500 mt-1">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedContent>
        </div>
      </main>
    </div>
  )
}

// Template Form Component
function TemplateForm({ 
  template, 
  onSuccess, 
  onCancel 
}: { 
  template: Template | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<TemplateInput>(() => ({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    description: template?.description || '',
    variables: template?.variables || [],
    is_active: template?.is_active ?? true,
  }))

  // Extract variables from body text
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || []
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
  }

  // Update body and auto-extract variables
  const handleBodyChange = (body: string) => {
    const variables = extractVariables(body)
    setFormData({ ...formData, body, variables })
  }

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body
      const before = text.substring(0, start)
      const after = text.substring(end)
      const insertion = `{{${variable}}}`
      const newBody = before + insertion + after
      handleBodyChange(newBody)
      
      // Reset cursor position after state update
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + insertion.length, start + insertion.length)
      }, 0)
    } else {
      handleBodyChange(formData.body + `{{${variable}}}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const url = template 
        ? `${API_BASE_URL}/api/templates/${template.id}` 
        : `${API_BASE_URL}/api/templates`
      const method = template ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json() as { template?: Template; error?: string; details?: string[] }
      
      if (response.ok && data.template) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to save template')
        if (data.details) {
          setError(`${data.error}: ${data.details.join(', ')}`)
        }
      }
    } catch (err) {
      console.error('Failed to save template:', err)
      setError('Failed to save template. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>

        {/* Modal */}
        <AnimatedContent>
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">
                  {template ? 'Edit Template' : 'Create New Template'}
                </h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-zinc-400 mb-2">
                      Template Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Quote Follow-up Email"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm text-zinc-400 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of when to use this template"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm text-zinc-400 mb-2">
                      Email Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="e.g., Quotation for {{company_name}}"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label htmlFor="body" className="block text-sm text-zinc-400 mb-2">
                      Email Body <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="body"
                      value={formData.body}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      required
                      rows={8}
                      placeholder={`Dear {{contact_name}},\n\nThank you for your interest. Please find your quotation at: {{quote_url}}\n\nBest regards,\n{{company_name}}`}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Quick Insert Variables */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Quick Insert Variables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATE_VARIABLES.map(v => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(v.name)}
                          className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700/50 hover:border-purple-500/30 transition-colors font-mono"
                          title={v.description}
                        >
                          {`{{${v.name}}}`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Click to insert at cursor position, or type directly in the body.
                    </p>
                  </div>

                  {/* Detected Variables */}
                  {formData.variables && formData.variables.length > 0 && (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Detected Variables
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map(v => (
                          <span 
                            key={v}
                            className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400 font-mono"
                          >
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                    />
                    <label htmlFor="is_active" className="text-sm text-zinc-300">
                      Active (available for use in emails)
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
                <SpringButton
                  variant="secondary"
                  type="button"
                  onClick={onCancel}
                >
                  Cancel
                </SpringButton>
                <SpringButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
                </SpringButton>
              </div>
            </form>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}

// Template Preview Modal
function TemplatePreviewModal({
  preview,
  onClose,
}: {
  preview: TemplatePreview
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

        {/* Modal */}
        <AnimatedContent>
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-100">
                  Template Preview
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Template</span>
                  <p className="text-lg font-semibold text-zinc-100">{preview.name}</p>
                </div>

                {/* Subject Preview */}
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Subject</span>
                  <div className="mt-1 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                    <p className="text-zinc-100">{preview.subject}</p>
                  </div>
                </div>

                {/* Body Preview */}
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Body</span>
                  <div className="mt-1 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                    <pre className="text-zinc-100 whitespace-pre-wrap font-sans text-sm">
                      {preview.body}
                    </pre>
                  </div>
                </div>

                {/* Sample Data */}
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Sample Data Used</span>
                  <div className="mt-1 p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
                    <div className="grid gap-2">
                      {Object.entries(preview.sample_data).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3">
                          <code className="text-purple-400 font-mono text-sm shrink-0">
                            {`{{${key}}}`}
                          </code>
                          <span className="text-zinc-500">→</span>
                          <span className="text-zinc-300 text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end">
              <SpringButton
                variant="secondary"
                onClick={onClose}
              >
                Close
              </SpringButton>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
