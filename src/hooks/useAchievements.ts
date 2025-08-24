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
  const { queueEvent, status } = useGamificationAPI()
  
  // Initialize secret triggers with persistence
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
  }, [])

  // Calculate stats
  const stats: GamificationStats = {
    totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    currentTitle: USER_TITLES.find(t => t.isUnlocked) || USER_TITLES[0],
    achievementsUnlocked: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length,
    secretsFound: achievements.filter(a => a.unlocked && a.isSecret).length,
    streak: {
      type: 'login',
      count: 1,
      lastUpdate: new Date()
    }
  }

  const unlockAchievement = useCallback((achievementId: string) => {
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
      
      // Save to localStorage
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
      console.log(`🎉 Achievement Unlocked: ${achievement.title}`)
      // Trigger celebration animation or notification
    }
  }, [achievements])

  const trackSecretTrigger = useCallback((triggerId: string, increment: number = 1) => {
    // Check if user is authenticated using the same getUserId function
    const userId = getUserId()
    
    if (!userId) {
      console.log('🔒 Achievement tracking requires login. Trigger:', triggerId)
      console.log('🔍 Debug:', { 
        allKeys: Object.keys(localStorage),
        userId: userId
      })
      
      // Show toast notification for logo clicks specifically
      if (triggerId === 'logo_clicks') {
        setTimeout(() => {
          toast.warning(
            'Achievement Locked',
            '🔒 Login required to unlock "Logo Lover" achievement!'
          )
        }, 100)
      }
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
          setTimeout(() => unlockAchievement(trigger.achievementId), 500)
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

    // Send event to backend API
    queueEvent({
      type: 'secret_trigger',
      triggerId,
      count: increment,
      data: {
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
    getSecretAchievements
  }
}