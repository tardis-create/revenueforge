"use client"

import { motion } from "framer-motion"
import { SpringButton } from "./SpringButton"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
          className="mb-6 w-16 h-16 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <SpringButton variant="primary" onClick={action.onClick}>
          {action.label}
        </SpringButton>
      )}
    </motion.div>
  )
}

// Error state component
export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content.",
  retry 
}: {
  title?: string
  description?: string
  retry?: () => void
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      }
      title={title}
      description={description}
      action={retry ? { label: "Try Again", onClick: retry } : undefined}
    />
  )
}

// Success state component
export function SuccessState({ 
  title = "Success!",
  description,
  action 
}: {
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      }
      title={title}
      description={description}
      action={action}
    />
  )
}
