"use client"

import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  color?: "purple" | "cyan" | "white" | "zinc"
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const colorMap = {
  purple: "border-purple-500",
  cyan: "border-cyan-500",
  white: "border-white",
  zinc: "border-zinc-400"
}

/**
 * Loading Spinner - Shows a spinning loader
 * 
 * Usage:
 * <LoadingSpinner size="lg" color="purple" />
 */
export function LoadingSpinner({ 
  size = "md", 
  className = "",
  color = "purple"
}: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-block ${className}`}
    >
      <div
        className={`
          ${sizeMap[size]}
          ${colorMap[color]}
          border-2
          border-t-transparent
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
    </motion.div>
  )
}

/**
 * Full Page Loader - Shows a centered spinner for page-level loading
 * 
 * Usage:
 * <PageLoader message="Loading dashboard..." />
 */
export function PageLoader({ 
  message = "Loading...",
  className = ""
}: { 
  message?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <LoadingSpinner size="xl" color="purple" />
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-sm text-zinc-400"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}

/**
 * Inline Loader - Shows a spinner with text inline
 * 
 * Usage:
 * <InlineLoader>Loading data...</InlineLoader>
 */
export function InlineLoader({ 
  children = "Loading...",
  className = ""
}: { 
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm" color="purple" />
      <span className="text-sm text-zinc-400">{children}</span>
    </div>
  )
}

/**
 * Button Loader - Spinner for button loading states
 * 
 * Usage:
 * <button disabled={loading}>
 *   {loading ? <ButtonLoader /> : 'Submit'}
 * </button>
 */
export function ButtonLoader({ className = "" }: { className?: string }) {
  return (
    <LoadingSpinner 
      size="sm" 
      color="white" 
      className={className}
    />
  )
}

/**
 * Dots Loader - Animated dots loader
 * 
 * Usage:
 * <DotsLoader />
 */
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-500 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

/**
 * Pulse Loader - Pulsing loader for subtle loading states
 * 
 * Usage:
 * <PulseLoader />
 */
export function PulseLoader({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`w-3 h-3 bg-purple-500 rounded-full ${className}`}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

/**
 * Skeleton Pulse - Animated skeleton for loading placeholders
 * 
 * Usage:
 * <SkeletonPulse className="h-4 w-full" />
 */
export function SkeletonPulse({ 
  className = "",
  rounded = "md"
}: { 
  className?: string
  rounded?: "sm" | "md" | "lg" | "full"
}) {
  const roundedMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  }

  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`bg-zinc-800 ${roundedMap[rounded]} ${className}`}
    />
  )
}
