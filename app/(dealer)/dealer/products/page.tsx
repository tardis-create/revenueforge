'use client';

import { useState } from 'react';

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

export default function DealerProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [products] = useState<Product[]>([
    {
      id: 'PROD-001',
      name: 'Enterprise Analytics Suite',
      description: 'Comprehensive analytics platform for large-scale data processing and visualization.',
      category: 'Analytics',
      retailPrice: 5999,
      dealerPrice: 4500,
      commission: 450,
      inStock: true,
    },
    {
      id: 'PROD-002',
      name: 'Revenue Intelligence Platform',
      description: 'AI-powered revenue forecasting and optimization tools.',
      category: 'Intelligence',
      retailPrice: 4299,
      dealerPrice: 3200,
      commission: 320,
      inStock: true,
    },
    {
      id: 'PROD-003',
      name: 'Smart Automation Tools',
      description: 'Automate repetitive tasks with intelligent workflow engines.',
      category: 'Automation',
      retailPrice: 3499,
      dealerPrice: 2800,
      commission: 280,
      inStock: true,
    },
    {
      id: 'PROD-004',
      name: 'Predictive Analytics Module',
      description: 'Machine learning models for predictive business insights.',
      category: 'Analytics',
      retailPrice: 6799,
      dealerPrice: 5100,
      commission: 510,
      inStock: true,
    },
    {
      id: 'PROD-005',
      name: 'Team Collaboration Suite',
      description: 'Unified workspace for cross-team alignment and communication.',
      category: 'Collaboration',
      retailPrice: 2499,
      dealerPrice: 1900,
      commission: 190,
      inStock: true,
    },
    {
      id: 'PROD-006',
      name: 'Customer Insights Dashboard',
      description: 'Real-time customer behavior analytics and segmentation.',
      category: 'Analytics',
      retailPrice: 3999,
      dealerPrice: 3000,
      commission: 300,
      inStock: true,
    },
    {
      id: 'PROD-007',
      name: 'Sales Pipeline Manager',
      description: 'End-to-end sales pipeline tracking and optimization.',
      category: 'Intelligence',
      retailPrice: 2999,
      dealerPrice: 2200,
      commission: 220,
      inStock: false,
    },
    {
      id: 'PROD-008',
      name: 'Financial Reporting Suite',
      description: 'Automated financial reports and compliance documentation.',
      category: 'Reporting',
      retailPrice: 4499,
      dealerPrice: 3400,
      commission: 340,
      inStock: true,
    },
  ]);

  const categories = ['all', 'Analytics', 'Intelligence', 'Automation', 'Collaboration', 'Reporting'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = (product: Product) => {
    // In a real app, this would add to cart or open order form
    alert(`Order placed for ${product.name}!\nDealer Price: $${product.dealerPrice}\nYour Commission: $${product.commission}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Product Catalog</h1>
        <p className="text-zinc-600 mt-1">Browse products with exclusive dealer pricing</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all ${
              !product.inStock ? 'opacity-60' : ''
            }`}
          >
            {/* Product Image Placeholder */}
            <div className="h-40 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
              <span className="text-5xl">📦</span>
            </div>

            <div className="p-6">
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                  {product.category}
                </span>
                {!product.inStock && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Info */}
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{product.name}</h3>
              <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{product.description}</p>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Retail Price:</span>
                  <span className="text-sm text-zinc-400 line-through">${product.retailPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">Dealer Price:</span>
                  <span className="text-lg font-bold text-zinc-900">${product.dealerPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-sm text-green-600 font-medium">Your Commission:</span>
                  <span className="text-base font-semibold text-green-600">${product.commission.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlaceOrder(product)}
                disabled={!product.inStock}
                className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Place Order' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No products found</h3>
          <p className="text-zinc-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-8 bg-zinc-900 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-sm text-zinc-300">Showing {filteredProducts.length} of {products.length} products</div>
            <div className="text-xs text-zinc-400 mt-1">All prices in USD • Commission: 10% of dealer price</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-300">Need help?</span>
            <a href="mailto:support@revenueforge.io" className="text-sm text-white hover:underline">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
