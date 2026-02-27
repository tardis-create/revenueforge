"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/app/components/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <div className="flex-1 min-w-0 lg:ml-0">
        {/* Desktop header spacer for hamburger - adjusted for safe area */}
        <div className="h-16 lg:hidden" aria-hidden="true" />
        
        {/* Page content with safe area for mobile nav */}
        <main id="main-content" className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
