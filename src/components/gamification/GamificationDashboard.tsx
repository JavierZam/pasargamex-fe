'use client'

import { useState } from 'react'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementBadge from './AchievementBadge'
import UserTitleDisplay from './UserTitleDisplay'
import { Card, CardContent } from '@/components/ui'
import { USER_TITLES } from '@/data/achievements'

interface GamificationDashboardProps {
  className?: string
  compact?: boolean
}

export default function GamificationDashboard({ className = '', compact = false }: GamificationDashboardProps) {
  const { 
    achievements, 
    stats, 
    getUnlockedAchievements, 
    getSecretAchievements 
  } = useAchievements()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'titles'>('overview')
  
  const unlockedAchievements = getUnlockedAchievements()
  const secretAchievements = getSecretAchievements()
  const nextTitle = USER_TITLES.find(t => !t.isUnlocked && t.level === stats.currentTitle.level + 1)

  if (compact) {
    return (
      <div className={`bg-gray-800/30 rounded-2xl p-4 border border-gray-700/30 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Gaming Profile</h3>
          <div className="text-sm text-gray-400">
            Level {stats.level}
          </div>
        </div>
        
        <UserTitleDisplay 
          title={stats.currentTitle} 
          size="sm" 
          showProgress={!!nextTitle}
          currentPoints={stats.totalPoints}
          nextTitle={nextTitle}
        />
        
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-400">Achievements: </span>
              <span className="text-white font-semibold">
                {stats.achievementsUnlocked}/{stats.totalAchievements}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Secrets: </span>
              <span className="text-purple-400 font-semibold">{stats.secretsFound}</span>
            </div>
          </div>
          <div className="text-yellow-400 font-semibold">
            {stats.totalPoints.toLocaleString()} pts
          </div>
        </div>

        {/* Recent achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Recent Achievements</div>
            <div className="flex gap-2">
              {unlockedAchievements.slice(-4).map((achievement) => (
                <AchievementBadge 
                  key={achievement.id} 
                  achievement={achievement} 
                  size="sm" 
                  animated={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.level}</div>
            <div className="text-sm text-gray-400">Current Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.achievementsUnlocked}/{stats.totalAchievements}
            </div>
            <div className="text-sm text-gray-400">Achievements</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.secretsFound}</div>
            <div className="text-sm text-gray-400">Secrets Found</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Title */}
      <Card className="bg-gray-800/30 border-gray-700/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Current Status</h3>
          <UserTitleDisplay 
            title={stats.currentTitle} 
            size="lg" 
            showProgress={!!nextTitle}
            currentPoints={stats.totalPoints}
            nextTitle={nextTitle}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-2xl">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'achievements', label: 'Achievements', icon: '🏆' },
          { id: 'titles', label: 'Titles', icon: '👑' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-brand-red to-brand-blue text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <Card className="bg-gray-800/30 border-gray-700/30">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Achievements</h4>
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {unlockedAchievements.slice(-8).map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-400">Start your journey to unlock achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secret Achievements */}
          <Card className="bg-gray-800/30 border-gray-700/30">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Secret Discoveries</h4>
              {secretAchievements.filter(a => a.unlocked).length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {secretAchievements.filter(a => a.unlocked).map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-gray-400">Hidden secrets await discovery...</p>
                  <p className="text-sm text-purple-400 mt-2">
                    {secretAchievements.length} secrets hidden in PasargameX
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <Card className="bg-gray-800/30 border-gray-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white">All Achievements</h4>
              <div className="text-sm text-gray-400">
                Progress: {stats.achievementsUnlocked}/{stats.totalAchievements} 
                ({Math.round((stats.achievementsUnlocked / stats.totalAchievements) * 100)}%)
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'titles' && (
        <Card className="bg-gray-800/30 border-gray-700/30">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-6">Title Progression</h4>
            
            <div className="space-y-4">
              {USER_TITLES.map((title, index) => (
                <div 
                  key={title.id} 
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                    ${title.isUnlocked 
                      ? 'bg-gray-700/30 border-gray-600/50' 
                      : 'bg-gray-800/20 border-gray-700/30 opacity-60'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-2xl
                    ${title.isUnlocked 
                      ? `bg-gradient-to-r ${title.gradient} bg-opacity-20` 
                      : 'bg-gray-700/50'
                    }
                  `}>
                    <span className="text-2xl">{title.isUnlocked ? title.icon : '🔒'}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className={`font-semibold ${title.isUnlocked ? title.color : 'text-gray-500'}`}>
                        {title.name}
                      </h5>
                      <div className="text-sm text-gray-400">Level {title.level}</div>
                    </div>
                    <p className="text-sm text-gray-400">{title.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Requirement: {title.requirement.value.toLocaleString()} EXP
                    </div>
                  </div>
                  
                  {title.isUnlocked && (
                    <div className="text-green-400 text-xl">✓</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}