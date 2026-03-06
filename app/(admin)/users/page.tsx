'use client'

import { AnimatedContent, EmptyState, AdminPageHeader } from '@/app/components'

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <AdminPageHeader 
              title="Users"
              subtitle="Manage admin users and dealers"
              breadcrumbs={[
                { label: 'Users' }
              ]}
            />
          </AnimatedContent>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12">
        <AnimatedContent delay={0.1}>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="No users yet"
            description="Add admin users and dealers to manage your marketplace."
          />
        </AnimatedContent>
      </main>
    </div>
  )
}
