'use client'

import { useState } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover
} from '@/app/components'

interface NotificationRule {
  id: string
  name: string
  trigger: 'rfq_received' | 'quote_sent' | 'quote_accepted' | 'quote_rejected' | 'order_placed' | 'order_shipped'
  channels: ('email' | 'whatsapp' | 'sms')[]
  recipients: string[]
  template: string
  isActive: boolean
}

interface NotificationLog {
  id: string
  rule: string
  recipient: string
  channel: 'email' | 'whatsapp' | 'sms'
  status: 'sent' | 'delivered' | 'failed'
  timestamp: string
}

export default function NotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'New RFQ Alert',
      trigger: 'rfq_received',
      channels: ['email', 'whatsapp'],
      recipients: ['sales@company.com', '+1234567890'],
      template: 'A new RFQ has been received from {{company_name}}. Please review and respond.',
      isActive: true,
    },
    {
      id: '2',
      name: 'Quote Sent Confirmation',
      trigger: 'quote_sent',
      channels: ['email'],
      recipients: ['{{customer_email}}'],
      template: 'Your quotation {{quote_id}} has been sent. Valid until {{valid_until}}.',
      isActive: true,
    },
    {
      id: '3',
      name: 'Order Confirmation',
      trigger: 'order_placed',
      channels: ['email', 'whatsapp'],
      recipients: ['{{customer_email}}', '{{customer_phone}}'],
      template: 'Your order {{order_id}} has been confirmed. Expected delivery: {{delivery_date}}.',
      isActive: true,
    },
    {
      id: '4',
      name: 'Quote Accepted - Internal',
      trigger: 'quote_accepted',
      channels: ['email'],
      recipients: ['finance@company.com', 'operations@company.com'],
      template: 'Quote {{quote_id}} has been accepted by {{company_name}}. Please proceed with order processing.',
      isActive: false,
    },
  ])

  const [logs] = useState<NotificationLog[]>([
    { id: '1', rule: 'New RFQ Alert', recipient: 'sales@company.com', channel: 'email', status: 'delivered', timestamp: '2026-02-26 10:45' },
    { id: '2', rule: 'New RFQ Alert', recipient: '+1234567890', channel: 'whatsapp', status: 'delivered', timestamp: '2026-02-26 10:45' },
    { id: '3', rule: 'Quote Sent Confirmation', recipient: 'sarah@techcorp.com', channel: 'email', status: 'sent', timestamp: '2026-02-26 09:30' },
    { id: '4', rule: 'Order Confirmation', recipient: 'mike@buildright.com', channel: 'email', status: 'delivered', timestamp: '2026-02-25 16:20' },
    { id: '5', rule: 'Order Confirmation', recipient: '+1987654321', channel: 'whatsapp', status: 'failed', timestamp: '2026-02-25 16:20' },
  ])

  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      rfq_received: 'RFQ Received',
      quote_sent: 'Quote Sent',
      quote_accepted: 'Quote Accepted',
      quote_rejected: 'Quote Rejected',
      order_placed: 'Order Placed',
      order_shipped: 'Order Shipped',
    }
    return labels[trigger] || trigger
  }

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      whatsapp: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      sms: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    }
    return icons[channel]
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return styles[status] || styles.sent
  }

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Radial glow */}
      <div className="fixed top-1/3 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <AnimatedContent>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Notification Automation" />
              </h1>
              <p className="text-zinc-400">
                Configure email and WhatsApp triggers for automated notifications
              </p>
            </div>
          </AnimatedContent>
            
            <AnimatedContent delay={0.1}>
              <ClickSpark sparkColor="#a855f7" sparkCount={8}>
                <button
                  onClick={() => {
                    setEditingRule(null)
                    setShowRuleForm(true)
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Rule
                </button>
              </ClickSpark>
            </AnimatedContent>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Rules', value: rules.filter(r => r.isActive).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
              { label: 'Emails Sent Today', value: 24, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-blue-400' },
              { label: 'WhatsApp Sent Today', value: 18, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-green-400' },
            ].map((stat, i) => (
              <AnimatedContent key={stat.label} delay={0.05 * i}>
                <GlareHover glareColor="rgba(6, 182, 212, 0.15)" glareSize={200}>
                  <div className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                        <svg className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-zinc-100">{stat.value}</div>
                        <div className="text-xs text-zinc-500">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Notification Rules */}
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                Active Rules
              </h2>
              
              <div className="space-y-3">
                {rules.map((rule, i) => (
                  <AnimatedContent key={rule.id} delay={0.05 * i}>
                    <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
                      <div className={`p-5 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all ${
                        rule.isActive ? 'border-zinc-800/50' : 'border-zinc-800/30 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-zinc-100">{rule.name}</h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {getTriggerLabel(rule.trigger)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                              {rule.template.substring(0, 60)}...
                            </p>
                            
                            <div className="flex items-center gap-2">
                              {rule.channels.map(channel => (
                                <span 
                                  key={channel}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/50 text-xs text-zinc-400"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getChannelIcon(channel)} />
                                  </svg>
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                rule.isActive ? 'bg-purple-600' : 'bg-zinc-700'
                              }`}
                            >
                              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                rule.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRule(rule)
                                setShowRuleForm(true)
                              }}
                              className="text-zinc-400 hover:text-zinc-300 transition-colors p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </GlareHover>
                  </AnimatedContent>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                Recent Activity
              </h2>
              
              <AnimatedContent>
                <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={300}>
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
                    <div className="divide-y divide-zinc-800/50">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                log.channel === 'email' ? 'bg-blue-500/10' : 
                                log.channel === 'whatsapp' ? 'bg-green-500/10' : 'bg-purple-500/10'
                              }`}>
                                <svg className={`w-4 h-4 ${
                                  log.channel === 'email' ? 'text-blue-400' : 
                                  log.channel === 'whatsapp' ? 'text-green-400' : 'text-purple-400'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getChannelIcon(log.channel)} />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-100">{log.rule}</div>
                                <div className="text-xs text-zinc-500 truncate">{log.recipient}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(log.status)}`}>
                                {log.status}
                              </span>
                              <div className="text-xs text-zinc-600 mt-1">{log.timestamp}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            </div>
          </div>
        </main>

        {/* Rule Form Modal */}
        {showRuleForm && (
          <RuleFormModal 
            rule={editingRule}
            onClose={() => {
              setShowRuleForm(false)
              setEditingRule(null)
            }}
            onSave={(rule) => {
              if (editingRule) {
                setRules(rules.map(r => r.id === rule.id ? rule : r))
              } else {
                setRules([...rules, { ...rule, id: Date.now().toString() }])
              }
              setShowRuleForm(false)
              setEditingRule(null)
            }}
          />
        )}
    </div>
  )
}

function RuleFormModal({ 
  rule, 
  onClose, 
  onSave 
}: { 
  rule: NotificationRule | null
  onClose: () => void
  onSave: (rule: NotificationRule) => void
}) {
  const [formData, setFormData] = useState<NotificationRule>(() => ({
    id: rule?.id || '',
    name: rule?.name || '',
    trigger: rule?.trigger || 'rfq_received',
    channels: rule?.channels || ['email'],
    recipients: rule?.recipients || [],
    template: rule?.template || '',
    isActive: rule?.isActive ?? true,
  }))

  const [newRecipient, setNewRecipient] = useState('')

  const toggleChannel = (channel: 'email' | 'whatsapp' | 'sms') => {
    const channels = formData.channels.includes(channel)
      ? formData.channels.filter(c => c !== channel)
      : [...formData.channels, channel]
    setFormData({ ...formData, channels })
  }

  const addRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, newRecipient]
      })
      setNewRecipient('')
    }
  }

  const removeRecipient = (recipient: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter(r => r !== recipient)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

        <AnimatedContent>
          <div 
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">
                  {rule ? 'Edit Rule' : 'New Notification Rule'}
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      placeholder="e.g., New RFQ Alert"
                    />
                  </div>

                  {/* Trigger */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Trigger Event
                    </label>
                    <select
                      value={formData.trigger}
                      onChange={(e) => setFormData({ ...formData, trigger: e.target.value as NotificationRule['trigger'] })}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="rfq_received">RFQ Received</option>
                      <option value="quote_sent">Quote Sent</option>
                      <option value="quote_accepted">Quote Accepted</option>
                      <option value="quote_rejected">Quote Rejected</option>
                      <option value="order_placed">Order Placed</option>
                      <option value="order_shipped">Order Shipped</option>
                    </select>
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Channels
                    </label>
                    <div className="flex gap-3">
                      {(['email', 'whatsapp', 'sms'] as const).map(channel => (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => toggleChannel(channel)}
                          className={`flex-1 py-3 rounded-lg border transition-all ${
                            formData.channels.includes(channel)
                              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                          }`}
                        >
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipients */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Recipients
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.recipients.map(recipient => (
                        <span 
                          key={recipient}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm"
                        >
                          <span className="text-zinc-300">{recipient}</span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                        className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                        placeholder="email@example.com or +1234567890"
                      />
                      <button
                        type="button"
                        onClick={addRecipient}
                        className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Template */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Message Template
                    </label>
                    <textarea
                      value={formData.template}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                      rows={4}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                      placeholder="Use {{variable}} for dynamic content"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      Variables: {`{{company_name}}, {{quote_id}}, {{order_id}}, {{customer_email}}, {{valid_until}}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
                <Magnet padding={30} magnetStrength={2}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all"
                  >
                    Cancel
                  </button>
                </Magnet>
                <ClickSpark sparkColor="#a855f7" sparkCount={8}>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all"
                  >
                    {rule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </ClickSpark>
              </div>
            </form>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
