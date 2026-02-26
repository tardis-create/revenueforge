'use client'

import { useState, useEffect } from 'react'
import type { Product, ProductInput } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent,
  SpringButton, 
  LiquidCard, 
  LoadingSkeleton, 
  EmptyState, 
  ErrorState,
  HamburgerMenu,
  CardSkeleton,
  useToast
} from '@/app/components'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [industryFilter, setIndustryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { success, error: showError } = useToast()

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/products`)
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

  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = [...products]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    
    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter(p => p.industry === industryFilter)
    }
    
    // Status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(p => p.is_active === isActive)
    }
    
    setFilteredProducts(filtered)
  }, [products, searchQuery, categoryFilter, industryFilter, statusFilter])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json() as { success: boolean; error?: string }
      
      if (data.success) {
        setProducts(products.filter(p => p.id !== id))
        success('Product deleted', 'The product has been successfully removed.')
      } else {
        showError('Delete failed', data.error || 'Failed to delete product')
      }
    } catch (err) {
      showError('Delete failed', 'Failed to delete product. Please try again.')
    }
  }

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  // Handle form success
  const handleFormSuccess = (isEditing: boolean) => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
    success(
      isEditing ? 'Product updated' : 'Product created',
      isEditing ? 'The product has been successfully updated.' : 'The product has been successfully created.'
    )
  }

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
            <a href="/catalog" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Catalog</a>
            <a href="/admin/products" className="text-zinc-100 text-sm font-medium">Admin</a>
          </div>
          
          <div className="md:hidden">
            <HamburgerMenu />
          </div>
        </nav>

        {/* Header */}
        <header className="px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <AnimatedContent>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                  <BlurText text="Product Management" />
                </h1>
                <p className="text-zinc-400">
                  Add, edit, and manage product catalog
                </p>
              </div>
            </AnimatedContent>
            
            <AnimatedContent delay={0.1}>
              <SpringButton
                variant="primary"
                onClick={() => {
                  setEditingProduct(null)
                  setShowForm(true)
                }}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </SpringButton>
            </AnimatedContent>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 md:pb-12">
          {/* Search and Filters */}
          {!loading && products.length > 0 && (
            <AnimatedContent delay={0.15}>
              <LiquidCard glassIntensity="low" className="mb-6">
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {/* Industry Filter */}
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">All Industries</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Active Filters */}
                  {(searchQuery || categoryFilter || industryFilter || statusFilter) && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-zinc-500">Active filters:</span>
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm">
                          Search: {searchQuery}
                          <button onClick={() => setSearchQuery('')} className="hover:text-purple-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {categoryFilter && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm">
                          {categoryFilter}
                          <button onClick={() => setCategoryFilter('')} className="hover:text-cyan-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {industryFilter && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm">
                          {industryFilter}
                          <button onClick={() => setIndustryFilter('')} className="hover:text-cyan-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {statusFilter && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm">
                          {statusFilter === 'active' ? 'Active' : 'Inactive'}
                          <button onClick={() => setStatusFilter('')} className="hover:text-emerald-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setCategoryFilter('')
                          setIndustryFilter('')
                          setStatusFilter('')
                        }}
                        className="text-sm text-zinc-400 hover:text-zinc-200 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </LiquidCard>
            </AnimatedContent>
          )}

          {/* Form Modal */}
          {showForm && (
            <ProductForm 
              product={editingProduct}
              onSuccess={() => handleFormSuccess(!!editingProduct)}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
            />
          )}

          {/* Error State */}
          {error && (
            <ErrorState 
              description={error}
              retry={fetchProducts}
            />
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredProducts.length === 0 && products.length > 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No products match your filters"
              description="Try adjusting your search or filter criteria."
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery('')
                  setCategoryFilter('')
                  setIndustryFilter('')
                  setStatusFilter('')
                }
              }}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title="No products yet"
              description="Get started by creating your first product in the catalog."
              action={{
                label: "Add Product",
                onClick: () => setShowForm(true)
              }}
            />
          ) : (
            <LiquidCard glassIntensity="low">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            SKU
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Industry
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Price Range
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-4">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => handleEdit(product)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {product.image_url ? (
                                    <img 
                                      className="h-10 w-10 rounded-lg object-cover" 
                                      src={product.image_url} 
                                      alt={product.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                      <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-zinc-100">
                                    {product.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-zinc-500">
                                {product.sku}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {product.industry}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                              {product.price_range || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                (product.stock || 0) > 10 
                                  ? 'text-emerald-400' 
                                  : (product.stock || 0) > 0 
                                    ? 'text-yellow-400' 
                                    : 'text-red-400'
                              }`}>
                                {product.stock ?? 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                product.is_active 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-purple-400 hover:text-purple-300 mr-4 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            </LiquidCard>
          )}
        </main>
      </div>
    </div>
  )
}

// Product Form Component
function ProductForm({ 
  product, 
  onSuccess, 
  onCancel 
}: { 
  product: Product | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<ProductInput>(() => ({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || CATEGORIES[0],
    industry: product?.industry || INDUSTRIES[0],
    description: product?.description || '',
    price_range: product?.price_range || '',
    image_url: product?.image_url || '',
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true,
    technical_specs: product?.technical_specs || {},
  }))

  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')

  const addSpec = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        technical_specs: {
          ...formData.technical_specs,
          [specKey]: specValue,
        },
      })
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.technical_specs }
    delete newSpecs[key]
    setFormData({ ...formData, technical_specs: newSpecs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = product ? `${API_BASE_URL}/api/products/${product.id}` : `${API_BASE_URL}/api/products`
      const method = product ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json() as { success: boolean; error?: string }
      
      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>

        {/* Modal */}
        <AnimatedContent>
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-zinc-400 mb-2">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label htmlFor="sku" className="block text-sm text-zinc-400 mb-2">
                      SKU <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Category & Industry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm text-zinc-400 mb-2">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm text-zinc-400 mb-2">
                        Industry <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                      >
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm text-zinc-400 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none"
                    />
                  </div>

                  {/* Technical Specs */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Technical Specifications
                    </label>
                    
                    {/* Existing specs */}
                    {formData.technical_specs && Object.keys(formData.technical_specs).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(formData.technical_specs).map(([key, value]) => (
                          <span 
                            key={key}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm"
                          >
                            <span className="font-medium text-zinc-300">{key}:</span>
                            <span className="text-zinc-400">{value}</span>
                            <button
                              type="button"
                              onClick={() => removeSpec(key)}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add new spec */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Spec name"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addSpec}
                        className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label htmlFor="price_range" className="block text-sm text-zinc-400 mb-2">
                      Price Range
                    </label>
                    <input
                      type="text"
                      id="price_range"
                      value={formData.price_range || ''}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      placeholder="e.g., $500-$800"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label htmlFor="stock" className="block text-sm text-zinc-400 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      id="stock"
                      value={formData.stock ?? 0}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label htmlFor="image_url" className="block text-sm text-zinc-400 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                    />
                    <label htmlFor="is_active" className="text-sm text-zinc-300">
                      Active (visible in catalog)
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3">
                <SpringButton
                  variant="secondary"
                  type="button"
                  onClick={onCancel}
                >
                  Cancel
                </SpringButton>
                <SpringButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </SpringButton>
              </div>
            </form>
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
