"use client"

import { useState } from "react"
import { AdminSidebar } from "@/app/components/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
