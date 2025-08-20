'use client'

import { Achievement } from '@/types/gamification'
import { ACHIEVEMENT_RARITIES } from '@/data/achievements'
import { useState } from 'react'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  animated?: boolean
  onClick?: () => void
}

export default function AchievementBadge({ 
  achievement, 
  size = 'md', 
  showTooltip = true, 
  animated = true,
  onClick 
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const rarity = ACHIEVEMENT_RARITIES[achievement.rarity]
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl'
  }

  const isUnlocked = achievement.unlocked
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Achievement Badge */}
      <div className={`
        ${sizeClasses[size]} 
        rounded-2xl border-2 flex items-center justify-center cursor-pointer
        transition-all duration-300 transform
        ${isUnlocked 
          ? `${rarity.bg} ${rarity.border} ${animated ? 'hover:scale-110 hover:rotate-3' : ''} shadow-lg ${rarity.glow}` 
          : 'bg-gray-800/50 border-gray-700/50 grayscale opacity-60'
        }
        ${animated && isUnlocked ? 'animate-pulse hover:animate-none' : ''}
      `}>
        <span className={`
          ${isUnlocked ? rarity.color : 'text-gray-600'}
          ${animated && isUnlocked && achievement.rarity === 'mythic' ? 'animate-bounce' : ''}
        `}>
          {isUnlocked ? achievement.icon : '🔒'}
        </span>
        
        {/* Mythic Aura Effect */}
        {isUnlocked && achievement.rarity === 'mythic' && animated && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/30 to-cyan-500/30 animate-ping"></div>
        )}
      </div>

      {/* New Achievement Notification */}
      {isUnlocked && achievement.unlockedAt && 
       new Date(achievement.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
          !
        </div>
      )}

      {/* Secret Achievement Indicator */}
      {achievement.isSecret && isUnlocked && (
        <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          ✨
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 min-w-64 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${isUnlocked ? rarity.color : 'text-gray-600'}`}>
                {isUnlocked ? achievement.icon : '🔒'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {isUnlocked ? achievement.title : (achievement.isSecret ? '???' : achievement.title)}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${rarity.color} ${rarity.bg} border ${rarity.border}`}>
                    {achievement.rarity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">
                  {isUnlocked 
                    ? achievement.description 
                    : achievement.isSecret 
                      ? achievement.hint || 'This is a secret achievement...' 
                      : achievement.description
                  }
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Points:</span>
                    <span className="text-xs text-yellow-400 font-semibold">+{achievement.points}</span>
                  </div>
                  {achievement.isSecret && (
                    <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                      SECRET
                    </div>
                  )}
                </div>

                {/* Progress Bar for achievements with progress */}
                {achievement.progress && !isUnlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress.current}/{achievement.progress.target}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${rarity.color.replace('text-', 'from-')} to-transparent transition-all duration-300`}
                        style={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {isUnlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700/50"></div>
        </div>
      )}
    </div>
  )
}