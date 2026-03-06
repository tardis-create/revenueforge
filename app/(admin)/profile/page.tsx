'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    const authData = localStorage.getItem('auth')
    
    // Try to get user from stored auth first
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        if (parsed.user) {
          setFormData({
            name: parsed.user.name || '',
            email: parsed.user.email || '',
          })
        }
      } catch (e) {
        console.error('Error parsing auth:', e)
      }
    }

    // Also try to fetch from API
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then((data: any) => {
        if (data.user) {
          setProfile(data.user)
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
          })
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const token = localStorage.getItem('token') || ''

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data: any = await res.json()

      if (data.user) {
        setProfile(data.user)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        
        // Update localStorage
        const authData = localStorage.getItem('auth')
        if (authData) {
          const parsed = JSON.parse(authData)
          parsed.user = { ...parsed.user, ...formData }
          localStorage.setItem('auth', JSON.stringify(parsed))
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-1">Profile Settings</h1>
        <p className="text-zinc-400 text-sm">Manage your account information</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              placeholder="Enter your name"
            />
          </div>

          {profile && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Role
              </label>
              <div className="px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 capitalize">
                {profile.role}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
