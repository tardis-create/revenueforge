import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="text-center">
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          RevenueForge
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12">
          Revenue optimization platform
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/catalog"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Catalog
          </Link>
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </main>
    </div>
  )
}
