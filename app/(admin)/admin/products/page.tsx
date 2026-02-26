'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Product, ProductInput } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { 
  BlurText, 
  AnimatedContent,
  SpringButton, 
  LiquidCard, 
  CardSkeleton,
  EmptyState,
  ErrorState,
  useToast,
  GlareHover
} from '@/app/components'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
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

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && product.is_active) ||
        (filterStatus === 'inactive' && !product.is_active)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, filterCategory, filterStatus])

  // Handle delete (soft delete via API)
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

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    categories: [...new Set(products.map(p => p.category))].length
  }), [products])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Product Management" />
          </h1>
          <p className="text-zinc-400">
            Add, edit, and manage your product catalog
          </p>
        </AnimatedContent>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedContent delay={0.05}>
          <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
              <div className="text-xs text-zinc-500 mt-1">Total Products</div>
            </div>
          </GlareHover>
        </AnimatedContent>
        <AnimatedContent delay={0.1}>
          <GlareHover glareColor="rgba(16, 185, 129, 0.15)" glareSize={200}>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
              <div className="text-xs text-zinc-500 mt-1">Active</div>
            </div>
          </GlareHover>
        </AnimatedContent>
        <AnimatedContent delay={0.15}>
          <GlareHover glareColor="rgba(239, 68, 68, 0.15)" glareSize={200}>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
              <div className="text-xs text-zinc-500 mt-1">Inactive</div>
            </div>
          </GlareHover>
        </AnimatedContent>
        <AnimatedContent delay={0.2}>
          <GlareHover glareColor="rgba(6, 182, 212, 0.15)" glareSize={200}>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyan-400">{stats.categories}</div>
              <div className="text-xs text-zinc-500 mt-1">Categories</div>
            </div>
          </GlareHover>
        </AnimatedContent>
      </div>

      {/* Actions Bar */}
      <AnimatedContent delay={0.15}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <SpringButton
              variant="primary"
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </SpringButton>
          </div>
        </div>
      </AnimatedContent>

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
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? "No products match your filters" : "No products yet"}
          description={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? "Try adjusting your search or filters." : "Get started by creating your first product in the catalog."}
          action={{
            label: "Add Product",
            onClick: () => setShowForm(true)
          }}
        />
      ) : (
        <AnimatedContent delay={0.2}>
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
                      Price
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
                    <tr 
                      key={product.id} 
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
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
                            {product.description && (
                              <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                                {product.description}
                              </div>
                            )}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                        {product.price != null ? `$${product.price.toLocaleString()}` : (product.price_range || '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          (product.stock ?? 0) > 10 
                            ? 'text-emerald-400' 
                            : (product.stock ?? 0) > 0 
                              ? 'text-amber-400' 
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
            
            {/* Results count */}
            <div className="px-6 py-3 border-t border-zinc-800/50 text-sm text-zinc-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </LiquidCard>
        </AnimatedContent>
      )}
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
    price: product?.price ?? undefined,
    image_url: product?.image_url || '',
    stock: product?.stock ?? undefined,
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
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-100">
                    {product ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

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

                  {/* Price & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm text-zinc-400 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="price"
                        step="0.01"
                        min="0"
                        value={formData.price ?? ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="stock" className="block text-sm text-zinc-400 mb-2">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        id="stock"
                        min="0"
                        value={formData.stock ?? ''}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label htmlFor="price_range" className="block text-sm text-zinc-400 mb-2">
                      Price Range (display)
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
                  <div className="flex items-center gap-3 py-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.is_active}
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.is_active ? 'bg-purple-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <label className="text-sm text-zinc-300 cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                      Active (visible in catalog)
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-zinc-800/30 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
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
