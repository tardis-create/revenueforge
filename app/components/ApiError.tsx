'use client'

export function ApiError({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
      {message}
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
