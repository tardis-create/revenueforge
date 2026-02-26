'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
  success: (message: string, description?: string) => void
  error: (message: string, description?: string) => void
  info: (message: string, description?: string) => void
  warning: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const formatMessage = useCallback((message: string, description?: string) => {
    return description ? `${message}: ${description}` : message
  }, [])

  const success = useCallback((message: string, description?: string) => addToast(formatMessage(message, description), 'success'), [addToast, formatMessage])
  const error = useCallback((message: string, description?: string) => addToast(formatMessage(message, description), 'error'), [addToast, formatMessage])
  const info = useCallback((message: string, description?: string) => addToast(formatMessage(message, description), 'info'), [addToast, formatMessage])
  const warning = useCallback((message: string, description?: string) => addToast(formatMessage(message, description), 'warning'), [addToast, formatMessage])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    const noop = () => {}
    return {
      toasts: [],
      addToast: noop,
      removeToast: noop,
      success: noop,
      error: noop,
      info: noop,
      warning: noop,
    }
  }
  return context
}
