"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/app/components/AdminSidebar"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      // Check user role - dealers should not access admin
      if (user?.role === 'dealer') {
        router.push('/dealer')
        return
      }
      
      // Only admin and users (not dealers) can access
      if (user?.role !== 'admin' && user?.role !== 'user') {
        router.push('/')
        return
      }
      
      setIsAuthorized(true)
    }
  }, [isAuthenticated, authLoading, user, router])

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Desktop header spacer for hamburger */}
        <div className="h-16 lg:hidden" />
        
        {/* Page content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
