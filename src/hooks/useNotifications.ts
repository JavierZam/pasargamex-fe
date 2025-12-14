'use client'

import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface NotificationCounts {
  unreadMessages: number
  wishlistItems: number
  loading: boolean
}

export function useNotifications(): NotificationCounts {
  const { user, userToken: token } = useFirebaseAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [wishlistItems, setWishlistItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [wishlistApiAvailable, setWishlistApiAvailable] = useState(true)

  useEffect(() => {
    const fetchNotificationCounts = async () => {
      if (!token || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch unread messages count
        const messagesResponse = await fetch('http://localhost:8080/v1/chats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          if (messagesData.success && messagesData.data && messagesData.data.items) {
            // Calculate total unread messages across all chats
            const totalUnread = messagesData.data.items.reduce(
              (total: number, chat: any) => total + (chat.unread_count || 0), 
              0
            )
            setUnreadMessages(totalUnread)
          }
        }

        // Fetch wishlist count (if API exists) - silently fail if not implemented
        if (wishlistApiAvailable) {
          try {
            const wishlistResponse = await fetch('http://localhost:8080/v1/wishlist', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (wishlistResponse.ok) {
              const wishlistData = await wishlistResponse.json()
              if (wishlistData.success && wishlistData.data) {
                setWishlistItems(wishlistData.data.length || 0)
              }
            } else if (wishlistResponse.status === 500 || wishlistResponse.status === 404) {
              // API not implemented or error - disable future polling
              console.debug('Wishlist API not available - disabling polling')
              setWishlistApiAvailable(false)
              setWishlistItems(0)
            }
          } catch (wishlistError) {
            // Network error or API not available - disable future polling
            console.debug('Wishlist API error - disabling polling')
            setWishlistApiAvailable(false)
            setWishlistItems(0)
          }
        }

      } catch (error) {
        console.error('Failed to fetch notification counts:', error)
        setUnreadMessages(0)
        setWishlistItems(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNotificationCounts()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000)
    return () => clearInterval(interval)
  }, [token, user])

  return {
    unreadMessages,
    wishlistItems,
    loading
  }
}