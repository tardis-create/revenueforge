'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Product, ProductFilters } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { useDebounce, useOnlineStatus } from '@/lib/hooks'
import { 
  BlurText, 
  AnimatedContent,
  SpringButton, 
  LiquidCard, 
  LoadingSkeleton,
  CardSkeleton,
  ErrorState,
  EmptyState,
  HamburgerMenu,
  StaggerContainer,
  StaggerItem,
  TimeoutState
} from '@/app/components'

const REQUEST_TIMEOUT = 15000 // 15 seconds
const PAGE_SIZE = 9 // 3x3 grid

interface PaginatedResponse {
  success: boolean
  data?: Product[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    industry: '',
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    total: number
    totalPages: number
  } | null>(null)
  
  const isOnline = useOnlineStatus()
  const debouncedSearch = useDebounce(filters.search, 300)

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setIsTimeout(false)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
      
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', String(PAGE_SIZE))
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (filters.category) params.append('category', filters.category)
      if (filters.industry) params.append('industry', filters.industry)
      
      const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as PaginatedResponse
      
      if (data.success && data.data) {
        setProducts(data.data)
        if (data.pagination) {
          setPagination({
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          })
        } else {
          // Fallback if API doesn't return pagination info
          setPagination({
            total: data.data.length,
            totalPages: 1,
          })
        }
      } else {
        setError(data.error || 'Failed to load products')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setIsTimeout(true)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.category, filters.industry])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.category, filters.industry])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Pagination handlers
  const goToPage = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage)
      // Scroll to top of product grid
      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const goToNextPage = () => goToPage(page + 1)
  const goToPrevPage = () => goToPage(page - 1)

  // Clear filters and reset page
  const handleClearFilters = () => {
    setFilters({ search: '', category: '', industry: '' })
    setPage(1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" aria-hidden="true" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50 relative" role="navigation" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6" role="menubar">
            <Link href="/catalog" className="text-zinc-100 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded px-2 py-1" role="menuitem">Catalog</Link>
            <Link href="/rfq" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded px-2 py-1" role="menuitem">Request Quote</Link>
          </div>
          
          <div className="md:hidden">
            <HamburgerMenu />
          </div>
        </nav>

        {/* Header */}
        <header className="px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <AnimatedContent>
              <h1 className="text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                <BlurText text="Product Catalog" />
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl">
                Browse our range of industrial products from verified suppliers
              </p>
            </AnimatedContent>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-72 flex-shrink-0" aria-label="Product filters">
              <AnimatedContent>
                <LiquidCard glassIntensity="medium" className="sticky top-6">
                  <div className="p-6">
                    <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">Filters</h2>

                    {/* Search */}
                    <div className="mb-6">
                      <label htmlFor="search" className="block text-sm text-zinc-400 mb-2">
                        Search
                      </label>
                      <input
                        type="search"
                        id="search"
                        name="search"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search products..."
                        aria-describedby="search-hint"
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                      />
                      <span id="search-hint" className="sr-only">Type to search products by name or description</span>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <label htmlFor="category" className="block text-sm text-zinc-400 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Industry Filter */}
                    <div className="mb-6">
                      <label htmlFor="industry" className="block text-sm text-zinc-400 mb-2">
                        Industry
                      </label>
                      <select
                        id="industry"
                        name="industry"
                        value={filters.industry}
                        onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                      >
                        <option value="">All Industries</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <SpringButton 
                      variant="secondary" 
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full"
                      aria-label="Clear all filters"
                    >
                      Clear Filters
                    </SpringButton>
                  </div>
                </LiquidCard>
              </AnimatedContent>
            </aside>

            {/* Product Grid */}
            <main id="main-content" className="flex-1 pb-24 md:pb-0" aria-label="Product list">
              {!isOnline ? (
                <ErrorState 
                  title="You're offline"
                  description="Please check your internet connection and try again."
                  retry={fetchProducts}
                />
              ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" aria-label="Loading products">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : isTimeout ? (
                <TimeoutState 
                  onRetry={fetchProducts}
                  message="The product catalog is taking too long to load. Please try again."
                />
              ) : error ? (
                <ErrorState 
                  description={error}
                  retry={fetchProducts}
                />
              ) : products.length === 0 ? (
                <NoResultsState 
                  hasFilters={!!(filters.search || filters.category || filters.industry)}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <>
                  <div className="mb-6 text-sm text-zinc-500" role="status" aria-live="polite">
                    Showing {products.length} of {pagination?.total || products.length} product{(pagination?.total || products.length) !== 1 ? 's' : ''}
                    {pagination && pagination.totalPages > 1 && ` (page ${page} of ${pagination.totalPages})`}
                    {debouncedSearch && ` for "${debouncedSearch}"`}
                    {filters.category && ` in ${filters.category}`}
                    {filters.industry && ` for ${filters.industry}`}
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" role="list">
                    <StaggerContainer>
                      {products.map((product) => (
                        <StaggerItem key={product.id}>
                          <li>
                            <ProductCard product={product} />
                          </li>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </ul>
                  
                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <PaginationControls
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPrev={goToPrevPage}
                      onNext={goToNextPage}
                      onPageSelect={goToPage}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pagination Controls Component
function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
}: {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onPageSelect: (page: number) => void
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsis = totalPages > 7
    
    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage <= 3) {
        // Near start: 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push('ellipsis')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <nav 
      className="mt-10 flex items-center justify-center gap-2" 
      role="navigation" 
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-700/50 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        aria-label="Go to previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span 
              key={`ellipsis-${index}`} 
              className="px-2 py-2 text-zinc-500"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageSelect(page)}
              className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                currentPage === page
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-100'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-700/50 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}

// No Results State Component
function NoResultsState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No products found"
      description={
        hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "There are no products available at the moment. Please check back later."
      }
      action={hasFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
    />
  )
}

// Product Card Component with LiquidCard
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/catalog/${product.id}`} className="block group">
      <LiquidCard 
        spotlightColor="rgba(168, 85, 247, 0.15)"
        glassIntensity="medium"
        className="overflow-hidden h-full"
      >
        {/* Product Image */}
        <div className="aspect-[16/10] bg-zinc-800/50 relative overflow-hidden -mx-6 -mt-6 mb-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2" />
              </svg>
            </div>
          )}
          {!product.is_active && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-zinc-700/90 text-zinc-300 text-xs rounded-md backdrop-blur-sm">
              Inactive
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pt-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded flex-shrink-0">
              {product.sku}
            </span>
          </div>
          
          <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
            {product.description || 'No description available'}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {product.category}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {product.industry}
            </span>
          </div>

          {product.price_range && (
            <p className="text-sm font-semibold text-zinc-100">
              {product.price_range}
            </p>
          )}
        </div>
      </LiquidCard>
    </Link>
  )
}
