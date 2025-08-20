'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Button, Card, CardContent, Badge, LoadingSpinner, PriceDisplay } from '@/components/ui'
import WishlistButton from '@/components/ui/WishlistButton'

interface Product {
  id: string
  title: string
  description: string
  price: number
  type: string
  game_title_id?: string
  seller_id: string
  seller_username?: string
  images: { url: string }[]
  attributes: Record<string, any>
  rating?: number
  reviews_count?: number
  stock: number
  delivery_method: string
  created_at: string
}

interface GameTitle {
  id: string
  name: string
  slug: string
}

const getValidImageUrl = (imageUrl?: string, productTitle?: string) => {
  if (!imageUrl || 
      imageUrl.includes('example.com') || 
      imageUrl.includes('.claude\\image.png') ||
      imageUrl === 'https://example.com/image1.jpg' ||
      !imageUrl.startsWith('http')) {
    const randomColors = ['#DC2626', '#1D4ED8', '#059669', '#7C3AED', '#EA580C', '#0891B2']
    const color = randomColors[Math.floor(Math.random() * randomColors.length)]
    const text = productTitle?.slice(0, 10) || 'Product'
    return `/api/placeholder-image?text=${encodeURIComponent(text)}&width=400&height=300&bg=${encodeURIComponent(color)}`
  }
  return imageUrl
}

function ComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get product IDs from URL params
  const productIds = searchParams.get('products')?.split(',') || []

  useEffect(() => {
    if (productIds.length === 0) {
      router.push('/products')
      return
    }
    
    loadProducts()
    loadGameTitles()
  }, [productIds.join(',')])

  const loadProducts = async () => {
    if (productIds.length === 0) return

    setLoading(true)
    setError(null)
    try {
      const loadedProducts: Product[] = []
      
      for (const productId of productIds) {
        try {
          const response = await apiClient.getProduct(productId)
          if (response.success && response.data) {
            let product = response.data as Product
            
            // Fetch seller info if not included
            if (product.seller_id && !product.seller_username) {
              try {
                const sellerResponse = await apiClient.getPublicSellerProfile(product.seller_id)
                if (sellerResponse.success && sellerResponse.data) {
                  const sellerData = (sellerResponse.data as any).seller || sellerResponse.data
                  product.seller_username = sellerData.username || sellerData.display_name || `Seller ${product.seller_id.slice(-4)}`
                }
              } catch (error) {
                product.seller_username = `Seller ${product.seller_id.slice(-4)}`
              }
            }
            
            loadedProducts.push(product)
          }
        } catch (error) {
          console.error(`Error loading product ${productId}:`, error)
        }
      }

      if (loadedProducts.length === 0) {
        setError('No products found to compare')
      } else {
        setProducts(loadedProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setError('Failed to load products for comparison')
    } finally {
      setLoading(false)
    }
  }

  const loadGameTitles = async () => {
    try {
      const response = await apiClient.getGameTitles()
      if (response.success && response.data) {
        const data = response.data as any
        const titles = Array.isArray(data) ? data : (data.items || data.game_titles || [])
        setGameTitles(titles)
      }
    } catch (error) {
      console.error('Error loading game titles:', error)
    }
  }

  const getGameTitle = (gameId?: string) => {
    if (!gameId) return 'Unknown Game'
    const gameTitle = gameTitles.find(g => g.id === gameId)
    return gameTitle?.name || 'Unknown Game'
  }

  const removeProduct = (productId: string) => {
    const newProductIds = productIds.filter(id => id !== productId)
    if (newProductIds.length === 0) {
      router.push('/products')
    } else {
      router.push(`/compare?products=${newProductIds.join(',')}`)
    }
  }

  const getAttributeValue = (product: Product, key: string) => {
    if (!product.attributes || typeof product.attributes !== 'object') return 'N/A'
    const value = product.attributes[key]
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  // Get all unique attribute keys from all products
  const allAttributeKeys = Array.from(
    new Set(
      products.flatMap(product => 
        product.attributes && typeof product.attributes === 'object' 
          ? Object.keys(product.attributes)
          : []
      )
    )
  ).filter(key => key && key.length > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    )
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h1 className="text-2xl font-bold text-white mb-2">No Products to Compare</h1>
          <p className="text-gray-400 mb-6">{error || 'Please select products to compare'}</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">PRODUCT</span>
            <span className="text-brand-blue">COMPARE</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Compare features, prices, and details side by side to make the best choice.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/products">
              <Button variant="outline">Browse More Products</Button>
            </Link>
            <span className="text-gray-400">Comparing {products.length} products</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Product Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div></div>
              {products.map((product) => (
                <Card key={product.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-0 right-0 text-gray-400 hover:text-red-500 text-xl"
                        title="Remove from comparison"
                      >
                        ×
                      </button>
                      <img
                        src={getValidImageUrl(product.images?.[0]?.url, product.title)}
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <Badge className="mb-2">{product.type.toUpperCase()}</Badge>
                      <div className="flex items-center justify-between">
                        <PriceDisplay basePrice={product.price} size="sm" />
                        <WishlistButton productId={product.id} variant="icon" size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Game</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <span className="text-gray-300">{getGameTitle(product.game_title_id)}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Seller</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <Link 
                      href={`/seller/${product.seller_id}`}
                      className="text-brand-blue hover:text-brand-red transition-colors"
                    >
                      @{product.seller_username || 'Unknown'}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Rating</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        ({product.reviews_count || 0})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Stock</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Delivery</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <Badge variant="secondary">{product.delivery_method}</Badge>
                  </div>
                ))}
              </div>

              {/* Product Attributes */}
              {allAttributeKeys.length > 0 && (
                <>
                  <div className="my-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
                  </div>
                  {allAttributeKeys.map((attributeKey) => (
                    <div key={attributeKey} className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                      <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                        <span className="text-white font-semibold capitalize">
                          {attributeKey.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {products.map((product) => (
                        <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                          <span className="text-gray-300">
                            {getAttributeValue(product, attributeKey)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* Action Buttons */}
              <div className="grid gap-4 mt-8" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center">
                  <span className="text-white font-semibold">Actions</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                    <div className="flex flex-col gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add More Products */}
        <div className="mt-12 text-center">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Compare More Products</h3>
            <p className="text-gray-400 mb-6">
              Add more products to your comparison to find the perfect match.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}