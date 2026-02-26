'use client'

interface ApiErrorProps {
  message: string
  title?: string
  error?: Error
  onRetry?: () => void | Promise<void>
}

export function ApiError({ message, title, error, onRetry }: ApiErrorProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl space-y-3">
      {title ? <div className="font-semibold text-red-300">{title}</div> : null}
      <div>{message}</div>
      {error?.message ? <div className="text-xs text-red-500">{error.message}</div> : null}
      {onRetry ? (
        <button
          onClick={() => void onRetry()}
          className="px-3 py-1.5 text-sm rounded-lg border border-red-400/40 hover:border-red-300/60 text-red-200"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function ErrorBoundaryFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">Something went wrong</h2>
        <p className="text-zinc-400 mb-6">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}
