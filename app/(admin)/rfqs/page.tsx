'use client'

import { useState, useEffect } from 'react'
import { AnimatedContent, LiquidCard, LoadingSkeleton, EmptyState } from '@/app/components'

interface RFQ {
  id: string
  company_name: string
  contact_email: string
  products: string
  status: string
  created_at: string
}

export default function AdminRFQsPage() {
  const [rfqs, setRFQs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API
    setRFQs([
      {
        id: '1',
        company_name: 'Acme Corp',
        contact_email: 'buyer@acme.com',
        products: 'Industrial Pumps, Valves',
        status: 'pending',
        created_at: '2026-02-27T10:00:00Z'
      },
      {
        id: '2',
        company_name: 'TechIndustries Ltd',
        contact_email: 'procurement@techind.com',
        products: 'Circuit Boards',
        status: 'reviewed',
        created_at: '2026-02-26T14:30:00Z'
      }
    ])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">RFQs</h1>
          <p className="text-zinc-400 mt-1">Manage requests for quotation</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-32 rounded-xl" />
          <LoadingSkeleton className="h-32 rounded-xl" />
        </div>
      ) : rfqs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No RFQs yet"
          description="Requests for quotation will appear here"
        />
      ) : (
        <LiquidCard glassIntensity="low">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Created</th>
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-zinc-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-100">{rfq.company_name}</div>
                      <div className="text-xs text-zinc-500">{rfq.contact_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-300">{rfq.products}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        rfq.status === 'pending' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {new Date(rfq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-purple-400 hover:text-purple-300 mr-4">View</button>
                      <button className="text-cyan-400 hover:text-cyan-300">Create Quote</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LiquidCard>
      )}
    </div>
  )
}
