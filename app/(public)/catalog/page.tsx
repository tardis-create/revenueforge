'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Product, ProductFilters } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent
} from '@appletosolutions/reactbits'
import { 
  SpringButton, 
  LiquidCard, 
  LoadingSkeleton,
  CardSkeleton,
  ErrorState,
  HamburgerMenu,
  StaggerContainer,
  StaggerItem
} from '@/app/components'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    industry: '',
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.category) params.append('category', filters.category)
        if (filters.industry) params.append('industry', filters.industry)
        
        const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
        const data = await response.json() as { success: boolean; data?: Product[]; error?: string }
        
        if (data.success && data.data) {
          setProducts(data.data)
        } else {
          setError(data.error || 'Failed to load products')
        }
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  // Get unique categories and industries from products
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products])
  const industries = useMemo(() => [...new Set(products.map(p => p.industry))], [products])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50 relative">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </a>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="/catalog" className="text-zinc-100 text-sm font-medium">Catalog</a>
            <a href="/rfq" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Request Quote</a>
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
            <aside className="lg:w-72 flex-shrink-0">
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
                        type="text"
                        id="search"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search products..."
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <label htmlFor="category" className="block text-sm text-zinc-400 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
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
                      onClick={() => setFilters({ search: '', category: '', industry: '' })}
                      className="w-full"
                    >
                      Clear Filters
                    </SpringButton>
                  </div>
                </LiquidCard>
              </AnimatedContent>
            </aside>

            {/* Product Grid */}
            <main className="flex-1 pb-24 md:pb-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : error ? (
                <ErrorState 
                  description={error}
                  retry={() => window.location.reload()}
                />
              ) : products.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-zinc-500">No products found matching your criteria</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-sm text-zinc-500">
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </div>
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <StaggerItem key={product.id}>
                        <ProductCard 
                          product={product} 
                          onClick={() => setSelectedProduct(product)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </>
              )}
            </main>
          </div>
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
    </div>
  )
}

// Product Card Component with LiquidCard
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer group">
      <LiquidCard 
        spotlightColor="rgba(168, 85, 247, 0.15)"
        glassIntensity="medium"
        className="overflow-hidden"
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
    </div>
  )
}

// Product Detail Modal
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal */}
        <AnimatedContent>
          <div 
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-lg transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product Image */}
            {product.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-zinc-100">
                    {product.name}
                  </h2>
                  <p className="text-sm font-mono text-zinc-500 mt-1">SKU: {product.sku}</p>
                </div>
                {product.price_range && (
                  <span className="text-xl font-bold text-zinc-100">
                    {product.price_range}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {product.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {product.industry}
                </span>
              </div>

              <p className="text-zinc-400 mb-6">
                {product.description || 'No description available'}
              </p>

              {/* Technical Specs */}
              {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                    Technical Specifications
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product.technical_specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center bg-zinc-800/50 px-3 py-2 rounded-lg">
                        <dt className="text-sm text-zinc-500 capitalize">
                          {key.replace(/_/g, ' ')}
                        </dt>
                        <dd className="text-sm font-medium text-zinc-100">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a href="/rfq" className="flex-1">
                  <SpringButton variant="primary" className="w-full">
                    Request Quote
                  </SpringButton>
                </a>
                <SpringButton variant="secondary" onClick={onClose}>
                  Close
                </SpringButton>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
