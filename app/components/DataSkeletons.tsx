export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800/50 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(cards)].map((_, i) => (
        <div key={i} className="h-32 bg-zinc-800/50 rounded-xl" />
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
      ))}
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-zinc-800/50 rounded mb-2" />
      <div className="h-4 w-64 bg-zinc-800/50 rounded" />
    </div>
  )
}

export function DetailViewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-zinc-800/50 rounded" />
      <div className="h-64 bg-zinc-800/50 rounded-xl" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-zinc-800/50 rounded-lg" />
      <div className="h-12 bg-zinc-800/50 rounded-lg" />
      <div className="h-24 bg-zinc-800/50 rounded-lg" />
    </div>
  )
}
