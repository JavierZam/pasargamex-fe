'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Product {
  id: string
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  game_title_id: string
  game_title_name?: string
  seller_username: string
  status: string
  category: string
  created_at: string
  updated_at: string
}

interface GameTitle {
  id: string
  name: string
  slug: string
  description: string
  icon_url?: string
}

const PRODUCT_CATEGORIES = [
  'All',
  'Accounts', 
  'Items',
  'Currency',
  'Boosting',
  'Services'
]

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $150', min: 50, max: 150 },
  { label: '$150 - $500', min: 150, max: 500 },
  { label: 'Over $500', min: 500, max: Infinity }
]

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0])
  const [selectedGame, setSelectedGame] = useState<string>('all')

  useEffect(() => {
    loadFeaturedProducts()
    loadGameTitles()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const response = await apiClient.getProducts({ 
        limit: 12, 
        status: 'active'
      })
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as any).items || []
        setProducts(items)
      } else {
        // Mock data fallback
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const loadGameTitles = async () => {
    try {
      const response = await apiClient.getGameTitles({ limit: 10, status: 'active' })
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as any).items || []
        setGameTitles(items)
      }
    } catch (error) {
      console.error('Error loading game titles:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory
    const priceMatch = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
    const gameMatch = selectedGame === 'all' || product.game_title_id === selectedGame
    
    return categoryMatch && priceMatch && gameMatch
  })

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0]
    }
    const randomColors = ['#DC2626', '#1D4ED8', '#059669', '#7C3AED', '#EA580C', '#0891B2']
    const color = randomColors[Math.floor(Math.random() * randomColors.length)]
    return `/api/placeholder-image?text=${encodeURIComponent(product.game_title_name || product.title.slice(0, 10) || 'Product')}&width=300&height=200&bg=${encodeURIComponent(color)}`
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">FEATURED </span>
            <span className="text-brand-blue">PRODUCTS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Discover the best gaming accounts, items, and services from verified sellers. 
            All transactions protected by our secure escrow system.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-brand-red text-white gaming-glow'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <select
            value={PRICE_RANGES.indexOf(selectedPriceRange)}
            onChange={(e) => setSelectedPriceRange(PRICE_RANGES[parseInt(e.target.value)])}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-brand-blue focus:outline-none"
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={index} value={index}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Game Filter */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-brand-blue focus:outline-none"
          >
            <option value="all">All Games</option>
            {gameTitles.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-lg mb-4" />
                <div className="bg-gray-700 h-4 rounded mb-2" />
                <div className="bg-gray-700 h-4 rounded w-2/3 mb-4" />
                <div className="bg-gray-700 h-6 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No products found matching your filters</div>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedPriceRange(PRICE_RANGES[0])
                setSelectedGame('all')
              }}
              className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map(product => (
              <div
                key={product.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-brand-red/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/10 group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-xl">
                  <Image
                    src={getProductImage(product)}
                    alt={product.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs bg-brand-red text-white rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-400 font-medium">Available</span>
                  </div>

                  <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description || 'Premium gaming product from verified seller'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-brand-red font-bold text-xl">
                      ${product.price}
                    </div>
                    <div className="text-gray-500 text-sm">
                      by @{product.seller_username}
                    </div>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full bg-gradient-to-r from-brand-red to-brand-blue text-white text-center py-3 rounded-lg font-medium hover:shadow-lg transition-all gaming-glow"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all rounded-lg font-semibold"
          >
            View All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Genshin Impact - AR 60 Account',
    description: 'Premium account with multiple 5-star characters including Zhongli, Venti, and Raiden Shogun',
    price: 299,
    currency: 'USD',
    images: [],
    game_title_id: 'genshin',
    game_title_name: 'Genshin Impact',
    seller_username: 'GamerPro99',
    status: 'active',
    category: 'Accounts',
    created_at: '2024-01-15',
    updated_at: '2024-01-20'
  },
  {
    id: '2',
    title: 'Valorant - Immortal Rank Account',
    description: 'High-rank account with exclusive skins and Prime Vandal collection',
    price: 150,
    currency: 'USD',
    images: [],
    game_title_id: 'valorant',
    game_title_name: 'Valorant',
    seller_username: 'ValorantKing',
    status: 'active',
    category: 'Accounts',
    created_at: '2024-01-18',
    updated_at: '2024-01-22'
  },
  {
    id: '3',
    title: 'Mobile Legends - Epic to Legend Boost',
    description: 'Professional rank boosting service with 95% win rate guarantee',
    price: 25,
    currency: 'USD',
    images: [],
    game_title_id: 'mobile-legends',
    game_title_name: 'Mobile Legends',
    seller_username: 'MLBooster',
    status: 'active',
    category: 'Boosting',
    created_at: '2024-01-20',
    updated_at: '2024-01-21'
  },
  {
    id: '4',
    title: 'Free Fire - 10,000 Diamonds',
    description: 'Instant delivery of Free Fire diamonds to your account',
    price: 89,
    currency: 'USD',
    images: [],
    game_title_id: 'free-fire',
    game_title_name: 'Free Fire',
    seller_username: 'FFDealer',
    status: 'active',
    category: 'Currency',
    created_at: '2024-01-19',
    updated_at: '2024-01-23'
  }
]