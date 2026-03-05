'use client'

import { motion } from 'framer-motion'
import { SpringButton } from './SpringButton'

interface ApiErrorProps {
  message: string
  title?: string
  error?: Error
  onRetry?: () => void | Promise<void>
}

export function ApiError({ message, title, error, onRetry }: ApiErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3"
      role="alert"
    >
      {title && (
        <div className="font-semibold text-red-300">{title}</div>
      )}
      <div className="text-red-400">{message}</div>
      {error?.message && (
        <div className="text-xs text-red-500 font-mono">{error.message}</div>
      )}
      {onRetry && (
        <div className="pt-2">
          <SpringButton
            variant="secondary"
            onClick={() => void onRetry()}
            className="text-sm"
          >
            Try Again
          </SpringButton>
        </div>
      )}
    </motion.div>
  )
}

export function ErrorBoundaryFallback({ 
  error, 
  onReset 
}: { 
  error: Error
  onReset?: () => void 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReset && (
            <SpringButton variant="primary" onClick={onReset}>
              Try Again
            </SpringButton>
          )}
          <SpringButton 
            variant="secondary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </SpringButton>
        </div>
      </motion.div>
    </div>
  )
}
