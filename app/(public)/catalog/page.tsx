'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Product, ProductFilters } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'

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
        
        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data)
        } else {
          setError(data.error)
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Browse our range of industrial products
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <label htmlFor="industry" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Industry
                </label>
                <select
                  id="industry"
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({ search: '', category: '', industry: '' })}
                className="w-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400">No products found</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
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
  )
}

// Product Card Component
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
    >
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-zinc-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!product.is_active && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-600 text-white text-xs rounded">
            Inactive
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {product.sku}
          </span>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
          {product.description || 'No description available'}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            {product.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
            {product.industry}
          </span>
        </div>

        {product.price_range && (
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            {product.price_range}
          </p>
        )}
      </div>
    </article>
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
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"></div>

        {/* Modal */}
        <div 
          className="relative inline-block w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg text-left shadow-xl transform transition-all sm:my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product Image */}
          {product.image_url && (
            <div className="aspect-w-16 aspect-h-9 w-full">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 id="modal-title" className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {product.name}
                </h2>
                <p className="text-sm font-mono text-zinc-500 mt-1">SKU: {product.sku}</p>
              </div>
              {product.price_range && (
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {product.price_range}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {product.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                {product.industry}
              </span>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {product.description || 'No description available'}
            </p>

            {/* Technical Specs */}
            {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                  Technical Specifications
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.technical_specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                      <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Request Quote
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
