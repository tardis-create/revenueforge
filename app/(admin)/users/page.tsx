'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  DataTableSkeleton,
  ApiError,
  useToast
} from '@/app/components'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'sales' | 'support'
  status: 'active' | 'inactive'
  lastActive: string
  avatar: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const { error: showError } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockUsers: User[] = [
        {
          id: 'USR-001',
          name: 'Admin User',
          email: 'admin@revenueforge.com',
          role: 'admin',
          status: 'active',
          lastActive: '2026-02-26 10:30',
          avatar: 'AU',
        },
        {
          id: 'USR-002',
          name: 'Sarah Johnson',
          email: 'sarah.j@revenueforge.com',
          role: 'manager',
          status: 'active',
          lastActive: '2026-02-26 09:15',
          avatar: 'SJ',
        },
        {
          id: 'USR-003',
          name: 'Michael Chen',
          email: 'michael.c@revenueforge.com',
          role: 'sales',
          status: 'active',
          lastActive: '2026-02-25 16:45',
          avatar: 'MC',
        },
        {
          id: 'USR-004',
          name: 'Emily Davis',
          email: 'emily.d@revenueforge.com',
          role: 'sales',
          status: 'active',
          lastActive: '2026-02-26 08:00',
          avatar: 'ED',
        },
        {
          id: 'USR-005',
          name: 'James Wilson',
          email: 'james.w@revenueforge.com',
          role: 'support',
          status: 'inactive',
          lastActive: '2026-02-20 14:20',
          avatar: 'JW',
        },
      ]
      
      setUsers(mockUsers)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch users')
      setError(error)
      showError('Failed to load users', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(u => u.role === filterRole)

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      sales: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      support: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }
    return styles[role] || styles.support
  }

  const getStatusDot = (status: string) => {
    return status === 'active' ? 'bg-emerald-400' : 'bg-zinc-500'
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-indigo-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="User Management" />
              </h1>
              <p className="text-zinc-400">
                Manage team members and permissions
              </p>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>
        </AnimatedContent>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'All Users', value: users.length },
          { label: 'Admin', value: users.filter(u => u.role === 'admin').length },
          { label: 'Manager', value: users.filter(u => u.role === 'manager').length },
          { label: 'Sales', value: users.filter(u => u.role === 'sales').length },
          { label: 'Support', value: users.filter(u => u.role === 'support').length },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <button
              onClick={() => setFilterRole(stat.label.toLowerCase().replace(' ', '_').replace('all_users', 'all'))}
              className={`w-full p-4 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all text-left ${
                filterRole === stat.label.toLowerCase().replace(' ', '_').replace('all_users', 'all')
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

      {/* Users Table */}
      {loading ? (
        <DataTableSkeleton rows={5} columns={5} showStats={5} />
      ) : error ? (
        <ApiError 
          error={error} 
          onRetry={fetchUsers}
          title="Failed to load users"
          message="We couldn't fetch the user list. Please check your connection and try again."
        />
      ) : filteredUsers.length === 0 ? (
        <AnimatedContent>
          <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No users found</h3>
            <p className="text-zinc-500">Add your first user to get started.</p>
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
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                              {user.avatar}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-zinc-100">{user.name}</div>
                              <div className="text-xs text-zinc-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusDot(user.status)}`} />
                            <span className="text-sm text-zinc-400 capitalize">{user.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-400">{user.lastActive}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                            Edit
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
    </div>
  )
}
