'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'icon'
  className?: string
  showTooltip?: boolean
}

export default function WishlistButton({ 
  productId, 
  size = 'md', 
  variant = 'button',
  className = '',
  showTooltip = true
}: WishlistButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isInWishlist, loading, toggleWishlist } = useWishlist(productId)
  const { showSuccess, showError } = useNotifications()
  const [showTooltipText, setShowTooltipText] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    try {
      const wasInWishlist = isInWishlist
      await toggleWishlist()
      
      if (wasInWishlist) {
        showSuccess('Removed from wishlist', 'Product has been removed from your wishlist', {
          label: 'View Wishlist',
          onClick: () => router.push('/wishlist')
        })
      } else {
        showSuccess('Added to wishlist', 'Product has been added to your wishlist', {
          label: 'View Wishlist', 
          onClick: () => router.push('/wishlist')
        })
      }
    } catch (error) {
      showError('Wishlist Error', 'Failed to update wishlist. Please try again.')
    }
  }

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'px-3 py-1.5 text-sm',
    md: variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2 text-sm',
    lg: variant === 'icon' ? 'w-12 h-12' : 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg 
      className={`${iconSizes[size]} transition-colors`} 
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
      />
    </svg>
  )

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={loading}
          onMouseEnter={() => setShowTooltipText(true)}
          onMouseLeave={() => setShowTooltipText(false)}
          className={`
            ${sizeClasses[size]} 
            rounded-full border-2 flex items-center justify-center
            transition-all duration-200 hover:scale-105
            ${isInWishlist 
              ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        >
          {loading ? (
            <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-transparent`} />
          ) : (
            <HeartIcon filled={isInWishlist} />
          )}
        </button>

        {showTooltip && showTooltipText && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
            {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizeClasses[size]} 
        rounded-lg border-2 flex items-center gap-2 font-medium
        transition-all duration-200
        ${isInWishlist 
          ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
          : 'bg-transparent border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-transparent`} />
      ) : (
        <HeartIcon filled={isInWishlist} />
      )}
      <span>
        {loading ? 'Loading...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </span>
    </button>
  )
}