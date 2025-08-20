'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Button, Card, CardContent, Badge, LoadingSpinner, PriceDisplay, ProductCard } from '@/components/ui'
import LiveSearch from '@/components/ui/LiveSearch'

interface SearchResults {
  products: any[]
  sellers: any[]
  gameTitle: any
  totalResults: number
  searchTime: number
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const gameId = searchParams.get('game') || ''
  
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'sellers' | 'games'>('all')

  useEffect(() => {
    if (query || gameId) {
      performSearch()
    }
  }, [query, gameId])

  const performSearch = async () => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      let searchResults: SearchResults = {
        products: [],
        sellers: [],
        gameTitle: null,
        totalResults: 0,
        searchTime: 0
      }

      // Search products
      if (query) {
        try {
          const productsResponse = await apiClient.searchProducts({
            q: query,
            game_title_id: gameId || undefined,
            status: 'active',
            limit: 20
          })
          
          if (productsResponse.success && productsResponse.data) {
            const data = productsResponse.data as any
            searchResults.products = Array.isArray(data) ? data : (data.items || [])
          }
        } catch (error) {
          console.error('Product search error:', error)
          // Generate mock results for demo
          searchResults.products = generateMockProducts(query)
        }
      } else if (gameId) {
        try {
          const productsResponse = await apiClient.getProducts({
            game_title_id: gameId,
            status: 'active',
            limit: 20
          })
          
          if (productsResponse.success && productsResponse.data) {
            const data = productsResponse.data as any
            searchResults.products = Array.isArray(data) ? data : (data.items || [])
          }
        } catch (error) {
          console.error('Products by game error:', error)
          searchResults.products = generateMockProducts('Game products')
        }
      }

      // Get game title info if searching by game
      if (gameId) {
        try {
          const gamesResponse = await apiClient.getGameTitles()
          if (gamesResponse.success && gamesResponse.data) {
            const games = Array.isArray(gamesResponse.data) 
              ? gamesResponse.data 
              : gamesResponse.data.items || []
            searchResults.gameTitle = games.find((game: any) => game.id === gameId)
          }
        } catch (error) {
          console.error('Game title error:', error)
        }
      }

      // Mock seller results
      if (query && query.length >= 3) {
        searchResults.sellers = [
          {
            id: 'seller1',
            username: `${query}master`,
            displayName: `${query.charAt(0).toUpperCase() + query.slice(1)} Master`,
            avatar: `/api/placeholder-image?text=${query.charAt(0).toUpperCase()}&width=100&height=100`,
            rating: 4.8,
            totalSales: Math.floor(Math.random() * 500) + 50,
            isVerified: Math.random() > 0.5,
            specialization: ['Gaming Accounts', 'Boosting Services']
          }
        ]
      }

      searchResults.totalResults = searchResults.products.length + searchResults.sellers.length
      searchResults.searchTime = Date.now() - startTime

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults({
        products: [],
        sellers: [],
        gameTitle: null,
        totalResults: 0,
        searchTime: Date.now() - startTime
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMockProducts = (searchQuery: string) => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `mock-${i}`,
      title: `${searchQuery} Account ${i + 1}`,
      description: `High quality ${searchQuery} account with premium features`,
      price: Math.floor(Math.random() * 2000000) + 500000,
      type: ['account', 'topup', 'boosting', 'item'][Math.floor(Math.random() * 4)],
      images: [{ url: `/api/placeholder-image?text=${searchQuery}&width=400&height=300` }],
      seller_username: `seller${i + 1}`,
      seller_id: `seller-${i}`,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      reviews_count: Math.floor(Math.random() * 100) + 10,
      stock: Math.floor(Math.random() * 10) + 1,
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      featured: Math.random() > 0.8
    }))
  }

  const getTabCount = (tab: string) => {
    if (!results) return 0
    switch (tab) {
      case 'products': return results.products.length
      case 'sellers': return results.sellers.length
      case 'all': return results.totalResults
      default: return 0
    }
  }

  const filteredResults = () => {
    if (!results) return { products: [], sellers: [] }
    
    switch (activeTab) {
      case 'products': return { products: results.products, sellers: [] }
      case 'sellers': return { products: [], sellers: results.sellers }
      case 'all': 
      default: return { products: results.products, sellers: results.sellers }
    }
  }

  if (!query && !gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-4">Search PasargameX</h1>
          <p className="text-gray-400 mb-8">Find games, accounts, sellers, and more</p>
          <div className="max-w-lg">
            <LiveSearch placeholder="What are you looking for?" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <LiveSearch 
              placeholder="Search games, accounts, sellers..." 
              className="w-full"
            />
          </div>
          
          {/* Search Info */}
          {results && (
            <div className="text-center">
              {results.gameTitle ? (
                <h1 className="text-2xl font-bold text-white mb-2">
                  🎮 {results.gameTitle.name}
                </h1>
              ) : query ? (
                <h1 className="text-2xl font-bold text-white mb-2">
                  Search results for "{query}"
                </h1>
              ) : null}
              
              <p className="text-gray-400">
                {results.totalResults} results found in {results.searchTime}ms
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="text-brand-red mb-4" />
              <p className="text-gray-400">Searching...</p>
            </div>
          </div>
        ) : results ? (
          <>
            {/* Result Tabs */}
            <div className="mb-8 flex justify-center">
              <div className="bg-gray-800/50 rounded-2xl p-1 border border-gray-700/50 inline-flex">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'all' 
                      ? 'bg-brand-red text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  All ({getTabCount('all')})
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'products' 
                      ? 'bg-brand-red text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Products ({getTabCount('products')})
                </button>
                {results.sellers.length > 0 && (
                  <button
                    onClick={() => setActiveTab('sellers')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === 'sellers' 
                        ? 'bg-brand-red text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Sellers ({getTabCount('sellers')})
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-8">
              {/* Products */}
              {filteredResults().products.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      🛒 Products
                      <Badge>{filteredResults().products.length}</Badge>
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredResults().products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description}
                        price={product.price}
                        category={product.type?.toUpperCase() || 'PRODUCT'}
                        image={product.images?.[0]?.url || product.image_url}
                        rating={product.rating || 0}
                        reviews={product.reviews_count || 0}
                        seller={product.seller_username || 'Unknown'}
                        seller_id={product.seller_id}
                        isNew={product.featured}
                        onClick={() => router.push(`/products/${product.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sellers */}
              {filteredResults().sellers.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      👥 Sellers
                      <Badge>{filteredResults().sellers.length}</Badge>
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults().sellers.map((seller) => (
                      <Card key={seller.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <img
                                src={seller.avatar}
                                alt={seller.displayName}
                                className="w-16 h-16 rounded-full border-2 border-gray-600"
                              />
                              {seller.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold">{seller.displayName}</h3>
                                {seller.isVerified && (
                                  <Badge variant="info" className="text-xs">Verified</Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">@{seller.username}</p>
                              <div className="flex items-center gap-1 mt-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-sm ${i < seller.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-gray-400 text-sm ml-1">
                                  ({seller.rating}) • {seller.totalSales} sales
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-3">
                                {seller.specialization.map((spec: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <Link href={`/seller/${seller.id}`}>
                              <Button className="w-full" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.totalResults === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">😔</div>
                  <h3 className="text-2xl font-semibold text-white mb-4">No results found</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    We couldn't find anything matching "{query || 'your search'}". 
                    Try different keywords or browse our categories.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/products">
                      <Button>Browse All Products</Button>
                    </Link>
                    <Link href="/categories">
                      <Button variant="outline">View Categories</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}