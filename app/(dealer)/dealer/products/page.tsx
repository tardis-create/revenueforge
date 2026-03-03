'use client'
import Link from 'next/link'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover,
  SpotlightCard,
  ErrorState,
  CardSkeleton
} from '@/app/components'
import { API_BASE_URL } from '@/lib/api'

interface Product {
  id: string
  name: string
  description: string
  category: string
  retailPrice: number
  dealerPrice: number
  commission: number
  inStock: boolean
  image?: string
}

interface ApiProduct {
  id: string
  name: string
  description: string | null
  category: string
  price: number | null
  stock: number | null
}

export default function DealerProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json() as { success: boolean; data?: ApiProduct[]; error?: string }
      
      if (data.success && data.data) {
        // Map API response to component interface
        const mappedProducts: Product[] = data.data.map((product) => {
          const retailPrice = product.price || 0
          const dealerPrice = Math.round(retailPrice * 0.75) // 25% discount for dealers
          const commission = Math.round(dealerPrice * 0.10) // 10% commission
          
          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category,
            retailPrice,
            dealerPrice,
            commission,
            inStock: (product.stock || 0) > 0,
          }
        })
        setProducts(mappedProducts)
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

  const categories = ['all', 'Sensors', 'Controllers', 'Measurement', 'Safety', 'Analysis', 'Actuators', 'Communication', 'Power']

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handlePlaceOrder = (product: Product) => {
    alert(`Order placed for ${product.name}!\nDealer Price: $${product.dealerPrice}\nYour Commission: $${product.commission}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glows */}
      <div className="fixed top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/dealer" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Dashboard</Link>
            <Link href="/dealer/products" className="text-zinc-100 text-sm font-medium">Products</Link>
            <Link href="/dealer/orders" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Orders</Link>
            <Link href="/dealer/commissions" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">Commissions</Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          {/* Page Header */}
          <AnimatedContent>
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                <BlurText text="Product Catalog" />
              </h1>
              <p className="text-zinc-400">
                Browse products with exclusive dealer pricing
              </p>
            </div>
          </AnimatedContent>

          {/* Error State */}
          {error && (
            <AnimatedContent>
              <GlareHover glareColor="rgba(239, 68, 68, 0.2)" glareSize={300}>
                <div className="py-12 text-center p-8 bg-red-900/20 border border-red-800/50 rounded-xl backdrop-blur-sm mb-6">
                  <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">Failed to load products</h3>
                  <p className="text-zinc-400 mb-4">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                  <div className="h-40 bg-zinc-800/50 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-zinc-800/50 rounded w-1/3 animate-pulse" />
                    <div className="h-5 bg-zinc-800/50 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-zinc-800/50 rounded w-full animate-pulse" />
                    <div className="h-10 bg-zinc-800/50 rounded mt-4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          {!loading && !error && (
          <AnimatedContent delay={0.1}>
            <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={300}>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                        }`}
                      >
                        {category === 'all' ? 'All Products' : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlareHover>
          </AnimatedContent>
          )}

          {/* Products Grid */}
          {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product, i) => (
              <AnimatedContent key={product.id} delay={0.05 * (i % 3)}>
                <SpotlightCard
                  className={`bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm ${
                    !product.inStock ? 'opacity-60' : ''
                  }`}
                  spotlightColor="rgba(168, 85, 247, 0.12)"
                >
                  {/* Product Image Placeholder */}
                  <div className="h-40 bg-zinc-800/50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-700/50">
                        {product.category}
                      </span>
                      {!product.inStock && (
                        <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">{product.name}</h3>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{product.description}</p>

                    {/* Pricing */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Retail Price:</span>
                        <span className="text-sm text-zinc-600 line-through">${product.retailPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Dealer Price:</span>
                        <span className="text-lg font-bold text-zinc-100">${product.dealerPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <span className="text-sm text-emerald-400 font-medium">Your Commission:</span>
                        <span className="text-base font-semibold text-emerald-400">${product.commission.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <ClickSpark sparkColor="#a855f7" sparkCount={8}>
                      <button
                        onClick={() => handlePlaceOrder(product)}
                        disabled={!product.inStock}
                        className="w-full px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-purple-500/30"
                      >
                        {product.inStock ? 'Place Order' : 'Out of Stock'}
                      </button>
                    </ClickSpark>
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <AnimatedContent>
              <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={300}>
                <div className="py-16 text-center p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">No products found</h3>
                  <p className="text-zinc-500">Try adjusting your search or filter criteria</p>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}

          {/* Summary Footer */}
          {!loading && !error && (
          <AnimatedContent delay={0.3}>
            <div className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-sm text-zinc-300">Showing {filteredProducts.length} of {products.length} products</div>
                  <div className="text-xs text-zinc-500 mt-1">All prices in USD - Commission: 10% of dealer price</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Need help?</span>
                  <a href="mailto:support@revenueforge.io" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </AnimatedContent>
          )}
        </main>
      </div>
    </div>
  )
}
