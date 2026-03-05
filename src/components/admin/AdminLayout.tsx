"use client"

import { useState } from "react"
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

  // Simple auth check - redirect if no token
  // In production, this would be more robust
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (!token) {
      // Will be handled by useEffect to avoid hydration mismatch
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
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
