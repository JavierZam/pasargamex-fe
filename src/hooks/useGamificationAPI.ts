'use client'

import { useState, useEffect, useCallback } from 'react'
import { Achievement, GamificationStats, UserTitle } from '@/types/gamification'

interface GamificationStatusResponse {
  user: {
    userId: string
    totalPoints: number
    currentLevel: number
    currentTitleId: string
    totalSales: number
    totalPurchases: number
    streaks: {
      loginDays: number
      lastLoginDate: string
      tradingDays: number
      lastTradingDate: string
    }
    secretTriggers: Record<string, number>
    statistics: {
      totalTransactions: number
      successfulSales: number
      positiveReviews: number
      helpedUsers: number
      productViews: number
      searchQueries: number
    }
  }
  currentTitle: UserTitle
  nextTitle?: UserTitle
  achievements: Array<{
    achievement: Achievement
    unlocked: boolean
    unlockedAt?: string
    progress?: {
      current: number
      target: number
      completed: boolean
    }
  }>
  newAchievements: Achievement[]
  stats: GamificationStats
}

interface GamificationEventRequest {
  type: string
  triggerId?: string
  count?: number
  data?: Record<string, any>
  timestamp?: string
}

interface UseGamificationAPIReturn {
  status: GamificationStatusResponse | null
  loading: boolean
  error: string | null
  
  // Methods
  fetchStatus: () => Promise<void>
  trackEvents: (events: GamificationEventRequest[]) => Promise<void>
  processEvents: () => Promise<Achievement[]>
  unlockAchievement: (achievementId: string, triggerData?: Record<string, any>) => Promise<void>
  updateProgress: (progressType: string, value: number) => Promise<void>
  updateStatistics: (statType: string, increment?: number) => Promise<void>
  
  // Event queue management
  queueEvent: (event: GamificationEventRequest) => void
  flushEventQueue: () => Promise<void>
}

export function useGamificationAPI(): UseGamificationAPIReturn {
  const [status, setStatus] = useState<GamificationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventQueue, setEventQueue] = useState<GamificationEventRequest[]>([])

  // Get auth token (you'll need to implement this based on your auth system)
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken') // Adjust based on your auth implementation
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-User-ID': localStorage.getItem('userId') || '', // Adjust based on your auth implementation
    }
  }, [])

  // Fetch gamification status
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gamification/status', {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('User not authenticated')
        }
        throw new Error('Failed to fetch gamification status')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('Failed to fetch gamification status:', err)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  // Track events
  const trackEvents = useCallback(async (events: GamificationEventRequest[]) => {
    try {
      const response = await fetch('/api/gamification/track-events', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ events }),
      })

      if (!response.ok) {
        throw new Error('Failed to track events')
      }

      const result = await response.json()
      console.log('Events tracked successfully:', result)
    } catch (err) {
      console.error('Failed to track events:', err)
      throw err
    }
  }, [getAuthHeaders])

  // Process events
  const processEvents = useCallback(async (): Promise<Achievement[]> => {
    try {
      const response = await fetch('/api/gamification/process-events', {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to process events')
      }

      const result = await response.json()
      return result.newAchievements || []
    } catch (err) {
      console.error('Failed to process events:', err)
      throw err
    }
  }, [getAuthHeaders])

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievementId: string, triggerData?: Record<string, any>) => {
    try {
      const response = await fetch('/api/gamification/unlock-achievement', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          achievementId, 
          triggerData 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to unlock achievement')
      }

      // Refresh status after unlocking
      await fetchStatus()
    } catch (err) {
      console.error('Failed to unlock achievement:', err)
      throw err
    }
  }, [getAuthHeaders, fetchStatus])

  // Update progress
  const updateProgress = useCallback(async (progressType: string, value: number) => {
    try {
      const response = await fetch('/api/gamification/update-progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          progressType, 
          value 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
      throw err
    }
  }, [getAuthHeaders])

  // Update statistics
  const updateStatistics = useCallback(async (statType: string, increment: number = 1) => {
    try {
      const response = await fetch('/api/gamification/update-stats', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          statType, 
          increment 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update statistics')
      }
    } catch (err) {
      console.error('Failed to update statistics:', err)
      throw err
    }
  }, [getAuthHeaders])

  // Queue event for batch processing
  const queueEvent = useCallback((event: GamificationEventRequest) => {
    setEventQueue(prev => [...prev, {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    }])
  }, [])

  // Flush event queue
  const flushEventQueue = useCallback(async () => {
    if (eventQueue.length === 0) return

    try {
      await trackEvents(eventQueue)
      setEventQueue([]) // Clear queue after successful tracking
    } catch (err) {
      console.error('Failed to flush event queue:', err)
      // Keep events in queue for retry
    }
  }, [eventQueue, trackEvents])

  // Auto-flush event queue periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        flushEventQueue()
      }
    }, 30000) // Flush every 30 seconds

    return () => clearInterval(interval)
  }, [eventQueue, flushEventQueue])

  // Flush queue when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.length > 0) {
        // Use sendBeacon for reliable delivery
        navigator.sendBeacon('/api/gamification/track-events', JSON.stringify({ 
          events: eventQueue 
        }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [eventQueue])

  // Initial fetch
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    fetchStatus,
    trackEvents,
    processEvents,
    unlockAchievement,
    updateProgress,
    updateStatistics,
    queueEvent,
    flushEventQueue,
  }
}