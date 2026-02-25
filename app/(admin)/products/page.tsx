'use client'

import { useState, useEffect } from 'react'
import type { Product, ProductInput } from '@/lib/types'
import { CATEGORIES, INDUSTRIES } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { MagnetButton } from '@/app/components/ui/magnet-button'
import { TextAnimate } from '@/app/components/ui/text-animate'
import { LiquidGlass } from '@/app/components/ui/liquid-glass'
import { SpringMotion, SpringScale } from '@/app/components/ui/spring-motion'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

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

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json() as { success: boolean; error?: string }
      
      if (data.success) {
        setProducts(products.filter(p => p.id !== id))
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </a>
          
          <div className="flex items-center gap-6">
            <a href="/catalog" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Catalog</a>
            <a href="/admin/products" className="text-zinc-100 text-sm font-medium">Admin</a>
          </div>
        </nav>

        {/* Header */}
        <header className="px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <SpringMotion>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                  <TextAnimate animation="blurIn">Product Management</TextAnimate>
                </h1>
                <p className="text-zinc-400">
                  Add, edit, and manage product catalog
                </p>
              </div>
            </SpringMotion>
            
            <SpringMotion delay={0.1}>
              <MagnetButton
                onClick={() => {
                  setEditingProduct(null)
                  setShowForm(true)
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </span>
              </MagnetButton>
            </SpringMotion>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          {/* Form Modal */}
          {showForm && (
            <ProductForm 
              product={editingProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
            />
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <SpringScale>
              <LiquidGlass className="py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-zinc-100 mb-2">No products</h3>
                <p className="text-zinc-500 mb-6">Get started by creating a new product.</p>
                <MagnetButton
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </span>
                </MagnetButton>
              </LiquidGlass>
            </SpringScale>
          ) : (
            <SpringScale>
              <LiquidGlass className="overflow-hidden">
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
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-4">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                              product.is_active 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
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
              </LiquidGlass>
            </SpringScale>
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
        <SpringScale>
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
                <MagnetButton
                  type="button"
                  onClick={onCancel}
                  className="px-6"
                >
                  Cancel
                </MagnetButton>
                <MagnetButton
                  type="submit"
                  disabled={loading}
                  className={`px-6 ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30'}`}
                >
                  {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </MagnetButton>
              </div>
            </form>
          </div>
        </SpringScale>
      </div>
    </div>
  )
}
