'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { WishlistItem } from '@/types'
import { LoadingSpinner, PriceDisplay } from '@/components/ui'
import WishlistButton from '@/components/ui/WishlistButton'

export default function WishlistPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      loadWishlist()
    }
  }, [authLoading, isAuthenticated, currentPage])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserWishlist({
        page: currentPage,
        limit: 12
      })

      if (response.success && response.data) {
        const data = response.data as any
        const items = Array.isArray(data) ? data : data.items || []
        setWishlistItems(items)
        
        if (data.total !== undefined) {
          setTotalItems(data.total)
          setTotalPages(data.totalPages || Math.ceil(data.total / 12))
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await apiClient.removeFromWishlist(productId)
      // Reload wishlist to reflect changes
      loadWishlist()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const getValidImageUrl = (imageUrl?: string, fallbackText?: string) => {
    if (!imageUrl || 
        imageUrl.includes('example.com') || 
        imageUrl.includes('.claude/') ||
        imageUrl.startsWith('./') ||
        imageUrl.startsWith('../')) {
      return `/api/placeholder-image?text=${encodeURIComponent(fallbackText || 'Product')}&width=300&height=200`
    }
    return imageUrl
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Wishlist</h1>
            <p className="text-gray-400">
              {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} saved` : 'No items saved yet'}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {!loading && wishlistItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Discover amazing gaming products and save your favorites!</p>
            <button
              onClick={() => router.push('/products')}
              className="px-8 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white font-medium rounded-lg hover:shadow-lg transition-all gaming-glow"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-brand-red/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/10 group overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={getValidImageUrl(item.product.images?.[0]?.url, item.product.title)}
                      alt={item.product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3">
                      <WishlistButton
                        productId={item.product.id}
                        variant="icon"
                        size="sm"
                      />
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs bg-brand-red text-white rounded-full font-medium">
                        {item.product.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                      {item.product.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <PriceDisplay 
                        basePrice={item.product.price} 
                        size="lg" 
                        className="text-brand-red" 
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/products/${item.product.id}`)}
                        className="flex-1 bg-gradient-to-r from-brand-red to-brand-blue text-white text-center py-2 rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 mt-3">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (page > totalPages) return null
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          page === currentPage
                            ? 'bg-brand-red text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}