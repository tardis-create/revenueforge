'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSetAdminPage } from '@/app/contexts/AdminPageContext'
import type { BreadcrumbItem } from '@/app/components'

interface Channel {
  id: string
  name: string
  type: 'direct' | 'group'
}

interface Message {
  id: string
  channel_id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  updated_at: string | null
}

const POLL_INTERVAL = 3000 // 3 seconds

export default function MessagesPage() {
  useSetAdminPage('Messages', [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Messages' },
  ])

  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch channels
  const fetchChannels = useCallback(async () => {
    try {
      const response = await fetch('/api/channels')
      if (!response.ok) throw new Error('Failed to fetch channels')
      const data = await response.json() as { channels: Channel[] }
      setChannels(data.channels || [])
    } catch (err) {
      console.error('Error fetching channels:', err)
    }
  }, [])

  // Fetch messages for selected channel
  const fetchMessages = useCallback(async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/messages?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json() as { messages: Message[] }
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    }
  }, [])

  // Send a new message
  const sendMessage = async () => {
    if (!selectedChannel || !newMessage.trim()) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/channels/${selectedChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (!response.ok) {
        const errData = await response.json() as { error?: string }
        throw new Error(errData.error || 'Failed to send message')
      }

      const data = await response.json() as { message: Message }
      setMessages(prev => [data.message, ...prev])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchChannels()
      setLoading(false)
    }
    init()
  }, [fetchChannels])

  // Select first channel by default
  useEffect(() => {
    if (!loading && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0])
    }
  }, [loading, channels, selectedChannel])

  // Poll for new messages when channel is selected
  useEffect(() => {
    if (!selectedChannel) return

    // Initial fetch
    fetchMessages(selectedChannel.id)

    // Set up polling
    const intervalId = setInterval(() => {
      fetchMessages(selectedChannel.id)
    }, POLL_INTERVAL)

    return () => clearInterval(intervalId)
  }, [selectedChannel, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Channels Sidebar */}
      <div className="w-64 flex-shrink-0 bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50">
          <h2 className="text-lg font-semibold text-zinc-100">Channels</h2>
          <p className="text-sm text-zinc-500">{channels.length} available</p>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100%-80px)]">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                selectedChannel?.id === channel.id
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">#</span>
                <span className="font-medium truncate">{channel.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-zinc-500">#</span>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{selectedChannel.name}</h2>
                  <p className="text-sm text-zinc-500">
                    {messages.length} messages • Polling every {POLL_INTERVAL / 1000}s
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-zinc-500">Live</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-xs text-zinc-500 font-medium">{date}</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  <div className="space-y-3">
                    {dateMessages.map(message => (
                      <div key={message.id} className="group flex gap-3 hover:bg-zinc-800/30 -mx-2 px-2 py-1 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {message.sender_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-zinc-100">{message.sender_name}</span>
                            <span className="text-xs text-zinc-500">{formatTime(message.created_at)}</span>
                          </div>
                          <p className="text-zinc-300 whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-800/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={`Message #${selectedChannel.name}...`}
                  disabled={sending}
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-zinc-400">Select a channel to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
