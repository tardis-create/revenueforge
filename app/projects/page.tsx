'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BlurText, AnimatedContent, LoadingSkeleton, Breadcrumbs } from '@/app/components'
import { apiFetch } from '@/lib/api'

// Types
interface Project {
  id: string
  name: string
  description: string | null
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget: number | null
  created_at: string
  updated_at: string
}

// Status badges
const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  active: { label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  on_hold: { label: 'On Hold', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  completed: { label: 'Completed', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  cancelled: { label: 'Cancelled', color: 'text-zinc-500', bgColor: 'bg-zinc-800/50 border-zinc-700' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value: number | null): string {
  if (!value) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

// Loading skeleton
function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <LoadingSkeleton variant="text" className="w-1/3 h-6" />
              <LoadingSkeleton variant="text" className="w-2/3 h-4" />
            </div>
            <LoadingSkeleton variant="avatar" className="w-16 h-8" />
          </div>
          <div className="mt-4 flex gap-4">
            <LoadingSkeleton variant="text" className="w-24 h-4" />
            <LoadingSkeleton variant="text" className="w-24 h-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
        <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-zinc-300 mb-2">No projects yet</h3>
      <p className="text-zinc-500">Create your first project to get started</p>
    </div>
  )
}

// Error state
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-zinc-300 mb-2">Failed to load projects</h3>
      <p className="text-zinc-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/projects')
      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.status}`)
      }
      const data = await res.json()
      setProjects((data.projects || data || []) as Project[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects' },
  ]

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <AnimatedContent>
          <div className="flex items-center justify-between mb-8">
            <div>
              <BlurText
                text="Projects"
                className="text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent"
                delay={500}
              />
              <p className="text-zinc-500 mt-2">Manage and track your projects</p>
            </div>
          </div>
        </AnimatedContent>

        {loading ? (
          <ProjectsSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProjects} />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="block bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-zinc-700/50 hover:bg-zinc-900/70 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors">
                          {project.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[project.status].bgColor} ${STATUS_CONFIG[project.status].color}`}>
                          {STATUS_CONFIG[project.status].label}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{project.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
                        <span>Start: {formatDate(project.start_date)}</span>
                        <span>End: {formatDate(project.end_date)}</span>
                        {project.budget && <span>Budget: {formatCurrency(project.budget)}</span>}
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
