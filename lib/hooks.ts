"use client"

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for async operations with loading, error, and timeout states
 */
export function useAsync<T, E = string>() {
  const [state, setState] = useState<{
    loading: boolean
    error: E | null
    data: T | null
    timeout: boolean
  }>({
    loading: false,
    error: null,
    data: null,
    timeout: false,
  })

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      options?: { timeoutMs?: number }
    ) => {
      setState({ loading: true, error: null, data: null, timeout: false })
      
      const timeoutMs = options?.timeoutMs || 30000
      let timeoutId: NodeJS.Timeout | null = null

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'))
          }, timeoutMs)
        })

        const data = await Promise.race([asyncFn(), timeoutPromise])
        
        if (timeoutId) clearTimeout(timeoutId)
        setState({ loading: false, error: null, data, timeout: false })
        return data
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)
        const isTimeout = (error as Error).message === 'Request timeout'
        setState({
          loading: false,
          error: isTimeout ? null : (error as E),
          data: null,
          timeout: isTimeout,
        })
        throw error
      }
    },
    []
  )

  return { ...state, execute }
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  options?: { loop?: boolean; enabled?: boolean }
) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const loop = options?.loop ?? true
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev + 1
            if (next >= itemCount) return loop ? 0 : prev
            return next
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev - 1
            if (next < 0) return loop ? itemCount - 1 : prev
            return next
          })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            onSelect(focusedIndex)
          }
          break
        case 'Escape':
          setFocusedIndex(-1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [itemCount, focusedIndex, onSelect, loop, enabled])

  return { focusedIndex, setFocusedIndex }
}

/**
 * Hook for detecting scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
