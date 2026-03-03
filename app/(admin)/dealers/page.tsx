'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  CardSkeleton,
  ErrorState
} from '@/app/components'

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// API fetch helper with auth
async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev';
  const url = `${API_BASE_URL}${path}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    credentials: 'include',
  });
}

interface Dealer {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  region: string
  status: 'active' | 'pending' | 'suspended'
  commission_rate: number
  total_sales: number
  joined_date: string
}

interface ApiDealer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  region: string | null
  status: string
  commission_rate: number
  created_at: string
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchDealers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authFetch('/api/dealers?limit=100')
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to fetch dealers' })) as { error?: string }
        throw new Error(errData.error || 'Failed to fetch dealers')
      }
      
      const data = await response.json() as { data: ApiDealer[] }
      const apiDealers: Dealer[] = (data.data || []).map((dealer: ApiDealer) => ({
        id: dealer.id,
        company_name: dealer.company || 'N/A',
        contact_person: dealer.name || 'N/A',
        email: dealer.email || 'N/A',
        phone: dealer.phone || 'N/A',
        region: dealer.region || 'N/A',
        // Map 'inactive' to 'suspended' for display, or keep as-is if valid
        status: dealer.status === 'inactive' ? 'suspended' : (dealer.status as 'active' | 'pending' | 'suspended'),
        commission_rate: dealer.commission_rate || 0,
        total_sales: 0, // Would need to calculate from commissions/leads
        joined_date: dealer.created_at ? new Date(dealer.created_at).toISOString().split('T')[0] : 'N/A',
      }))
      
      setDealers(apiDealers)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch dealers')
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDealers()
  }, [])

  const filteredDealers = filterStatus === 'all' 
    ? dealers 
    : dealers.filter(d => d.status === filterStatus)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return styles[status] || styles.active
  }

  const getRegionFlag = (region: string) => {
    const flags: Record<string, string> = {
      'North America': '🇺🇸',
      'Europe': '🇪🇺',
      'Asia Pacific': '🇦🇸',
      'Middle East': '🇦🇪',
      'Africa': '🇿🇦',
    }
    return flags[region] || '🌍'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Dealer Network" />
              </h1>
              <p className="text-zinc-400">
                Manage your dealer partners and commissions
              </p>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Dealer
            </button>
          </div>
        </AnimatedContent>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'All Dealers', value: dealers.length },
          { label: 'Active', value: dealers.filter(d => d.status === 'active').length },
          { label: 'Pending', value: dealers.filter(d => d.status === 'pending').length },
          { label: 'Suspended', value: dealers.filter(d => d.status === 'suspended').length },
        ].map((stat, i) => (
          <AnimatedContent key={stat.label} delay={0.05 * i}>
            <button
              onClick={() => setFilterStatus(stat.label.toLowerCase().replace(' ', '_').replace('all_dealers', 'all'))}
              className={`w-full p-4 bg-zinc-900/60 border rounded-xl backdrop-blur-sm transition-all text-left ${
                filterStatus === stat.label.toLowerCase().replace(' ', '_').replace('all_dealers', 'all')
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

      {/* Dealers Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState 
          title="Failed to load dealers"
          description="We couldn't fetch the dealer list. Please check your connection and try again."
          retry={fetchDealers}
        />
      ) : filteredDealers.length === 0 ? (
        <AnimatedContent>
          <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No dealers found</h3>
            <p className="text-zinc-500">Add your first dealer to get started.</p>
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
                        Region
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredDealers.map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-zinc-100">{dealer.company_name}</div>
                          <div className="text-xs text-zinc-500">{dealer.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-100">{dealer.contact_person}</div>
                          <div className="text-xs text-zinc-500">{dealer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getRegionFlag(dealer.region)}</span>
                            <span className="text-sm text-zinc-400">{dealer.region}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-100">{dealer.commission_rate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(dealer.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              dealer.status === 'active' ? 'bg-emerald-400' : 
                              dealer.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                            }`} />
                            {dealer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-zinc-100">{formatCurrency(dealer.total_sales)}</div>
                          <div className="text-xs text-zinc-500">Joined {dealer.joined_date}</div>
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
