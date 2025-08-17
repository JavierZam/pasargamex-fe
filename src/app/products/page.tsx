'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent, LoadingSpinner, PriceDisplay, ProductCard } from '@/components/ui'
import { apiClient } from '@/lib/api'

interface Product {
  id: string
  game_title_id: string
  seller_id: string
  title: string
  description: string
  price: number
  type: 'account' | 'topup' | 'boosting' | 'item'
  attributes: Record<string, any>
  images: Array<{
    id: string
    url: string
    display_order: number
  }>
  status: 'draft' | 'active'
  stock: number
  sold_count: number
  delivery_method: 'instant' | 'middleman' | 'both'
  views: number
  featured: boolean
  created_at: string
  updated_at: string
  bumped_at: string
  // Legacy fields for compatibility
  category?: string
  image_url?: string
  seller_username?: string
  rating?: number
  reviews_count?: number
  tags?: string[]
  is_featured?: boolean
}

interface ProductFilters {
  search: string
  gameTitle: string
  minPrice: number
  maxPrice: number
  sortBy: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular'
  page: number
  limit: number
}

interface GameTitle {
  id: string
  name: string
  slug: string
}

const CATEGORIES = ['All', 'Accounts', 'Top-up', 'Boosting', 'Items']

// Helper function to validate and get proper image URLs
const getValidImageUrl = (imageUrl?: string, productTitle?: string) => {
  // Check if image URL is valid
  if (!imageUrl || 
      imageUrl.includes('example.com') || 
      imageUrl.includes('.claude\\image.png') ||
      imageUrl.includes('.claude/image.png') ||
      imageUrl === 'https://example.com/image1.jpg' ||
      !imageUrl.startsWith('http')) {
    // Generate placeholder
    const randomColors = ['#DC2626', '#1D4ED8', '#059669', '#7C3AED', '#EA580C', '#0891B2']
    const color = randomColors[Math.floor(Math.random() * randomColors.length)]
    const text = productTitle?.slice(0, 10) || 'Product'
    console.log('🖼️ Invalid image URL detected:', imageUrl, '- Using placeholder for:', productTitle)
    return `/api/placeholder-image?text=${encodeURIComponent(text)}&width=400&height=300&bg=${encodeURIComponent(color)}`
  }
  console.log('✅ Valid image URL:', imageUrl)
  return imageUrl
}

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
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([])
  const [gameTitlesLoading, setGameTitlesLoading] = useState(true)

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    gameTitle: searchParams.get('gameTitle') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 50000000, // 50M IDR max
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12
  })

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Update URL when filters change
  const updateURL = useCallback((newFilters: ProductFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.gameTitle) params.set('gameTitle', newFilters.gameTitle)
    if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString())
    if (newFilters.maxPrice < 50000000) params.set('maxPrice', newFilters.maxPrice.toString())
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
        game_title_id: filters.gameTitle || undefined,
        min_price: filters.minPrice > 0 ? filters.minPrice : undefined,
        max_price: filters.maxPrice < 50000000 ? filters.maxPrice : undefined,
        sort_by: filters.sortBy,
        page: filters.page,
        limit: filters.limit
      }

      console.log('🔍 Loading products with filters:', queryParams)
      const response = await apiClient.getProducts(queryParams)
      console.log('📦 Products API response:', response)
      console.log('🔄 Backend URL called:', `${process.env.NEXT_PUBLIC_API_URL || 'https://pasargamex-api-244929333106.asia-southeast2.run.app'}/v1/products?${new URLSearchParams(queryParams).toString()}`)
      
      if (response.success && response.data) {
        const data = response.data as any
        let productsList: Product[] = []
        
        if (Array.isArray(data)) {
          productsList = data
          setTotalProducts(data.length)
          setTotalPages(Math.ceil(data.length / filters.limit))
        } else if (data.items) {
          // Backend returns data.items structure
          productsList = data.items
          setTotalProducts(data.total || data.items.length)
          setTotalPages(data.totalPages || Math.ceil((data.total || data.items.length) / filters.limit))
        } else if (data.products) {
          productsList = data.products
          setTotalProducts(data.total || data.products.length)
          setTotalPages(Math.ceil((data.total || data.products.length) / filters.limit))
        }

        // Enhance products with seller information if available
        console.log('🔍 Processing products for seller info:', productsList.length)
        
        // Create a map to cache seller information to avoid duplicate API calls
        const sellerCache = new Map()
        
        const enhancedProducts = await Promise.all(
          productsList.map(async (product) => {
            console.log('👤 Product seller info:', {
              id: product.id,
              seller_id: product.seller_id,
              seller_username: product.seller_username,
              allKeys: Object.keys(product)
            })
            
            // If we already have seller_username, use it
            if (product.seller_username) {
              return {
                ...product,
                seller_username: product.seller_username
              }
            }
            
            // If we have seller_id, try to fetch seller info
            if (product.seller_id) {
              try {
                // Check cache first
                if (sellerCache.has(product.seller_id)) {
                  const cachedSeller = sellerCache.get(product.seller_id)
                  return {
                    ...product,
                    seller_username: cachedSeller
                  }
                }
                
                // Fetch seller info from API
                console.log('🔍 Fetching seller info for:', product.seller_id)
                const sellerResponse = await apiClient.getPublicSellerProfile(product.seller_id)
                
                if (sellerResponse.success && sellerResponse.data) {
                  const responseData = sellerResponse.data as any
                  console.log('🔍 Raw seller API response:', responseData)
                  
                  // The seller info is nested in the response.seller object
                  const sellerData = responseData.seller || responseData
                  console.log('👤 Seller object:', sellerData)
                  
                  const username = sellerData.username || 
                                 sellerData.display_name || 
                                 sellerData.name ||
                                 sellerData.email?.split('@')[0] ||
                                 sellerData.displayName ||
                                 sellerData.uid ||
                                 `Seller ${product.seller_id.slice(-4)}`
                  
                  // Cache the result
                  sellerCache.set(product.seller_id, username)
                  console.log('✅ Found seller:', username)
                  
                  return {
                    ...product,
                    seller_username: username
                  }
                } else {
                  console.log('❌ Seller not found, using fallback')
                  const fallback = `Seller ${product.seller_id.slice(-4)}`
                  sellerCache.set(product.seller_id, fallback)
                  return {
                    ...product,
                    seller_username: fallback
                  }
                }
              } catch (error) {
                console.log('❌ Error fetching seller:', error)
                const fallback = `Seller ${product.seller_id.slice(-4)}`
                sellerCache.set(product.seller_id, fallback)
                return {
                  ...product,
                  seller_username: fallback
                }
              }
            }
            
            // No seller_id available
            return {
              ...product,
              seller_username: 'Unknown Seller'
            }
          })
        )
        
        // Debug: Log products with their game title IDs and prices
        console.log('🎮 Products loaded:', enhancedProducts.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          game_title_id: p.game_title_id,
          seller_username: p.seller_username
        })))
        
        // Debug: Log price sorting verification
        const prices = enhancedProducts.map(p => p.price).filter(p => p != null)
        console.log('💰 Product prices BEFORE frontend sort:', prices)
        console.log('🔀 Current sort_by:', filters.sortBy)
        
        // Frontend fallback sorting (karena backend sort tidak berfungsi)
        let sortedProducts = [...enhancedProducts]
        switch (filters.sortBy) {
          case 'price_low':
            sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0))
            console.log('🔄 Frontend sort: price low to high applied')
            break
          case 'price_high':
            sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0))
            console.log('🔄 Frontend sort: price high to low applied')
            break
          case 'rating':
            sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
            console.log('🔄 Frontend sort: rating applied')
            break
          case 'popular':
            sortedProducts.sort((a, b) => (b.reviews_count || b.sold_count || 0) - (a.reviews_count || a.sold_count || 0))
            console.log('🔄 Frontend sort: popular applied')
            break
          default: // newest
            sortedProducts.sort((a, b) => new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime())
            console.log('🔄 Frontend sort: newest applied')
        }
        
        const sortedPrices = sortedProducts.map(p => p.price).filter(p => p != null)
        console.log('💰 Product prices AFTER frontend sort:', sortedPrices)
        
        setProducts(sortedProducts)
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

  // Load game titles for filter
  const loadGameTitles = useCallback(async () => {
    setGameTitlesLoading(true)
    try {
      const response = await apiClient.getGameTitles()
      if (response.success && response.data) {
        const data = response.data as any
        // Handle different response structures
        if (Array.isArray(data)) {
          setGameTitles(data)
        } else if (data.items && Array.isArray(data.items)) {
          setGameTitles(data.items)
        } else if (data.game_titles && Array.isArray(data.game_titles)) {
          setGameTitles(data.game_titles)
        } else {
          console.warn('Unexpected game titles response structure:', data)
          setGameTitles([])
        }
      } else {
        setGameTitles([])
      }
    } catch (error) {
      console.error('Error loading game titles:', error)
      setGameTitles([])
    } finally {
      setGameTitlesLoading(false)
    }
  }, [])

  // Generate mock products for development
  const generateMockProducts = (currentFilters: ProductFilters) => {
    const priceRanges = [
      { min: 150000, max: 500000 },    // Low tier: 150k-500k IDR
      { min: 500000, max: 1500000 },   // Mid tier: 500k-1.5M IDR
      { min: 1500000, max: 5000000 },  // High tier: 1.5M-5M IDR
      { min: 5000000, max: 15000000 }  // Premium: 5M-15M IDR
    ]

    const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
      const priceRange = priceRanges[Math.floor(Math.random() * priceRanges.length)]
      const price = Math.floor(Math.random() * (priceRange.max - priceRange.min)) + priceRange.min

      return {
        id: `product-${i + 1}`,
        title: `${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]} - Premium Item ${i + 1}`,
        description: `High-quality gaming product with excellent features and guaranteed satisfaction. Perfect for serious gamers.`,
        price,
        category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
        image_url: `/api/placeholder-image?text=Product&width=400&height=300&bg=%23${Math.floor(Math.random()*16777215).toString(16)}`,
        seller_id: `seller-${Math.floor(Math.random() * 10) + 1}`,
        seller_username: `gamer${Math.floor(Math.random() * 1000)}`,
        rating: Number((Math.random() * 2 + 3).toFixed(1)),
        reviews_count: Math.floor(Math.random() * 500) + 10,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        tags: ['gaming', 'premium', 'verified'],
        is_featured: Math.random() > 0.8
      }
    })

    // Apply filters to mock data
    let filteredProducts = mockProducts

    if (currentFilters.search) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(currentFilters.search.toLowerCase())
      )
    }

    // Game title filtering is handled by backend, not needed in mock data

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
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
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

  // Load game titles on mount
  useEffect(() => {
    loadGameTitles()
  }, [loadGameTitles])

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
                      gameTitle: '',
                      minPrice: 0,
                      maxPrice: 50000000,
                      sortBy: 'newest'
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Game Title Filter */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Game</label>
                  <select
                    value={filters.gameTitle}
                    onChange={(e) => updateFilters({ gameTitle: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none"
                    disabled={gameTitlesLoading}
                  >
                    <option value="">
                      {gameTitlesLoading ? 'Loading games...' : 'All Games'}
                    </option>
                    {Array.isArray(gameTitles) && gameTitles.map(gameTitle => (
                      <option key={gameTitle.id} value={gameTitle.id}>{gameTitle.name}</option>
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
                      value={filters.maxPrice === 50000000 ? '' : filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: Number(e.target.value) || 50000000 })}
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
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description}
                        price={product.price}
                        category={product.type?.toUpperCase() || product.category || 'PRODUCT'}
                        image={getValidImageUrl(product.images?.[0]?.url || product.image_url, product.title)}
                        rating={product.rating || 0}
                        reviews={product.reviews_count || 0}
                        seller={product.seller_username || 'Unknown Seller'}
                        isNew={product.featured || product.is_featured}
                        onClick={() => router.push(`/products/${product.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">No products found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search criteria or filters</p>
                    <Button onClick={() => updateFilters({ 
                      search: '', 
                      gameTitle: '',
                      minPrice: 0,
                      maxPrice: 50000000,
                      sortBy: 'newest'
                    })}>
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