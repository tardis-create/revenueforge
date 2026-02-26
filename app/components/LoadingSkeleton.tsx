"use client"

import { motion } from "framer-motion"

interface LoadingSkeletonProps {
  className?: string
  variant?: "text" | "card" | "avatar" | "button"
  count?: number
}

export function LoadingSkeleton({ 
  className = "", 
  variant = "text",
  count = 1 
}: LoadingSkeletonProps) {
  const variants = {
    text: "h-4 bg-zinc-800 rounded w-full",
    card: "h-32 bg-zinc-800/50 rounded-xl border border-zinc-800/50",
    avatar: "h-10 w-10 bg-zinc-800 rounded-full",
    button: "h-10 w-24 bg-zinc-800 rounded-lg",
  }

  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {items.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          className={`${variants[variant]} ${className}`}
        />
      ))}
    </>
  )
}

// Card skeleton with multiple elements
export function CardSkeleton() {
  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl space-y-4">
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
      </div>
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-zinc-800/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <LoadingSkeleton variant="text" className="h-4" />
        </td>
      ))}
    </tr>
  )
}

export function DataTableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number; showStats?: number }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-zinc-800/50">
                {Array.from({ length: columns }).map((__, c) => (
                  <td key={c} className="p-4">
                    <LoadingSkeleton variant="text" className="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
