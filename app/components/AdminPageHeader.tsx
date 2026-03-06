"use client"

import { ReactNode } from "react"
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  children?: ReactNode
}

export function AdminPageHeader({ 
  title, 
  subtitle, 
  breadcrumbs,
  children 
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbs || []} />
      </div>
      
      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
