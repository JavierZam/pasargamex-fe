'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UseWishlistReturn {
  isInWishlist: boolean
  loading: boolean
  toggleWishlist: () => Promise<void>
}

export function useWishlist(productId: string): UseWishlistReturn {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const checkWishlistStatus = useCallback(async () => {
    if (!isAuthenticated || !productId) return

    try {
      const response = await apiClient.checkWishlistStatus(productId)
      if (response.success && response.data) {
        setIsInWishlist(response.data.is_in_wishlist)
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }, [productId, isAuthenticated])

  const toggleWishlist = useCallback(async () => {
    if (!isAuthenticated || !productId || loading) return

    setLoading(true)
    try {
      if (isInWishlist) {
        await apiClient.removeFromWishlist(productId)
        setIsInWishlist(false)
      } else {
        await apiClient.addToWishlist(productId)
        setIsInWishlist(true)
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error)
      // Show error message to user if needed
      if (error.response?.data?.error?.message) {
        alert(error.response.data.error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [productId, isAuthenticated, isInWishlist, loading])

  useEffect(() => {
    checkWishlistStatus()
  }, [checkWishlistStatus])

  return {
    isInWishlist,
    loading,
    toggleWishlist
  }
}