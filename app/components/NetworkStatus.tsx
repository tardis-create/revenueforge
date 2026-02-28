"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useOnlineStatus } from "@/lib/hooks"

/**
 * Offline indicator that shows when the user loses network connectivity
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/95 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">
            <svg 
              className="w-4 h-4 text-amber-950 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
              />
            </svg>
            <span className="text-sm font-medium text-amber-950">
              You&apos;re offline. Some features may be unavailable.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Reconnecting indicator for transient network issues
 */
export function ReconnectingIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]"
          role="status"
          aria-live="polite"
        >
          <div className="bg-zinc-800/95 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <svg 
              className="w-4 h-4 text-zinc-400 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-zinc-300">Reconnecting...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Rate limit indicator
 */
export function RateLimitIndicator({ 
  show, 
  retryAfter 
}: { 
  show: boolean
  retryAfter?: number 
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-zinc-900/95 backdrop-blur-lg border border-zinc-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10">
              <svg 
                className="w-6 h-6 text-amber-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 text-center mb-2">
              Too Many Requests
            </h3>
            <p className="text-sm text-zinc-400 text-center mb-4">
              Please wait a moment before trying again.
              {retryAfter && (
                <span className="block mt-1">
                  Try again in {retryAfter} seconds.
                </span>
              )}
            </p>
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: retryAfter || 30, 
                    ease: "linear" 
                  }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Timeout error state
 */
export function TimeoutState({ 
  onRetry,
  message = "The request took too long. Please try again."
}: { 
  onRetry?: () => void
  message?: string
}) {
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
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <svg 
          className="w-8 h-8 text-amber-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Request Timeout</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white rounded-lg font-medium hover:border-purple-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Try Again
        </button>
      )}
    </motion.div>
  )
}
