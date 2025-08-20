'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { StarRating, ReviewCard, ProductCard, Badge, LoadingSpinner } from '@/components/ui'
import { Review, Product } from '@/types'

interface SellerProfile {
  id: string
  username: string
  display_name?: string
  email: string
  avatar_url?: string
  created_at: string
  is_verified: boolean
  rating?: number
  total_reviews?: number
  total_sales?: number
  response_rate?: number
  response_time?: number
}

export default function SellerProfilePage() {
  const { id } = useParams()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadSellerData()
    }
  }, [id])

  const loadSellerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load seller profile
      const sellerResponse = await apiClient.getPublicSellerProfile(id as string)
      if (sellerResponse.success && sellerResponse.data) {
        const responseData = sellerResponse.data as any
        const sellerData = responseData.seller || responseData
        setSeller({
          id: sellerData.id || id as string,
          username: sellerData.username || sellerData.display_name || `Seller ${(id as string).slice(-4)}`,
          display_name: sellerData.display_name,
          email: sellerData.email || '',
          avatar_url: sellerData.avatar_url,
          created_at: sellerData.created_at || new Date().toISOString(),
          is_verified: sellerData.is_verified || false,
          rating: sellerData.rating || 4.5,
          total_reviews: sellerData.total_reviews || 0,
          total_sales: sellerData.total_sales || 0,
          response_rate: sellerData.response_rate || 95,
          response_time: sellerData.response_time || 2
        })
      }

      // Load seller's products
      const productsResponse = await apiClient.getProducts({ 
        seller_id: id as string,
        status: 'active',
        limit: 12 
      })
      if (productsResponse.success && productsResponse.data) {
        const items = Array.isArray(productsResponse.data) ? productsResponse.data : (productsResponse.data as any).items || []
        setProducts(items)
      }

      // Load seller reviews (when API is available)
      try {
        const reviewsResponse = await apiClient.getSellerReviews(id as string, { limit: 10 })
        if (reviewsResponse.success && reviewsResponse.data) {
          const reviewItems = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : (reviewsResponse.data as any).items || []
          setReviews(reviewItems)
        }
      } catch (reviewError) {
        console.log('Reviews not available yet:', reviewError)
        // Mock reviews for demo
        setReviews(mockReviews)
      }

    } catch (error) {
      console.error('Error loading seller data:', error)
      setError('Failed to load seller profile')
    } finally {
      setLoading(false)
    }
  }

  const handleReportReview = async (reviewId: string, reason: string, description: string) => {
    try {
      await apiClient.reportReview(reviewId, { reason, description })
      console.log('Review reported successfully')
    } catch (error) {
      console.error('Error reporting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Seller Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'The seller profile you are looking for does not exist.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Seller Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-brand-red to-brand-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {seller.avatar_url ? (
                <Image
                  src={seller.avatar_url}
                  alt={seller.username}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                seller.username?.charAt(0)?.toUpperCase() || 'S'
              )}
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">@{seller.username}</h1>
                {seller.is_verified && (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    ✓ Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={seller.rating || 0} size="md" showValue />
                  <span className="text-gray-400">({seller.total_reviews} reviews)</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-red">{seller.total_sales || 0}</div>
                  <div className="text-gray-400 text-sm">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-blue">{seller.response_rate || 0}%</div>
                  <div className="text-gray-400 text-sm">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{seller.response_time || 0}h</div>
                  <div className="text-gray-400 text-sm">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{new Date(seller.created_at).getFullYear()}</div>
                  <div className="text-gray-400 text-sm">Member Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'products'
                ? 'bg-brand-red text-white gaming-glow'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-red text-white gaming-glow'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Products by @{seller.username}</h2>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No products available</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                    image={product.images?.[0] || '/api/placeholder-image?text=Product&width=300&height=200'}
                    rating={4.5} // TODO: Get from product rating
                    reviews={12} // TODO: Get from product reviews
                    seller={seller.username}
                    onClick={() => window.open(`/products/${product.id}`, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Reviews for @{seller.username}</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No reviews yet</div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReport={handleReportReview}
                    showProduct={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Mock reviews for demo purposes
const mockReviews: Review[] = [
  {
    id: '1',
    content: 'Excellent seller! Fast delivery and exactly as described. Highly recommended for gaming accounts.',
    rating: 5,
    type: 'seller_review',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    status: 'active',
    reviewer: {
      id: 'user1',
      username: 'GamerBoy99',
      avatar_url: ''
    },
    product: {
      id: 'prod1',
      title: 'Genshin Impact AR 60 Account',
      image: '/api/placeholder-image?text=Genshin&width=64&height=64'
    },
    images: []
  },
  {
    id: '2',
    content: 'Good communication and trustworthy. Account was exactly as described with all promised characters.',
    rating: 4,
    type: 'seller_review',
    createdAt: '2024-01-18T15:45:00Z',
    updatedAt: '2024-01-18T15:45:00Z',
    status: 'active',
    reviewer: {
      id: 'user2',
      username: 'AnimeGamer',
      avatar_url: ''
    },
    product: {
      id: 'prod2',
      title: 'Valorant Immortal Account',
      image: '/api/placeholder-image?text=Valorant&width=64&height=64'
    },
    images: []
  }
]