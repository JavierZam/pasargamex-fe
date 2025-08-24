export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'trading' | 'social' | 'secret' | 'milestone' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  points: number
  requirement: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: {
    current: number
    target: number
  }
  isSecret: boolean
  hint?: string
}

export interface UserTitle {
  id: string
  name: string
  description: string
  icon: string
  level: number
  requirement: {
    type: 'sales' | 'purchases' | 'reputation' | 'special'
    value: number
  }
  color: string
  gradient: string
  isUnlocked: boolean
}

export interface GamificationStats {
  totalPoints: number
  currentTitle: UserTitle
  achievementsUnlocked: number
  totalAchievements: number
  secretsFound: number
  streak: {
    type: 'login' | 'trading'
    count: number
    lastUpdate: Date
  }
}

export interface SecretTrigger {
  id: string
  achievementId: string
  type: 'click' | 'navigation' | 'time' | 'sequence' | 'easter_egg'
  condition: {
    element?: string
    count?: number
    timeSpent?: number
    sequence?: string[]
    pattern?: string
  }
  progress: number
}