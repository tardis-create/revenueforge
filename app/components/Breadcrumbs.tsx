"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if no items provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) {
      return [
        { label: "Home", href: "/admin" },
        ...items
      ]
    }
    
    // Auto-generate from path
    const pathParts = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/admin" }]
    
    let currentPath = ""
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`
      // Skip 'admin' since we start from it
      if (part === "admin" || (index === 0 && part === "(admin)")) return
      
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")
      breadcrumbs.push({
        label: label,
        href: currentPath
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={item.href || index} className="flex items-center gap-2">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-zinc-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            
            {isLast ? (
              <span className="text-zinc-300 font-medium">{item.label}</span>
            ) : item.href ? (
              <Link 
                href={item.href}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-500">{item.label}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
