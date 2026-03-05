"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href?: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  
  // If we're at /admin, show only Dashboard
  if (paths.length === 0 || (paths.length === 1 && paths[0] === 'admin')) {
    return [{ label: 'Dashboard' }]
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin' }
  ]

  // Map path segments to readable labels
  const labelMap: Record<string, string> = {
    'products': 'Products',
    'leads': 'Leads',
    'quotes': 'Quotes',
    'rfqs': 'RFQs',
    'templates': 'Templates',
    'dealers': 'Dealers',
    'users': 'Users',
    'settings': 'Settings',
    'analytics': 'Analytics',
    'notifications': 'Notifications',
  }

  let currentPath = '/admin'
  
  for (let i = 1; i < paths.length; i++) {
    const segment = paths[i]
    currentPath += `/${segment}`
    
    // Skip if it's just "admin" (we already have Dashboard)
    if (segment === 'admin') continue
    
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Last item - no link
    if (i === paths.length - 1) {
      breadcrumbs.push({ label })
    } else {
      breadcrumbs.push({ label, href: currentPath })
    }
  }

  return breadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Don't show breadcrumbs on dashboard
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg 
              className="w-4 h-4 text-zinc-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          {item.href ? (
            <Link 
              href={item.href}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-300 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
