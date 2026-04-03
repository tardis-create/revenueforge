'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminPageContextType {
  pageTitle: string
  pageBreadcrumbs: BreadcrumbItem[]
}

const AdminPageContext = createContext<AdminPageContextType | null>(null)

export function AdminPageProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState('Dashboard')
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<BreadcrumbItem[]>([])
  
  return (
    <AdminPageContext.Provider value={{ pageTitle, pageBreadcrumbs }}>
      {children}
    </AdminPageContext.Provider>
  )
}

/**
 * Hook to get and set admin page info - MUST be used inside useEffect or handlers
 */
export function useAdminPage() {
  const context = useContext(AdminPageContext)
  if (!context) {
    return { 
      pageTitle: 'Dashboard', 
      pageBreadcrumbs: [],
      setPageTitle: (_title: string, _breadcrumbs?: BreadcrumbItem[]) => {} 
    }
  }
  return { 
    ...context,
    setPageTitle: (_title: string, _breadcrumbs?: BreadcrumbItem[]) => {} 
  }
}

// Backward compatibility alias
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSetAdminPage = useAdminPage

// For files that need to set page title, they should use this in a useEffect
// Example:
// useEffect(() => {
//   setPageTitle('Messages')
// }, [])