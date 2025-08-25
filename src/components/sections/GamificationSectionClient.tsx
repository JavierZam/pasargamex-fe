'use client'

import { useState, useEffect } from 'react'
import { useAchievements } from '@/hooks/useAchievements'
import { useGamificationAPI } from '@/hooks/useGamificationAPI'
import AchievementBadge from '@/components/gamification/AchievementBadge'
import UserTitleDisplay from '@/components/gamification/UserTitleDisplay'
import TitleProgressDisplay from '@/components/gamification/TitleProgressDisplay'
import LoginRequiredBanner from '@/components/gamification/LoginRequiredBanner'
import { Card, CardContent } from '@/components/ui'
import Link from 'next/link'
import { USER_TITLES } from '@/data/achievements'

export default function GamificationSectionClient() {
  const { 
    achievements, 
    stats, 
    getUnlockedAchievements, 
    getSecretAchievements 
  } = useAchievements()
  
  const { status, loading, error } = useGamificationAPI()
  
  // Check authentication - with hydration safety
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    const checkAuth = () => {
      if (typeof window === 'undefined') return false
      
      // Check berbagai kemungkinan key names
      const authKeys = ['auth_token', 'authToken', 'token', 'accessToken', 'firebaseToken']
      const userKeys = ['user', 'userId', 'user_id', 'uid']
      
      let foundToken = null
      let foundUserId = null
      
      // Check semua kemungkinan token keys
      for (const key of authKeys) {
        const value = localStorage.getItem(key)
        if (value && value !== 'undefined' && value !== 'null') {
          foundToken = value
          break
        }
      }
      
      // Check semua kemungkinan user keys - handle JSON format  
      for (const key of userKeys) {
        const value = localStorage.getItem(key)
        if (value && value !== 'undefined' && value !== 'null') {
          try {
            // Try parsing as JSON first (for 'user' key)
            const parsed = JSON.parse(value)
            if (parsed.id || parsed.uid || parsed.userId) {
              foundUserId = parsed.id || parsed.uid || parsed.userId
            } else if (typeof parsed === 'string') {
              foundUserId = parsed
            }
          } catch {
            // If not JSON, use as plain string
            foundUserId = value
          }
          break
        }
      }
      
      return !!(foundToken && foundUserId)
    }
    
    setIsLoggedIn(checkAuth())
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-900/50 to-black/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-white">Loading Gaming Achievements...</h3>
          </div>
        </div>
      </section>
    )
  }
  
  const unlockedAchievements = getUnlockedAchievements()
  const secretAchievements = getSecretAchievements().filter(a => a.unlocked)
  const nextTitle = USER_TITLES.find(t => !t.isUnlocked && t.level === stats.currentTitle.level + 1)

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900/50 to-black/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Login Required Banner */}
        {!isLoggedIn && <LoginRequiredBanner />}
        
        {/* Don't show gamification content if not logged in */}
        {!isLoggedIn && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-2">Authentication Required</h3>
            <p className="text-gray-400">Please login to access your gaming achievements and progress.</p>
          </div>
        )}
        
        {/* Gamification Content - Only for logged in users */}
        {isLoggedIn && (
          <div>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">Gaming</span> <span className="text-brand-blue">Achievements</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock achievements, discover secrets, and climb the ranks in the ultimate gaming marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Progress */}
          <div className="lg:col-span-1">
            <Card className="bg-black/60 border-gray-800">
              <CardContent className="p-6">
                {/* User Title */}
                <UserTitleDisplay 
                  title={stats.currentTitle} 
                  className="mb-6"
                />
                
                {/* Title Progress */}
                <TitleProgressDisplay 
                  currentTitle={stats.currentTitle}
                  currentPoints={stats.totalPoints}
                  nextTitle={nextTitle}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-400 truncate" title={stats.currentTitle.name}>
                      {stats.currentTitle.name}
                    </div>
                    <div className="text-xs text-gray-400">Current Title</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="text-lg font-bold text-yellow-400">{stats.totalPoints}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-lg font-bold text-purple-400">{stats.secretsFound}</div>
                    <div className="text-xs text-gray-400">Secrets Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Achievements */}
          <div className="lg:col-span-2">
            <Card className="bg-black/60 border-gray-800">
              <CardContent className="p-6">
                {/* Achievement Summary */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Your Achievements</h3>
                    <p className="text-gray-400 text-sm">
                      {stats.achievementsUnlocked} of {stats.totalAchievements} unlocked
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                  <div 
                    className="bg-gradient-to-r from-brand-blue to-brand-red h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(stats.achievementsUnlocked / stats.totalAchievements) * 100}%` 
                    }}
                  />
                </div>

                {/* Recent Achievements */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Recent Achievements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unlockedAchievements.slice(0, 6).map((achievement) => (
                      <AchievementBadge 
                        key={achievement.id} 
                        achievement={achievement}
                        size="medium"
                        showProgress={false}
                      />
                    ))}
                  </div>

                  {/* Secret Achievements */}
                  {secretAchievements.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-white mb-4">🤫 Secret Achievements</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {secretAchievements.map((achievement) => (
                          <AchievementBadge 
                            key={achievement.id} 
                            achievement={achievement}
                            size="medium"
                            showProgress={false}
                            isSecret={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Button */}
                  <div className="text-center pt-6">
                    <Link 
                      href="/achievements" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-red hover:from-brand-blue/80 hover:to-brand-red/80 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <span className="mr-2">🏆</span>
                      View All Achievements
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
        )}
      </div>
    </section>
  )
}