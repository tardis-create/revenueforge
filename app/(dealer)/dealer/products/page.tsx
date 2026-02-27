'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/lib/api';
import { 
  BlurText, 
  AnimatedContent, 
  GlareHover,
  SpotlightCard,
  ClickSpark
} from '@/app/components';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  retailPrice: number;
  dealerPrice: number;
  commission: number;
  inStock: boolean;
  image?: string;
}

interface ProductsResponse {
  products?: Product[];
}

export default function DealerProductsPage() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/products`, { headers });
        if (res.ok) {
          const data: ProductsResponse = await res.json();
          // Transform API products to our format if needed
          const apiProducts = data.products || [];
          if (apiProducts.length > 0) {
            const transformedProducts = apiProducts.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || '',
              category: p.category || 'General',
              retailPrice: (p.retailPrice || p.dealerPrice * 1.2) || 0,
              dealerPrice: p.dealerPrice || 0,
              commission: p.commission || Math.round((p.dealerPrice || 0) * 0.1),
              inStock: p.inStock !== false,
              image: p.image,
            }));
            setProducts(transformedProducts);
          } else {
            setProducts(getMockProducts());
          }
        } else {
          setProducts(getMockProducts());
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts(getMockProducts());
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated]);

  const getMockProducts = (): Product[] => [
    { id: 'PROD-001', name: 'Enterprise Analytics Suite', description: 'Comprehensive analytics platform for large-scale data processing and visualization.', category: 'Analytics', retailPrice: 5999, dealerPrice: 4500, commission: 450, inStock: true },
    { id: 'PROD-002', name: 'Revenue Intelligence Platform', description: 'AI-powered revenue forecasting and optimization tools.', category: 'Intelligence', retailPrice: 4299, dealerPrice: 3200, commission: 320, inStock: true },
    { id: 'PROD-003', name: 'Smart Automation Tools', description: 'Automate repetitive tasks with intelligent workflow engines.', category: 'Automation', retailPrice: 3499, dealerPrice: 2800, commission: 280, inStock: true },
    { id: 'PROD-004', name: 'Predictive Analytics Module', description: 'Machine learning models for predictive business insights.', category: 'Analytics', retailPrice: 6799, dealerPrice: 5100, commission: 510, inStock: true },
    { id: 'PROD-005', name: 'Team Collaboration Suite', description: 'Unified workspace for cross-team alignment and communication.', category: 'Collaboration', retailPrice: 2499, dealerPrice: 1900, commission: 190, inStock: true },
    { id: 'PROD-006', name: 'Customer Insights Dashboard', description: 'Real-time customer behavior analytics and segmentation.', category: 'Analytics', retailPrice: 3999, dealerPrice: 3000, commission: 300, inStock: true },
    { id: 'PROD-007', name: 'Sales Pipeline Manager', description: 'End-to-end sales pipeline tracking and optimization.', category: 'Intelligence', retailPrice: 2999, dealerPrice: 2200, commission: 220, inStock: false },
    { id: 'PROD-008', name: 'Financial Reporting Suite', description: 'Automated financial reports and compliance documentation.', category: 'Reporting', retailPrice: 4499, dealerPrice: 3400, commission: 340, inStock: true },
  ];

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = (product: Product) => {
    alert(`Order placed for ${product.name}!\nDealer Price: $${product.dealerPrice}\nYour Commission: $${product.commission}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-zinc-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <AnimatedContent>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Product Catalog" />
          </h1>
          <p className="text-zinc-400">
            Browse products with exclusive dealer pricing (read-only)
          </p>
        </div>
      </AnimatedContent>

      {/* Filters */}
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

      {/* Products Grid */}
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

      {/* Empty State */}
      {filteredProducts.length === 0 && (
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
      <AnimatedContent delay={0.3}>
        <div className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800/50 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-sm text-zinc-300">Showing {filteredProducts.length} of {products.length} products</div>
              <div className="text-xs text-zinc-500 mt-1">All prices in USD • Commission: 10% of dealer price • Read-only catalog</div>
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
    </div>
  );
}
