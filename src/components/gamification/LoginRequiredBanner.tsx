'use client'

import { useState } from 'react'
import Link from 'next/link'
import AchievementBadge from './AchievementBadge'
import { ACHIEVEMENTS } from '@/data/achievements'

export default function LoginRequiredBanner() {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible) return null

  const previewAchievements = ACHIEVEMENTS.filter(a => 
    ['founding_father', 'first_purchase', 'first_sale', 'big_spender'].includes(a.id)
  )

  return (
    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      
      {/* Close Button */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl"
      >
        ✕
      </button>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            🔒 Unlock PasargameX Gaming Experience
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Login untuk mengakses <span className="text-indigo-400 font-semibold">achievement system</span>, 
            track progress, dan compete di <span className="text-purple-400 font-semibold">global leaderboard</span>!
          </p>
        </div>

        {/* Achievement Preview */}
        <div className="bg-gray-800/40 rounded-2xl p-6 mb-6">
          <h4 className="text-white font-semibold mb-4 text-center">
            🏆 Achievements Yang Menanti Kamu:
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {previewAchievements.map((achievement) => (
              <div key={achievement.id} className="text-center">
                <AchievementBadge
                  achievement={{ ...achievement, unlocked: false }}
                  size="lg"
                  animated={true}
                  showTooltip={true}
                />
                <div className="mt-2">
                  <div className="text-sm font-medium text-white">{achievement.title}</div>
                  <div className="text-xs text-gray-400">+{achievement.points} EXP</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Dan <span className="text-purple-400 font-semibold">6+ secret achievements</span> yang hidden di seluruh website! 🔮
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-green-400 font-semibold mb-1">Trading Achievements</div>
            <div className="text-sm text-gray-300">
              Unlock dengan setiap purchase & sale
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">👑</div>
            <div className="text-yellow-400 font-semibold mb-1">Title Progression</div>
            <div className="text-sm text-gray-300">
              Human → Demi God → One Above All
            </div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-purple-400 font-semibold mb-1">Global Leaderboard</div>
            <div className="text-sm text-gray-300">
              Compete dengan top traders
            </div>
          </div>
        </div>

        {/* Title Progression Preview */}
        <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
          <h4 className="text-white font-semibold mb-3 text-center">👑 Title Progression System</h4>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { title: 'Human', sales: '0', color: 'gray', icon: '🧑' },
              { title: 'Demi God', sales: '10M', color: 'blue', icon: '⚡' },
              { title: 'God', sales: '50M', color: 'purple', icon: '🔥' },
              { title: 'All Father', sales: '100M', color: 'yellow', icon: '👑' },
              { title: 'One Above All', sales: '500M', color: 'pink', icon: '🌟' }
            ].map((item) => (
              <div key={item.title} className={`p-2 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className={`text-sm font-bold text-${item.color}-400`}>{item.title}</div>
                <div className="text-xs text-gray-500">{item.sales} IDR</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-400">
              Titles unlocked based on total sales amount, not experience points
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth/login"
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-center hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300"
          >
            🚀 Login & Start Gaming
          </Link>
          <Link 
            href="/auth/register"
            className="px-8 py-4 bg-gray-700 text-gray-300 rounded-2xl font-bold text-center hover:bg-gray-600 transition-colors"
          >
            📝 Daftar Gratis
          </Link>
        </div>

        {/* Fun Fact */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            💡 <span className="text-indigo-400">Fun fact:</span> First 1000 verified users akan dapat 
            <span className="text-yellow-400 font-semibold"> "The Founding Father"</span> legendary badge! 👑
          </p>
        </div>
      </div>
    </div>
  )
}