"use client"

import { motion } from "framer-motion"
import { LoadingSkeleton } from "./LoadingSkeleton"

interface DataTableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showFilters?: boolean
  showStats?: number
}

/**
 * Data Table Skeleton - Full table loading state with header, stats, and rows
 * 
 * Usage:
 * <DataTableSkeleton rows={5} columns={4} showStats={4} />
 */
export function DataTableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showFilters = true,
  showStats,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="w-48 h-8" />
            <LoadingSkeleton variant="text" className="w-64 h-4" />
          </div>
          <LoadingSkeleton variant="button" className="w-32" />
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className={`grid gap-4 ${getStatsGridClass(showStats)}`}>
          {Array.from({ length: showStats }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl"
            >
              <LoadingSkeleton variant="text" className="w-12 h-7 mb-2" />
              <LoadingSkeleton variant="text" className="w-20 h-3" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <LoadingSkeleton variant="text" className="w-32 h-9" />
          <LoadingSkeleton variant="text" className="w-32 h-9" />
          <div className="flex-1" />
          <LoadingSkeleton variant="text" className="w-24 h-9" />
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <LoadingSkeleton variant="text" className="w-20 h-4" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <DataCellSkeleton 
                        type={colIndex === 0 ? "title" : colIndex === 1 ? "subtitle" : "text"} 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Card Grid Skeleton - For card-based layouts like product grids
 */
interface CardGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
}

export function CardGridSkeleton({ count = 6, columns = 3 }: CardGridSkeletonProps) {
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns]

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl space-y-4"
        >
          <div className="flex items-start gap-4">
            <LoadingSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" className="w-3/4 h-5" />
              <LoadingSkeleton variant="text" className="w-1/2 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" className="w-5/6" />
            <LoadingSkeleton variant="text" className="w-4/6" />
          </div>
          <div className="pt-2">
            <LoadingSkeleton variant="button" className="w-full" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Stats Skeleton - For dashboard stat cards
 */
interface StatsSkeletonProps {
  count?: number
}

export function StatsSkeleton({ count = 4 }: StatsSkeletonProps) {
  return (
    <div className={`grid gap-4 ${getStatsGridClass(count)}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl"
        >
          <LoadingSkeleton variant="text" className="w-12 h-7 mb-2" />
          <LoadingSkeleton variant="text" className="w-20 h-3" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Page Header Skeleton
 */
interface PageHeaderSkeletonProps {
  showBreadcrumbs?: boolean
  showActions?: boolean
}

export function PageHeaderSkeleton({ 
  showBreadcrumbs = true, 
  showActions = true 
}: PageHeaderSkeletonProps) {
  return (
    <div className="space-y-4 mb-8">
      {showBreadcrumbs && <LoadingSkeleton variant="text" className="w-48 h-4" />}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="w-56 h-10" />
          <LoadingSkeleton variant="text" className="w-72 h-4" />
        </div>
        {showActions && <LoadingSkeleton variant="button" className="w-36" />}
      </div>
    </div>
  )
}

/**
 * Detail View Skeleton - For single item detail pages
 */
export function DetailViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <LoadingSkeleton variant="avatar" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-64 h-8" />
          <LoadingSkeleton variant="text" className="w-48 h-4" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-lg space-y-2">
            <LoadingSkeleton variant="text" className="w-24 h-3" />
            <LoadingSkeleton variant="text" className="w-32 h-5" />
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-lg space-y-2">
        <LoadingSkeleton variant="text" className="w-32 h-5" />
        <LoadingSkeleton variant="text" className="w-full" />
        <LoadingSkeleton variant="text" className="w-full" />
        <LoadingSkeleton variant="text" className="w-5/6" />
      </div>
    </div>
  )
}

/**
 * Form Skeleton - For form loading states
 */
interface FormSkeletonProps {
  fields?: number
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <LoadingSkeleton variant="text" className="w-24 h-4" />
          <LoadingSkeleton variant="text" className="w-full h-11 rounded-lg" />
        </div>
      ))}
      <div className="pt-4">
        <LoadingSkeleton variant="button" className="w-32" />
      </div>
    </div>
  )
}

// Helper components and functions
function DataCellSkeleton({ type }: { type: "title" | "subtitle" | "text" }) {
  const classes = {
    title: "w-32 h-4",
    subtitle: "w-24 h-3 mt-1",
    text: "w-20 h-4",
  }

  return (
    <div className="space-y-1">
      <LoadingSkeleton variant="text" className={classes[type]} />
    </div>
  )
}

function getStatsGridClass(count: number): string {
  if (count <= 2) return "grid-cols-2"
  if (count === 3) return "grid-cols-2 md:grid-cols-3"
  if (count === 4) return "grid-cols-2 md:grid-cols-4"
  if (count === 5) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
  if (count === 6) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  return "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
}
