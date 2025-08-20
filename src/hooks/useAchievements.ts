'use client'

import { useState, useEffect, useCallback } from 'react'
import { Achievement, SecretTrigger, GamificationStats } from '@/types/gamification'
import { ACHIEVEMENTS, USER_TITLES } from '@/data/achievements'
import { useGamificationAPI } from './useGamificationAPI'

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
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [secretTriggers, setSecretTriggers] = useState<Map<string, SecretTrigger>>(new Map())
  const { queueEvent, status } = useGamificationAPI()
  
  // Initialize secret triggers
  useEffect(() => {
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
    
    setSecretTriggers(triggers)
  }, [])

  // Calculate stats
  const stats: GamificationStats = {
    totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    currentTitle: USER_TITLES.find(t => t.isUnlocked) || USER_TITLES[0],
    achievementsUnlocked: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length,
    secretsFound: achievements.filter(a => a.unlocked && a.isSecret).length,
    level: Math.floor(achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0) / 1000) + 1,
    nextLevelPoints: 1000,
    streak: {
      type: 'login',
      count: 1,
      lastUpdate: new Date()
    }
  }

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId 
        ? { 
            ...achievement, 
            unlocked: true, 
            unlockedAt: new Date() 
          }
        : achievement
    ))

    // Show notification (you can integrate with your notification system)
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement) {
      console.log(`🎉 Achievement Unlocked: ${achievement.title}`)
      // Trigger celebration animation or notification
    }
  }, [achievements])

  const trackSecretTrigger = useCallback((triggerId: string, increment: number = 1) => {
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

    setSecretTriggers(prev => {
      const newTriggers = new Map(prev)
      const trigger = newTriggers.get(triggerId)
      
      if (trigger) {
        const newProgress = trigger.progress + increment
        newTriggers.set(triggerId, {
          ...trigger,
          progress: newProgress
        })

        // Check if trigger condition is met
        if (trigger.condition.count && newProgress >= trigger.condition.count) {
          // Unlock the associated achievement
          setTimeout(() => unlockAchievement(trigger.achievementId), 500)
        }
      }
      
      return newTriggers
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