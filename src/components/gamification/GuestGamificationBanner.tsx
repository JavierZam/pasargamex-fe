'use client'

import { useState } from 'react'
import { useGamificationAPI } from '@/hooks/useGamificationAPI'
import ExpLevelDisplay from './ExpLevelDisplay'
import AchievementBadge from './AchievementBadge'
import { ACHIEVEMENTS } from '@/data/achievements'

export default function GuestGamificationBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const { status } = useGamificationAPI()
  
  // Don't show if user is authenticated or banner was dismissed
  if (!isVisible || (status?.user && !status.user.userId.startsWith('guest_'))) {
    return null
  }

  const guestAchievements = ACHIEVEMENTS.filter(a => 
    !a.category.includes('trading') && 
    (a.category === 'secret' || a.category === 'milestone')
  ).slice(0, 4)

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      {/* Close Button */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">🎮</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Selamat datang di PasargameX Gamification! 
            </h3>
            <p className="text-gray-300">
              Kamu sedang bermain sebagai <span className="text-blue-400 font-semibold">Guest</span> - 
              Login untuk menyimpan progress dan unlock fitur lengkap!
            </p>
          </div>
        </div>

        {/* Current Progress (Guest Mode) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Guest Level Display */}
          <div className="lg:col-span-1">
            <ExpLevelDisplay 
              totalExp={status?.stats.totalPoints || 0}
              size="md"
              showDetails={true}
            />
          </div>

          {/* Available Achievements */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
              <h4 className="text-white font-semibold mb-3">🏆 Secret Achievements Yang Bisa Kamu Unlock:</h4>
              <div className="grid grid-cols-4 gap-3">
                {guestAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="md"
                    animated={true}
                    showTooltip={true}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                💡 Tips: Coba klik logo PasargameX, tekan tombol floating, atau ketik kode rahasia!
              </p>
            </div>
          </div>
        </div>

        {/* Login CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30">
          <div>
            <h4 className="text-white font-semibold">🔐 Login untuk Unlock Semua Fitur!</h4>
            <p className="text-sm text-gray-300">
              Simpan progress, akses trading achievements, dan join leaderboard global!
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
              🚀 Login Sekarang
            </button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>

        {/* What You Get */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium text-yellow-400">Trading Achievements</div>
            <div className="text-xs text-gray-400">Unlock dengan jual-beli</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-medium text-purple-400">Global Leaderboard</div>
            <div className="text-xs text-gray-400">Compete dengan users lain</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="text-2xl mb-2">💾</div>
            <div className="text-sm font-medium text-blue-400">Save Progress</div>
            <div className="text-xs text-gray-400">Progress tidak hilang</div>
          </div>
        </div>
      </div>
    </div>
  )
}