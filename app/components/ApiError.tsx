"use client"

import { motion } from "framer-motion"
import { SpringButton } from "./SpringButton"

interface ApiErrorProps {
  title?: string
  message?: string
  error?: Error | string | null
  onRetry?: () => void
  variant?: "card" | "inline" | "fullscreen"
}

/**
 * API Error Card - Displays API errors with retry functionality
 * 
 * Usage:
 * <ApiError 
 *   error={error} 
 *   onRetry={refetch}
 *   variant="card"
 * />
 */
export function ApiError({
  title = "Failed to load data",
  message = "We couldn't fetch the data. Please check your connection and try again.",
  error,
  onRetry,
  variant = "card",
}: ApiErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error || message

  if (variant === "fullscreen") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh] px-4"
        role="alert"
        aria-live="assertive"
      >
        <ErrorContent
          title={title}
          message={errorMessage}
          onRetry={onRetry}
          size="lg"
        />
      </motion.div>
    )
  }

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <ErrorIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-400">{title}</h4>
            <p className="text-sm text-red-300/80 mt-1">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Try again →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="p-8 bg-zinc-900/60 border border-red-500/20 rounded-xl backdrop-blur-sm"
      role="alert"
      aria-live="assertive"
    >
      <ErrorContent
        title={title}
        message={errorMessage}
        onRetry={onRetry}
        size="md"
      />
    </motion.div>
  )
}

function ErrorContent({
  title,
  message,
  onRetry,
  size,
}: {
  title: string
  message: string
  onRetry?: () => void
  size: "md" | "lg"
}) {
  const iconSize = size === "lg" ? "w-16 h-16" : "w-12 h-12"
  const containerSize = size === "lg" ? "w-20 h-20" : "w-16 h-16"
  const titleSize = size === "lg" ? "text-xl" : "text-lg"

  return (
    <div className="flex flex-col items-center text-center max-w-md">
      <div
        className={`${containerSize} rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4`}
      >
        <ErrorIcon className={`${iconSize} text-red-400`} />
      </div>
      <h3 className={`${titleSize} font-semibold text-zinc-100 mb-2`}>{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <SpringButton variant="primary" onClick={onRetry}>
          <span className="flex items-center gap-2">
            <RefreshIcon className="w-4 h-4" />
            Try Again
          </span>
        </SpringButton>
      )}
    </div>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

/**
 * Error Boundary Fallback Component
 * Use with React Error Boundaries
 */
export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ApiError
        title="Something went wrong"
        message={error.message || "An unexpected error occurred. Please try again."}
        onRetry={resetErrorBoundary}
        variant="fullscreen"
      />
    </div>
  )
}
