'use client'
export const runtime = 'edge'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { Product } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api'
import { useOnlineStatus } from '@/lib/hooks'
import { 
  BlurText, 
  AnimatedContent,
  SpringButton, 
  LiquidCard,
  ErrorState,
  HamburgerMenu,
  LoadingSkeleton,
  TimeoutState
} from '@/app/components'

const REQUEST_TIMEOUT = 15000 // 15 seconds

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  
  const isOnline = useOnlineStatus()

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    
    try {
      setLoading(true)
      setError(null)
      setIsTimeout(false)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
      
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.status === 404) {
        throw new Error('Product not found')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as { success: boolean; data?: Product; error?: string }
      
      if (data.success && data.data) {
        setProduct(data.data)
      } else {
        setError(data.error || 'Failed to load product')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setIsTimeout(true)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      }
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

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

        {/* Breadcrumb */}
        <div className="px-6 lg:px-12 py-4 border-b border-zinc-800/30">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/catalog" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                    Catalog
                  </Link>
                </li>
                <li className="text-zinc-600" aria-hidden="true">/</li>
                <li className="text-zinc-300 truncate max-w-xs" aria-current="page">
                  {loading ? 'Loading...' : product?.name || 'Not Found'}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main id="main-content" className="px-6 lg:px-12 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {!isOnline ? (
              <ErrorState 
                title="You're offline"
                description="Please check your internet connection and try again."
                retry={fetchProduct}
              />
            ) : loading ? (
              <ProductDetailSkeleton />
            ) : isTimeout ? (
              <TimeoutState 
                onRetry={fetchProduct}
                message="The product details are taking too long to load. Please try again."
              />
            ) : error ? (
              <ErrorState 
                title={error === 'Product not found' ? 'Product Not Found' : 'Error'}
                description={error}
                retry={error !== 'Product not found' ? fetchProduct : undefined}
              />
            ) : product ? (
              <ProductDetail product={product} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Skeleton */}
      <div className="aspect-[16/10] bg-zinc-800/50 rounded-2xl animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-10 bg-zinc-800/50 rounded-lg w-3/4 animate-pulse" />
          <div className="h-5 bg-zinc-800/50 rounded-lg w-1/4 animate-pulse" />
        </div>
        
        <div className="flex gap-2">
          <div className="h-7 bg-zinc-800/50 rounded-full w-24 animate-pulse" />
          <div className="h-7 bg-zinc-800/50 rounded-full w-24 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-zinc-800/50 rounded w-full animate-pulse" />
          <div className="h-4 bg-zinc-800/50 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-zinc-800/50 rounded w-4/6 animate-pulse" />
        </div>
        
        <div className="h-12 bg-zinc-800/50 rounded-lg w-full animate-pulse" />
      </div>
    </div>
  )
}

function ProductDetail({ product }: { product: Product }) {
  const hasSpecs = product.technical_specs && Object.keys(product.technical_specs).length > 0
  
  return (
    <AnimatedContent>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative">
          <LiquidCard glassIntensity="low" className="overflow-hidden">
            <div className="aspect-[16/10] bg-zinc-800/50 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2" />
                  </svg>
                </div>
              )}
              {!product.is_active && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-zinc-700/90 text-zinc-300 text-sm rounded-md backdrop-blur-sm">
                  Inactive
                </div>
              )}
            </div>
          </LiquidCard>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-3">
              {product.name}
            </h1>
            <p className="text-sm font-mono text-zinc-500">SKU: {product.sku}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {product.category}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {product.industry}
            </span>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          {/* Price Range */}
          {product.price_range && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-3">
                Price Range
              </h2>
              <p className="text-2xl font-bold text-zinc-100">
                {product.price_range}
              </p>
            </div>
          )}

          {/* Technical Specifications */}
          {hasSpecs && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">
                Technical Specifications
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.technical_specs!).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-zinc-800/50 px-4 py-3 rounded-lg">
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
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href={`/rfq?product=${product.id}`} className="flex-1">
              <SpringButton variant="primary" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Request Quote
              </SpringButton>
            </Link>
            <Link href="/catalog" className="flex-1 sm:flex-initial">
              <SpringButton variant="secondary" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Catalog
              </SpringButton>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedContent>
  )
}
