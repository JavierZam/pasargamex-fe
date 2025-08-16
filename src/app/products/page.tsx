'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent, LoadingSpinner } from '@/components/ui'
import { GameCard3D } from '@/components/ui'
import { apiClient } from '@/lib/api'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  seller_id: string
  seller_username?: string
  rating?: number
  reviews_count?: number
  created_at: string
  tags?: string[]
  is_featured?: boolean
}

interface ProductFilters {
  search: string
  category: string
  minPrice: number
  maxPrice: number
  sortBy: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular'
  page: number
  limit: number
}

const CATEGORIES = [
  'All Categories',
  'Action Games',
  'RPG Games',
  'Strategy Games',
  'Sports Games',
  'Racing Games',
  'Adventure Games',
  'Simulation Games',
  'Puzzle Games',
  'Indie Games',
  'Game Accounts',
  'Game Items',
  'Game Currency'
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' }
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All Categories',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 10000,
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12
  })

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Update URL when filters change
  const updateURL = useCallback((newFilters: ProductFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.category !== 'All Categories') params.set('category', newFilters.category)
    if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString())
    if (newFilters.maxPrice < 10000) params.set('maxPrice', newFilters.maxPrice.toString())
    if (newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy)
    if (newFilters.page > 1) params.set('page', newFilters.page.toString())

    const newURL = params.toString() ? `/products?${params.toString()}` : '/products'
    router.push(newURL, { scroll: false })
  }, [router])

  // Load products based on current filters
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = {
        search: filters.search || undefined,
        category: filters.category !== 'All Categories' ? filters.category : undefined,
        min_price: filters.minPrice > 0 ? filters.minPrice : undefined,
        max_price: filters.maxPrice < 10000 ? filters.maxPrice : undefined,
        sort_by: filters.sortBy,
        page: filters.page,
        limit: filters.limit
      }

      const response = await apiClient.getProducts(queryParams)
      
      if (response.success && response.data) {
        const data = response.data as any
        if (Array.isArray(data)) {
          setProducts(data)
          setTotalProducts(data.length)
          setTotalPages(Math.ceil(data.length / filters.limit))
        } else if (data.products) {
          setProducts(data.products)
          setTotalProducts(data.total || data.products.length)
          setTotalPages(Math.ceil((data.total || data.products.length) / filters.limit))
        }
      } else {
        // Fallback to mock data for development
        const mockProducts = generateMockProducts(filters)
        setProducts(mockProducts.products)
        setTotalProducts(mockProducts.total)
        setTotalPages(mockProducts.totalPages)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to mock data
      const mockProducts = generateMockProducts(filters)
      setProducts(mockProducts.products)
      setTotalProducts(mockProducts.total)
      setTotalPages(mockProducts.totalPages)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Generate mock products for development
  const generateMockProducts = (currentFilters: ProductFilters) => {
    const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
      id: `product-${i + 1}`,
      title: `${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]} - Premium Item ${i + 1}`,
      description: `High-quality gaming product with excellent features and guaranteed satisfaction. Perfect for serious gamers.`,
      price: Math.floor(Math.random() * 500) + 10,
      category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
      image_url: `https://picsum.photos/400/300?random=${i}`,
      seller_id: `seller-${Math.floor(Math.random() * 10) + 1}`,
      seller_username: `gamer${Math.floor(Math.random() * 1000)}`,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      reviews_count: Math.floor(Math.random() * 500) + 10,
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      tags: ['gaming', 'premium', 'verified'],
      is_featured: Math.random() > 0.8
    }))

    // Apply filters to mock data
    let filteredProducts = mockProducts

    if (currentFilters.search) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(currentFilters.search.toLowerCase())
      )
    }

    if (currentFilters.category !== 'All Categories') {
      filteredProducts = filteredProducts.filter(product =>
        product.category === currentFilters.category
      )
    }

    filteredProducts = filteredProducts.filter(product =>
      product.price >= currentFilters.minPrice && product.price <= currentFilters.maxPrice
    )

    // Apply sorting
    switch (currentFilters.sortBy) {
      case 'price_low':
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'popular':
        filteredProducts.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
        break
      default: // newest
        filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // Apply pagination
    const startIndex = (currentFilters.page - 1) * currentFilters.limit
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + currentFilters.limit)

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / currentFilters.limit)
    }
  }

  // Update filters and trigger product load
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 } // Reset to page 1 when filters change
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  // Load products when filters change
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">GAME</span>
            <span className="text-brand-blue">STORE</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover premium gaming products, rare items, and exclusive accounts from verified sellers worldwide.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for games, items, accounts..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full text-lg py-4"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({
                      search: '',
                      category: 'All Categories',
                      minPrice: 0,
                      maxPrice: 10000,
                      sortBy: 'newest'
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Price Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilters({ minPrice: Number(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: Number(e.target.value) || 10000 })}
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full"
              >
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-400">
                {loading ? (
                  'Loading products...'
                ) : (
                  `Showing ${products.length} of ${totalProducts} products`
                )}
              </div>
              <div className="text-gray-400">
                Page {filters.page} of {totalPages}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" className="text-brand-red" />
              </div>
            )}

            {/* Products Grid */}
            {!loading && (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <GameCard3D
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description}
                        price={product.price}
                        category={product.category}
                        image={product.image_url}
                        rating={product.rating || 0}
                        reviews={product.reviews_count || 0}
                        seller={product.seller_username || 'Unknown Seller'}
                        isNew={product.is_featured}
                        onClick={() => router.push(`/products/${product.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">No products found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search criteria or filters</p>
                    <Button onClick={() => updateFilters({ search: '', category: 'All Categories' })}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={filters.page === pageNum ? "primary" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={filters.page === totalPages}
                      onClick={() => handlePageChange(filters.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}