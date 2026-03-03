"use client"

import { AdminSidebar } from "@/app/components/AdminSidebar"

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <AdminSidebar isOpen={false} onToggle={() => {}} />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Page content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
