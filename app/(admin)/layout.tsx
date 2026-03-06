"use client"

import { useState } from "react"
import { AdminSidebar } from "@/app/components/AdminSidebar"
import { AdminHeader } from "@/app/components/AdminHeader"

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
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header with user menu */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />
        
        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
