'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api'
import { AnimatedContent, LoadingSkeleton } from '@/app/components'

// Types
interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  name: string
  role: 'admin' | 'dealer' | 'viewer' | 'user'
  phone: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

interface UsersResponse {
  success: boolean
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Get auth token from cookies
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find(c => c.startsWith('token=') || c.startsWith('jwt='))
  return tokenCookie?.split('=')[1] || null
}

// Get current user from localStorage
function getCurrentUser(): { role: string } | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user_data')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dealer: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    viewer: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    user: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  }
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[role] || colors.user} capitalize`}>
      {role}
    </span>
  )
}

// Status badge component
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${
      isActive 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// Format date
function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Skeleton for user list
function UsersTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
          <LoadingSkeleton variant="avatar" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-32 h-4" />
            <LoadingSkeleton variant="text" className="w-48 h-3" />
          </div>
          <LoadingSkeleton variant="text" className="w-20 h-6" />
          <LoadingSkeleton variant="text" className="w-16 h-6" />
          <LoadingSkeleton variant="text" className="w-28 h-6" />
        </div>
      ))}
    </div>
  )
}

// Invite User Modal
function InviteUserModal({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as string,
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json() as { error?: string; success?: boolean }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite user')
      }

      onSuccess()
      onClose()
      setFormData({ email: '', first_name: '', last_name: '', role: 'viewer', password: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Invite New User</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
              >
                <option value="viewer">Viewer</option>
                <option value="dealer">Dealer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Temporary Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
                placeholder="Min 6 characters"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Edit User Modal
function EditUserModal({ user, isOpen, onClose, onSuccess }: { 
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    role: 'viewer',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        is_active: user.is_active
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json() as { error?: string; success?: boolean }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Edit User</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-zinc-400">Editing: <span className="text-zinc-100 font-medium">{user.name || user.email}</span></p>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
              >
                <option value="viewer">Viewer</option>
                <option value="dealer">Dealer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400">Account Status</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Delete Confirmation Modal
function DeleteUserModal({ user, isOpen, onClose, onSuccess }: { 
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json() as { error?: string; success?: boolean }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate user')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Deactivate User</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-zinc-300 mb-4">
              Are you sure you want to deactivate this user? They will no longer be able to log in.
            </p>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-zinc-100 font-medium">{user.name || 'Unknown'}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deactivating...' : 'Deactivate User'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// User row component
function UserRow({ user, onEdit, onDelete, currentUserId }: { 
  user: User
  onEdit: () => void
  onDelete: () => void
  currentUserId: string
}) {
  const isCurrentUser = user.id === currentUserId

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/30 transition-colors"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
        <span className="text-purple-400 font-medium">
          {(user.name || user.email).charAt(0).toUpperCase()}
        </span>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-zinc-100 font-medium truncate">
          {user.name || 'No name'}
          {isCurrentUser && <span className="ml-2 text-xs text-purple-400">(You)</span>}
        </p>
        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
      </div>

      {/* Role */}
      <RoleBadge role={user.role} />

      {/* Status */}
      <StatusBadge isActive={user.is_active} />

      {/* Last login */}
      <div className="text-sm text-zinc-500 w-36 text-right">
        {formatDate(user.last_login_at)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Edit user"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {!isCurrentUser && (
          <button
            onClick={onDelete}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title={user.is_active ? "Deactivate user" : "Activate user"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ role: string; user_id?: string } | null>(null)
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  // Check if user is admin
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    if (user && user.role !== 'admin') {
      setError('You do not have permission to access this page. Admin access required.')
      setLoading(false)
    }
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/api/users?includeInactive=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string; success?: boolean }
        throw new Error(data.error || 'Failed to fetch users')
      }

      const data: UsersResponse = await response.json()
      setUsers(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers()
    }
  }, [currentUser, fetchUsers])

  const handleUserCreated = () => {
    fetchUsers()
  }

  const handleUserUpdated = () => {
    fetchUsers()
  }

  const handleUserDeleted = () => {
    fetchUsers()
  }

  // Show error if not admin
  if (error && currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                  User Management
                </h1>
                <p className="text-zinc-400">
                  Manage team members and their access permissions
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite User
              </motion.button>
            </div>
          </AnimatedContent>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        {/* Error message */}
        {error && currentUser?.role === 'admin' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Users table header */}
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="w-10"></span>
            <span className="flex-1 min-w-[200px]">User</span>
            <span className="w-24">Role</span>
            <span className="w-24">Status</span>
            <span className="w-36 text-right">Last Login</span>
          </div>
          <span className="w-20"></span>
        </div>

        {/* Users list */}
        {loading ? (
          <UsersTableSkeleton />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-zinc-500 mb-4">No users found</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-purple-400 hover:text-purple-300"
            >
              Invite your first user
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                onEdit={() => setEditUser(user)}
                onDelete={() => setDeleteUser(user)}
                currentUserId={currentUser?.user_id || ''}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <InviteUserModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        onSuccess={handleUserCreated}
      />
      <EditUserModal 
        user={editUser}
        isOpen={!!editUser} 
        onClose={() => setEditUser(null)} 
        onSuccess={handleUserUpdated}
      />
      <DeleteUserModal 
        user={deleteUser}
        isOpen={!!deleteUser} 
        onClose={() => setDeleteUser(null)} 
        onSuccess={handleUserDeleted}
      />
    </div>
  )
}
