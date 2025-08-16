'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardContent, Badge, LoadingSpinner, Avatar } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

interface ProductImage {
  id: string
  url: string
  display_order: number
}

interface Product {
  id: string
  game_title_id: string
  seller_id: string
  title: string
  description: string
  price: number
  type: 'account' | 'topup' | 'boosting' | 'item'
  attributes: Record<string, any>
  images: ProductImage[]
  status: 'draft' | 'active'
  stock: number
  sold_count: number
  delivery_method: 'instant' | 'middleman' | 'both'
  views: number
  featured: boolean
  created_at: string
  updated_at: string
  seller?: {
    id: string
    username: string
    rating: number
    verification_status: string
  }
  game_title?: {
    id: string
    name: string
    slug: string
  }
  // Legacy fields for backward compatibility
  category?: string
  image_url?: string
  seller_username?: string
  seller_rating?: number
  seller_verified?: boolean
  rating?: number
  reviews_count?: number
  tags?: string[]
  is_featured?: boolean
  stock_quantity?: number
  game_platform?: string
  game_genre?: string
  specifications?: Record<string, any>
}

interface Review {
  id: string
  user_id: string
  username: string
  rating: number
  comment: string
  created_at: string
  verified_purchase: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  // Get product images from backend or fallback
  const productImages = product?.images?.length 
    ? product.images.sort((a, b) => a.display_order - b.display_order).map(img => img.url)
    : product?.image_url 
      ? [product.image_url]
      : ['/api/placeholder-image?text=Product&width=600&height=400']

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
      loadReviews(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (productId: string) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/products/${productId}`)
      
      if (response.success && response.data) {
        setProduct(response.data as Product)
      } else {
        // Product not found, redirect to products page
        router.push('/products')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      // Fallback to mock data for development
      const mockProduct = generateMockProduct(productId)
      setProduct(mockProduct)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (productId: string) => {
    setReviewsLoading(true)
    try {
      const response = await apiClient.get(`/products/${productId}/reviews`)
      
      if (response.success && response.data) {
        setReviews(response.data as Review[])
      } else {
        // Fallback to mock reviews
        setReviews(generateMockReviews())
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews(generateMockReviews())
    } finally {
      setReviewsLoading(false)
    }
  }

  const generateMockProduct = (productId: string): Product => ({
    id: productId,
    title: 'Premium Gaming Account - Level 150',
    description: `Rare and exclusive gaming account with tons of premium content and achievements. This account includes:
    
    • Level 150 character with max stats
    • Rare legendary items and equipment
    • Premium currency and resources
    • Exclusive skins and cosmetics
    • All DLC content unlocked
    • Verified and secure transfer
    
    Perfect for serious gamers who want to skip the grind and start playing at the highest level immediately. Account comes with full documentation and transfer support.`,
    price: 299.99,
    category: 'Game Accounts',
    image_url: 'https://picsum.photos/600/400?random=0',
    seller_id: 'seller-123',
    seller_username: 'ProGameSeller',
    seller_rating: 4.8,
    seller_verified: true,
    rating: 4.7,
    reviews_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['premium', 'level-150', 'legendary', 'verified'],
    is_featured: true,
    stock_quantity: 1,
    game_platform: 'PC/Console',
    game_genre: 'MMORPG',
    delivery_method: 'Account Transfer',
    specifications: {
      'Account Level': 150,
      'Premium Currency': '50,000 Gems',
      'Rare Items': '25+ Legendary Items',
      'Achievements': '95% Complete',
      'Playtime': '500+ Hours'
    }
  })

  const generateMockReviews = (): Review[] => [
    {
      id: '1',
      user_id: 'user-1',
      username: 'GamerPro123',
      rating: 5,
      comment: 'Amazing account! Everything was exactly as described. Fast and secure transfer. Highly recommended!',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      verified_purchase: true
    },
    {
      id: '2',
      user_id: 'user-2',
      username: 'GameMaster99',
      rating: 4,
      comment: 'Good account with nice items. Transfer took a bit longer than expected but seller was responsive.',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      verified_purchase: true
    },
    {
      id: '3',
      user_id: 'user-3',
      username: 'EpicPlayer',
      rating: 5,
      comment: 'Perfect! Got exactly what I paid for. Will definitely buy from this seller again.',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      verified_purchase: true
    }
  ]

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!product) return

    try {
      // Create transaction using backend API
      const response = await apiClient.post('/transactions', {
        product_id: product.id,
        delivery_method: product.delivery_method || 'middleman'
      })

      if (response.success && response.data) {
        const transaction = response.data
        
        // Redirect to payment if Midtrans redirect URL is provided
        if (transaction.midtrans_redirect_url) {
          window.location.href = transaction.midtrans_redirect_url
        } else {
          // Redirect to transaction detail page
          router.push(`/transactions/${transaction.id}`)
        }
      } else {
        alert('Failed to create transaction: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert('Purchase failed: ' + (error.message || 'Please try again'))
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    try {
      console.log('Adding to cart:', product?.id, 'quantity:', quantity)
      alert('Product added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
    }
  }

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Redirect to messages with seller
    router.push(`/messages?user=${product?.seller_id}`)
  }

  const renderStars = (rating: number, size = 'sm') => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-semibold text-white mb-2">Product not found</h1>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white">Products</Link>
          <span>/</span>
          <span className="text-white">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.title}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-brand-red' : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={150}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="info" className="text-xs">{product.type?.toUpperCase() || product.category}</Badge>
                {(product.featured || product.is_featured) && <Badge variant="danger" className="text-xs">Featured</Badge>}
                {product.game_title && <Badge variant="default" className="text-xs">{product.game_title.name}</Badge>}
                {product.tags?.map(tag => (
                  <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating || 0, 'lg')}
                  <span className="text-white font-medium ml-2">{product.rating || 'N/A'}</span>
                </div>
                <span className="text-gray-400">({product.reviews_count || reviews.length} reviews)</span>
                <span className="text-gray-400">• {product.views} views • {product.sold_count} sold</span>
              </div>
            </div>

            <div className="text-4xl font-bold text-brand-red">${product.price}</div>

            {/* Seller Info */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar fallback={(product.seller?.username || product.seller_username)?.[0] || 'S'} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{product.seller?.username || product.seller_username || 'Unknown Seller'}</span>
                      {(product.seller?.verification_status === 'verified' || product.seller_verified) && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(product.seller?.rating || product.seller_rating || 0)}
                      <span className="text-gray-400 text-sm ml-1">({(product.seller?.rating || product.seller_rating || 0).toFixed(1)})</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleContactSeller} size="sm">
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Purchase */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-white font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-white font-medium min-w-[2rem] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="text-gray-400 text-sm">
                  {product.stock || product.stock_quantity || 0} available
                </span>
              </div>

              <div className="flex gap-4">
                <Button onClick={handlePurchase} className="flex-1" size="lg">
                  Buy Now - ${(product.price * quantity).toFixed(2)}
                </Button>
                <Button variant="outline" onClick={handleAddToCart} size="lg">
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Product Specifications */}
            {(product.attributes || product.specifications) && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3">Product Details</h3>
                  <div className="space-y-2">
                    {/* Backend attributes */}
                    {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                    {/* Legacy specifications */}
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                    {/* Additional details */}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery Method:</span>
                      <span className="text-white font-medium capitalize">{product.delivery_method || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white font-medium capitalize">{product.status || 'Active'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Description */}
        <Card className="bg-gray-800/50 border-gray-700 mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
            <div className="text-gray-300 whitespace-pre-line">{product.description}</div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Reviews ({product.reviews_count})
              </h2>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="bg-gray-700/50 border-gray-600 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-white font-medium mb-4">Write your review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm mb-2">Rating</label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                            className={`w-6 h-6 ${
                              i < newReview.rating ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                          >
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2">Comment</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none"
                        rows={3}
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm">Submit Review</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" className="text-brand-red" />
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar fallback={review.username[0]} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{review.username}</span>
                          {review.verified_purchase && (
                            <Badge variant="success" className="text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-gray-400 text-sm">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}