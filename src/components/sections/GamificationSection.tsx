'use client'

import { useAchievements } from '@/hooks/useAchievements'
import AchievementBadge from '@/components/gamification/AchievementBadge'
import UserTitleDisplay from '@/components/gamification/UserTitleDisplay'
import { Card, CardContent } from '@/components/ui'
import Link from 'next/link'
import { USER_TITLES } from '@/data/achievements'

export default function GamificationSection() {
  const { 
    achievements, 
    stats, 
    getUnlockedAchievements, 
    getSecretAchievements 
  } = useAchievements()
  
  const unlockedAchievements = getUnlockedAchievements()
  const secretAchievements = getSecretAchievements().filter(a => a.unlocked)
  const nextTitle = USER_TITLES.find(t => !t.isUnlocked && t.level === stats.currentTitle.level + 1)

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900/50 to-black/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
          {/* Current Status */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/30 border-gray-700/30 h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span>👑</span> Your Gaming Status
                </h3>
                
                <UserTitleDisplay 
                  title={stats.currentTitle} 
                  size="lg" 
                  showProgress={!!nextTitle}
                  currentPoints={stats.totalPoints}
                  nextTitle={nextTitle}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">Lv. {stats.level}</div>
                    <div className="text-xs text-gray-400">Current Level</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{stats.secretsFound}</div>
                    <div className="text-xs text-gray-400">Secrets Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Preview */}
          <div>
            <Card className="bg-gray-800/30 border-gray-700/30 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Unlocks</h3>
                  <div className="text-sm text-gray-400">
                    {stats.achievementsUnlocked}/{stats.totalAchievements}
                  </div>
                </div>

                {unlockedAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {/* Latest achievements */}
                    <div className="grid grid-cols-4 gap-2">
                      {unlockedAchievements.slice(-8).map((achievement) => (
                        <AchievementBadge 
                          key={achievement.id} 
                          achievement={achievement} 
                          size="sm"
                          animated={false}
                        />
                      ))}
                    </div>

                    {/* Secret achievements */}
                    {secretAchievements.length > 0 && (
                      <div>
                        <div className="text-sm text-purple-400 font-medium mb-2">Secret Discoveries</div>
                        <div className="flex gap-2">
                          {secretAchievements.slice(-4).map((achievement) => (
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

                    <Link 
                      href="/dashboard?tab=gamification" 
                      className="block w-full text-center py-3 bg-gradient-to-r from-brand-red to-brand-blue rounded-xl text-white font-medium hover:shadow-lg hover:shadow-brand-red/30 transition-all duration-300"
                    >
                      View All Achievements
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎯</div>
                    <h4 className="text-white font-medium mb-2">Start Your Journey</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Complete your first transaction to unlock achievements!
                    </p>
                    <Link 
                      href="/products" 
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-medium transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievement Categories Preview */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Achievement Categories
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Trading', icon: '💰', color: 'green', count: achievements.filter(a => a.category === 'trading').length },
              { name: 'Social', icon: '🤝', color: 'blue', count: achievements.filter(a => a.category === 'social').length },
              { name: 'Milestones', icon: '🏆', color: 'yellow', count: achievements.filter(a => a.category === 'milestone').length },
              { name: 'Secrets', icon: '🔍', color: 'purple', count: achievements.filter(a => a.category === 'secret').length }
            ].map((category) => (
              <div 
                key={category.name}
                className={`
                  text-center p-4 rounded-xl border transition-all duration-300 cursor-pointer
                  hover:scale-105 hover:shadow-lg
                  bg-${category.color}-500/10 border-${category.color}-500/20 
                  hover:border-${category.color}-500/40
                `}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-white font-medium">{category.name}</div>
                <div className="text-sm text-gray-400">{category.count} achievements</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Achievement Hints */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-700/30">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secret Achievements Await</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Hidden throughout PasargameX are secret achievements waiting to be discovered. 
                Try different interactions, explore every corner, and maybe even enter some famous codes...
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-black/20 p-3 rounded-xl border border-gray-700/30">
                  <div className="text-purple-400 font-medium">🖱️ Click Master</div>
                  <div className="text-gray-400">Some buttons love attention...</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-gray-700/30">
                  <div className="text-purple-400 font-medium">🌙 Midnight Gamer</div>
                  <div className="text-gray-400">When the clock strikes...</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-gray-700/30">
                  <div className="text-purple-400 font-medium">🎮 Konami Master</div>
                  <div className="text-gray-400">Up, Up, Down, Down...</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}