'use client'

import { useState, useEffect, use, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BlurText, AnimatedContent, LoadingSkeleton, Breadcrumbs } from '@/app/components'
import { apiFetch } from '@/lib/api'
import { getDocsByProjectId, createDoc, updateDoc, deleteDoc } from '@/lib/documents'
import type { Document } from '@/lib/types'

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

interface ProjectAgent {
  id: string
  agent_id: string
  role: string
  assigned_at: string
}

interface Task {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
}

interface Decision {
  id: string
  title: string
  description: string
  decided_at: string
  decided_by: string | null
}

// Status badges
const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  active: { label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  on_hold: { label: 'On Hold', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  completed: { label: 'Completed', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  cancelled: { label: 'Cancelled', color: 'text-zinc-500', bgColor: 'bg-zinc-800/50 border-zinc-700' },
}

const TASK_STATUS_CONFIG: Record<Task['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-zinc-400' },
  in_progress: { label: 'In Progress', color: 'text-amber-400' },
  completed: { label: 'Completed', color: 'text-emerald-400' },
  blocked: { label: 'Blocked', color: 'text-red-400' },
}

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-zinc-500' },
  medium: { label: 'Medium', color: 'text-blue-400' },
  high: { label: 'High', color: 'text-orange-400' },
  urgent: { label: 'Urgent', color: 'text-red-400' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
        <LoadingSkeleton variant="text" className="w-1/3 h-8 mb-4" />
        <LoadingSkeleton variant="text" className="w-2/3 h-4 mb-2" />
        <LoadingSkeleton variant="text" className="w-1/4 h-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <LoadingSkeleton variant="text" className="w-24 h-4 mb-2" />
            <LoadingSkeleton variant="text" className="w-32 h-6" />
          </div>
        ))}
      </div>
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
      <h3 className="text-lg font-medium text-zinc-300 mb-2">Failed to load project</h3>
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

