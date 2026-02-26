"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const duration = toast.duration || 5000

      setToasts((prev) => [...prev, { ...toast, id, duration }])

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "warning", title, message })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  // Only render on client
  const [mounted, setMounted] = useState(false)
  
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true)
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const icons: Record<ToastType, ReactNode> = {
    success: (
      <svg
        className="w-5 h-5 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-5 h-5 text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  }

  const styles: Record<ToastType, string> = {
    success: "bg-zinc-900/95 border-emerald-500/30",
    error: "bg-zinc-900/95 border-red-500/30",
    warning: "bg-zinc-900/95 border-amber-500/30",
    info: "bg-zinc-900/95 border-blue-500/30",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-xl ${styles[toast.type]}`}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-zinc-100 text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-zinc-400 text-sm mt-0.5">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 -mr-1 -mt-1 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800/50"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
        style={{
          color:
            toast.type === "success"
              ? "#34d399"
              : toast.type === "error"
              ? "#f87171"
              : toast.type === "warning"
              ? "#fbbf24"
              : "#60a5fa",
        }}
      />
    </motion.div>
  )
}

// Convenience hook for pages that need toast
export { type ToastType, type Toast }
