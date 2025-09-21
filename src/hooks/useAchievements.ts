'use client'

import { useState, useEffect, useCallback } from 'react'
import { Achievement, SecretTrigger, GamificationStats } from '@/types/gamification'
import { ACHIEVEMENTS, USER_TITLES } from '@/data/achievements'
import { useGamificationAPI } from './useGamificationAPI'
import { toast } from '@/components/ui/Toast'

interface UseAchievementsReturn {
  achievements: Achievement[]
  stats: GamificationStats
  secretTriggers: Map<string, SecretTrigger>
  unlockAchievement: (achievementId: string) => void
  trackSecretTrigger: (triggerId: string, increment?: number) => void
  checkSecretAchievements: () => void
  getUnlockedAchievements: () => Achievement[]
  getLockedAchievements: () => Achievement[]
  getSecretAchievements: () => Achievement[]
  addTestEXP: (points: number) => void
}

export function useAchievements(): UseAchievementsReturn {
  // Get current user ID from localStorage
  const getUserId = () => {
    if (typeof window === 'undefined') return null
    
    const userKeys = ['user', 'userId', 'user_id', 'uid']
    
    for (const key of userKeys) {
      const value = localStorage.getItem(key)
      if (value && value !== 'null' && value !== 'undefined') {
        try {
          const parsed = JSON.parse(value)
          if (parsed.id || parsed.uid || parsed.userId) {
            return parsed.id || parsed.uid || parsed.userId
          } else if (typeof parsed === 'string') {
            return parsed
          }
        } catch {
          return value
        }
      }
    }
    return null
  }

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    // Load achievements from localStorage on init
    if (typeof window !== 'undefined') {
      const userId = getUserId()
      if (userId) {
        const saved = localStorage.getItem(`pasargamex_achievements_${userId}`)
        if (saved) {
          try {
            return JSON.parse(saved)
          } catch (error) {
            console.error('Error loading achievements:', error)
          }
        }
      }
    }
    return ACHIEVEMENTS
  })
  const [secretTriggers, setSecretTriggers] = useState<Map<string, SecretTrigger>>(new Map())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { 
    queueEvent, 
    status: apiStatus, 
    fetchStatus: refetchApiStatus, 
    unlockAchievement: apiUnlockAchievement,
    loading: apiLoading
  } = useGamificationAPI()
  
  // Reset achievements and triggers when user changes
  useEffect(() => {
    const userId = getUserId()
    
    if (userId !== currentUserId) {
      console.log(`🔄 User changed: ${currentUserId} → ${userId}`)
      setCurrentUserId(userId)
      
      // Reset and reload achievements for new user
      if (userId) {
        // Try to sync from API first, fallback to localStorage
        const syncFromAPI = async () => {
          try {
            await refetchApiStatus()
            if (apiStatus?.achievements) {
              // Convert API format to local format
              const apiAchievements = ACHIEVEMENTS.map(baseAch => {
                const apiAch = apiStatus.achievements.find(a => a.achievement.id === baseAch.id)
                return {
                  ...baseAch,
                  unlocked: apiAch?.unlocked || false,
                  unlockedAt: apiAch?.unlockedAt ? new Date(apiAch.unlockedAt) : undefined
                }
              })
              setAchievements(apiAchievements)
              console.log('✅ Synced achievements from API')
              return
            }
          } catch (error) {
            console.warn('⚠️ Failed to sync from API, using localStorage fallback:', error)
          }
          
          // Fallback to localStorage
          const saved = localStorage.getItem(`pasargamex_achievements_${userId}`)
          if (saved) {
            try {
              const userAchievements = JSON.parse(saved)
              setAchievements(userAchievements)
              console.log('📦 Loaded achievements from localStorage')
            } catch (error) {
              console.error('Error loading achievements for user:', error)
              setAchievements(ACHIEVEMENTS)
            }
          } else {
            // New user - start with default achievements
            setAchievements(ACHIEVEMENTS)
            console.log('🆕 New user - starting with default achievements')
          }
        }
        
        syncFromAPI()
      } else {
        // No user - reset to defaults
        setAchievements(ACHIEVEMENTS)
      }
    }
  }, [currentUserId]) // Run when currentUserId changes or on mount
  
  // Initialize secret triggers with persistence and reset on user change
  useEffect(() => {
    // Load from localStorage if available
    let savedTriggers: Map<string, SecretTrigger> = new Map()
    
    if (typeof window !== 'undefined') {
      const userId = getUserId()
      if (userId) {
        const saved = localStorage.getItem(`pasargamex_secret_triggers_${userId}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            savedTriggers = new Map(Object.entries(parsed))
          } catch (error) {
            console.error('Error loading secret triggers:', error)
          }
        }
      }
    }
    
    // Default triggers
    const triggers = new Map<string, SecretTrigger>([
      ['chat_dashboard_switch', {
        id: 'chat_dashboard_switch',
        achievementId: 'no_one_text_you_yet',
        type: 'navigation',
        condition: { count: 10 },
        progress: 0
      }],
      ['floating_button_clicks', {
        id: 'floating_button_clicks',
        achievementId: 'click_master',
        type: 'click',
        condition: { count: 50 },
        progress: 0
      }],
      ['logo_clicks', {
        id: 'logo_clicks',
        achievementId: 'logo_lover',
        type: 'click',
        condition: { count: 25 },
        progress: 0
      }],
      ['konami_code', {
        id: 'konami_code',
        achievementId: 'konami_master',
        type: 'sequence',
        condition: { 
          sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'] 
        },
        progress: 0
      }],
      ['midnight_browse', {
        id: 'midnight_browse',
        achievementId: 'midnight_gamer',
        type: 'time',
        condition: { timeSpent: 333 }, // 3:33 AM check
        progress: 0
      }]
    ])
    
    // Merge saved progress with default triggers
    for (const [key, savedTrigger] of savedTriggers) {
      if (triggers.has(key)) {
        const defaultTrigger = triggers.get(key)!
        triggers.set(key, {
          ...defaultTrigger,
          progress: savedTrigger.progress || 0
        })
      }
    }
    
    setSecretTriggers(triggers)
  }, [currentUserId]) // Reset triggers when user changes

  // Calculate stats with dynamic title based on EXP
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)
  
  // Find current title based on EXP earned
  const getCurrentTitle = () => {
    // Sort titles by EXP requirement (descending) to find highest eligible title
    const sortedTitles = [...USER_TITLES].sort((a, b) => b.requirement.value - a.requirement.value)
    
    for (const title of sortedTitles) {
      if (totalPoints >= title.requirement.value) {
        return { ...title, isUnlocked: true }
      }
    }
    
    return { ...USER_TITLES[0], isUnlocked: true } // Default to Human
  }
  
  const currentTitle = getCurrentTitle()
  
  const stats: GamificationStats = {
    totalPoints,
    currentTitle,
    level: currentTitle.level,
    achievementsUnlocked: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length,
    secretsFound: achievements.filter(a => a.unlocked && a.isSecret).length,
    streak: {
      type: 'login',
      count: 1,
      lastUpdate: new Date()
    }
  }

  const unlockAchievement = useCallback(async (achievementId: string) => {
    // First sync with API
    try {
      await apiUnlockAchievement(achievementId)
      console.log(`🌐 Achievement unlocked on server: ${achievementId}`)
    } catch (error) {
      console.warn(`⚠️ Failed to unlock achievement on server, continuing locally: ${error}`)
    }
    
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === achievementId 
          ? { 
              ...achievement, 
              unlocked: true, 
              unlockedAt: new Date() 
            }
          : achievement
      )
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          const userId = getUserId()
          if (userId) {
            localStorage.setItem(`pasargamex_achievements_${userId}`, JSON.stringify(updated))
          }
        } catch (error) {
          console.error('Error saving achievements:', error)
        }
      }
      
      return updated
    })

    // Show notification (you can integrate with your notification system)
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement) {
      console.log(`🏆 Achievement Unlocked: ${achievement.title}`)
      // Trigger celebration animation or notification
    }
  }, [achievements, apiUnlockAchievement])

  const trackSecretTrigger = useCallback((triggerId: string, increment: number = 1) => {
    // Check if user is authenticated using the same getUserId function
    const userId = getUserId()
    
    if (!userId) {
      console.log('🔒 Achievement tracking requires login. Trigger:', triggerId)
      console.log('🔍 Debug:', { 
        allKeys: Object.keys(localStorage),
        userId: userId
      })
      
      return
    }

    console.log('✅ Tracking secret trigger:', triggerId, 'Count:', increment, 'User:', userId)

    // Update progress and manage notifications
    let shouldShowNotification = false
    let achievementMessage = ''
    
    setSecretTriggers(prev => {
      const newTriggers = new Map(prev)
      const trigger = newTriggers.get(triggerId)
      
      if (trigger) {
        const currentProgress = trigger.progress
        const maxProgress = trigger.condition.count!
        
        // Prevent progress from exceeding max and ensure we don't duplicate progress
        if (currentProgress >= maxProgress) {
          console.log(`🔒 ${triggerId} already completed (${currentProgress}/${maxProgress})`)
          return prev // Don't update if already completed
        }
        
        const newProgress = Math.min(currentProgress + increment, maxProgress)
        const wasIncomplete = currentProgress < maxProgress
        const isNowComplete = newProgress >= maxProgress
        
        // Show notification on achievement unlock for different triggers
        if (wasIncomplete && isNowComplete) {
          shouldShowNotification = true
          if (triggerId === 'logo_clicks') {
            achievementMessage = 'ACHIEVEMENT UNLOCKED!\n🖱️ Logo Lover - You\'ve clicked the logo 25 times! Secret achievements are the best!'
          } else if (triggerId === 'chat_dashboard_switch') {
            achievementMessage = 'ACHIEVEMENT UNLOCKED!\n💬 No One Text You Yet - You switched between Chat and Dashboard 10 times!'
          } else {
            achievementMessage = `ACHIEVEMENT UNLOCKED!\n🎉 Achievement completed!`
          }
        }
        
        // Update the trigger with new progress
        newTriggers.set(triggerId, {
          ...trigger,
          progress: newProgress
        })
        
        // Unlock achievement if completed
        if (isNowComplete) {
          setTimeout(async () => {
            try {
              await unlockAchievement(trigger.achievementId)
            } catch (error) {
              console.error('Failed to unlock achievement:', error)
            }
          }, 500)
        }
        
        console.log(`🎯 ${triggerId} progress: ${newProgress}/${maxProgress}`)
      }
      
      return newTriggers
    })
    
    // Persist to localStorage after state update
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const userId = getUserId()
          if (userId) {
            setSecretTriggers(current => {
              const obj = Object.fromEntries(current)
              localStorage.setItem(`pasargamex_secret_triggers_${userId}`, JSON.stringify(obj))
              return current
            })
          }
        } catch (error) {
          console.error('Error saving secret triggers:', error)
        }
      }
    }, 100)
    
    // Show toast notification after state update
    if (shouldShowNotification && achievementMessage) {
      setTimeout(() => {
        const lines = achievementMessage.split('\n')
        toast.achievement(
          lines[0], // Title
          lines[1] || 'Achievement completed!' // Message
        )
      }, 100)
    }

    // Send event to backend API for tracking
    queueEvent({
      type: 'secret_trigger',
      triggerId,
      count: increment,
      data: {
        progress: secretTriggers.get(triggerId)?.progress || 0,
        userId: getUserId(),
        sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
        page: window.location.pathname
      }
    })
  }, [unlockAchievement, queueEvent])

  const checkSecretAchievements = useCallback(() => {
    // Check time-based achievements
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    
    // Midnight Gamer (3:33 AM)
    if (hour === 3 && minute === 33) {
      const trigger = secretTriggers.get('midnight_browse')
      if (trigger && !achievements.find(a => a.id === trigger.achievementId)?.unlocked) {
        unlockAchievement(trigger.achievementId)
      }
    }
  }, [secretTriggers, achievements, unlockAchievement])

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.unlocked)
  }, [achievements])

  const getLockedAchievements = useCallback(() => {
    return achievements.filter(a => !a.unlocked)
  }, [achievements])

  const getSecretAchievements = useCallback(() => {
    return achievements.filter(a => a.isSecret)
  }, [achievements])
  
  // Testing function to instantly add EXP
  const addTestEXP = useCallback((points: number) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('addTestEXP only available in development mode')
      return
    }
    
    // Create fake achievement for testing
    const testAchievement = {
      id: `test_exp_${Date.now()}`,
      title: 'Test EXP Boost',
      description: `Testing EXP boost of ${points} points`,
      icon: '⚡',
      category: 'testing',
      rarity: 'common',
      points: points,
      requirement: 'Testing purpose only',
      unlocked: true,
      isSecret: false
    } as Achievement
    
    setAchievements(prev => {
      const updated = [
        ...prev.filter(a => !a.id.startsWith('test_exp_')), // Remove old test achievements
        testAchievement
      ]
      
      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        const userId = getUserId()
        if (userId) {
          try {
            localStorage.setItem(`pasargamex_achievements_${userId}`, JSON.stringify(updated))
          } catch (error) {
            console.error('Error saving test achievements:', error)
          }
        }
      }
      
      return updated
    })
    
    console.log(`🧪 Test: Added ${points} EXP for testing purposes`)
  }, [])
  
  // Expose to global for console testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      ;(window as any).addTestEXP = addTestEXP
      console.log('🧪 Development mode: Use addTestEXP(points) in console for testing')
    }
  }, [addTestEXP])

  // Check time-based achievements periodically
  useEffect(() => {
    const interval = setInterval(checkSecretAchievements, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [checkSecretAchievements])

  // Konami Code listener
  useEffect(() => {
    let sequence: string[] = []
    
    const handleKeyPress = (e: KeyboardEvent) => {
      sequence.push(e.code)
      
      const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
      
      // Keep only the last 10 keys
      if (sequence.length > 10) {
        sequence = sequence.slice(-10)
      }
      
      // Check if sequence matches Konami code
      if (sequence.length === 10 && sequence.join(',') === konamiSequence.join(',')) {
        unlockAchievement('konami_master')
        sequence = [] // Reset sequence
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [unlockAchievement])

  return {
    achievements,
    stats,
    secretTriggers,
    unlockAchievement,
    trackSecretTrigger,
    checkSecretAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getSecretAchievements,
    addTestEXP
  }
}