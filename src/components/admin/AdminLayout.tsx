"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Breadcrumbs } from "./Breadcrumbs"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  showBreadcrumbs?: boolean
}

export function AdminLayout({ 
  children, 
  title, 
  showBreadcrumbs = true 
}: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      setIsLoading(false)
      return
    }
    // Validate token and check admin role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isExpired = payload.exp && payload.exp * 1000 < Date.now()
      if (isExpired) {
        localStorage.removeItem('token')
        router.push('/login')
        setIsLoading(false)
        return
      }
      if (payload.role !== 'admin' && payload.role !== 'superadmin') {
        router.push('/')
        setIsLoading(false)
        return
      }
      setIsAuthenticated(true)
    } catch {
      // Invalid token format — could be non-JWT, allow if token exists
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[280px]">
        {/* Header with user menu */}
        <Header title={title} />
        
        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6">
          {showBreadcrumbs && <Breadcrumbs />}
          {children}
        </main>
      </div>
    </div>
  )
}