// Not found / no access empty state
function ProjectNotFoundState({ isAccessDenied }: { isAccessDenied?: boolean }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800/80 flex items-center justify-center">
        <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-zinc-300 mb-3">
        {isAccessDenied ? 'No access to project' : 'Project not found'}
      </h2>
      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
        {isAccessDenied
          ? "You don't have permission to view this project. Contact the project owner to request access."
          : "This project doesn't exist or may have been deleted. Check the project ID or browse all projects."}
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/projects"
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
        >
          ← All Projects
        </Link>
      </div>
    </div>
  )
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [agents, setAgents] = useState<ProjectAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)

  const fetchProjectData = async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    setAccessDenied(false)
    try {
      // Fetch project details
      const projectRes = await apiFetch(`/api/projects/${resolvedParams.id}`)
      if (!projectRes.ok) {
        if (projectRes.status === 404) {
          setNotFound(true)
          setLoading(false)
          return
        }
        if (projectRes.status === 401 || projectRes.status === 403) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        throw new Error(`Failed to load project (${projectRes.status})`)
      }
      const projectData = await projectRes.json() as { project?: Project } & Project
      setProject((projectData.project || projectData) as Project)

      // Fetch project agents
      const agentsRes = await apiFetch(`/api/projects/${resolvedParams.id}/agents`)
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json() as { agents?: ProjectAgent[] } | ProjectAgent[]
        setAgents(((agentsData as { agents?: ProjectAgent[] }).agents || agentsData || []) as ProjectAgent[])
      }

      // Fetch project tasks
      const tasksRes = await apiFetch(`/api/pm-tasks?project_id=${resolvedParams.id}`)
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json() as { tasks?: Task[] } | Task[]
        setTasks(((tasksData as { tasks?: Task[] }).tasks || tasksData || []) as Task[])
      }

      // Fetch project decisions
      const decisionsRes = await apiFetch(`/api/projects/${resolvedParams.id}/decisions`)
      if (decisionsRes.ok) {
        const decisionsData = await decisionsRes.json() as { decisions?: Decision[] } | Decision[]
        setDecisions(((decisionsData as { decisions?: Decision[] }).decisions || decisionsData || []) as Decision[])
      }
      
      // Fetch project documents
      const docs = await getDocsByProjectId(resolvedParams.id);
      setDocuments(docs);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectData()
  }, [resolvedParams.id])

  const handleCreateDoc = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const doc_type = formData.get('doc_type') as Document['doc_type'];

    if (title && doc_type) {
      try {
        const newDoc = await createDoc(resolvedParams.id, { title, doc_type });
        setDocuments([...documents, newDoc]);
        (event.target as HTMLFormElement).reset();
      } catch (error) {
        console.error("Failed to create document", error);
      }
    }
  };

  const handleUpdateDoc = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDoc) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const doc_type = formData.get('doc_type') as Document['doc_type'];
    
    try {
      const updated = await updateDoc(editingDoc.id, { title, doc_type });
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      setEditingDoc(null);
    } catch (error) {
      console.error("Failed to update document", error);
    }
  };
  
  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc(docId);
        setDocuments(documents.filter(d => d.id !== docId));
      } catch (error) {
        console.error("Failed to delete document", error);
      }
    }
  };


  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: project?.name || 'Loading...' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'Loading...' }]} />
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  if (notFound || accessDenied) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }]} />
          <ProjectNotFoundState isAccessDenied={accessDenied} />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }]} />
          <ErrorState message={error || 'Project not found'} onRetry={fetchProjectData} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <AnimatedContent>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BlurText
                text={project.name}
                className="text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent"
                delay={500}
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[project.status].bgColor} ${STATUS_CONFIG[project.status].color}`}>
                {STATUS_CONFIG[project.status].label}
              </span>
            </div>
            {project.description && (
              <p className="text-zinc-400 text-lg">{project.description}</p>
            )}
          </div>
        </AnimatedContent>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6"
          >
            <p className="text-zinc-500 text-sm mb-1">Start Date</p>
            <p className="text-xl font-semibold">{formatDate(project.start_date)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6"
          >
            <p className="text-zinc-500 text-sm mb-1">End Date</p>
            <p className="text-xl font-semibold">{formatDate(project.end_date)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6"
          >
            <p className="text-zinc-500 text-sm mb-1">Budget</p>
            <p className="text-xl font-semibold">{formatCurrency(project.budget)}</p>
          </motion.div>
        </div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          {editingDoc ? (
            <form onSubmit={handleUpdateDoc} className="space-y-4">
              <input
                name="title"
                defaultValue={editingDoc.title}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                required
              />
              <select
                name="doc_type"
                defaultValue={editingDoc.doc_type}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                required
              >
                <option value="specification">Specification</option>
                <option value="report">Report</option>
                <option value="invoice">Invoice</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white">Update Document</button>
                <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-zinc-500">{doc.doc_type} - Last updated: {formatDateTime(doc.updated_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingDoc(doc)} className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCreateDoc} className="flex gap-2">
                <input name="title" placeholder="New document title" className="flex-grow bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white" required />
                <select name="doc_type" className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white" required>
                  <option value="specification">Specification</option>
                  <option value="report">Report</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white">Add</button>
              </form>
            </>
          )}
        </motion.div>


        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-zinc-500">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-zinc-500">Due: {formatDate(task.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                    <span className={`text-sm ${TASK_STATUS_CONFIG[task.status].color}`}>
                      {TASK_STATUS_CONFIG[task.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Agents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          {agents.length === 0 ? (
            <p className="text-zinc-500">No team members assigned</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    <span className="text-sm font-medium">{agent.role.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.role}</p>
                    <p className="text-xs text-zinc-500">{agent.agent_id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Decisions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Decisions</h2>
          {decisions.length === 0 ? (
            <p className="text-zinc-500">No decisions recorded</p>
          ) : (
            <div className="space-y-3">
              {decisions.map((decision) => (
                <div key={decision.id} className="p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{decision.title}</p>
                    <span className="text-xs text-zinc-500">{formatDateTime(decision.decided_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{decision.description}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-sm text-zinc-500">
          <p>Created: {formatDateTime(project.created_at)}</p>
          <p>Last updated: {formatDateTime(project.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}
