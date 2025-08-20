'use client'

import { UserTitle } from '@/types/gamification'

interface UserTitleDisplayProps {
  title: UserTitle
  showProgress?: boolean
  currentPoints?: number
  nextTitle?: UserTitle
  size?: 'sm' | 'md' | 'lg'
}

export default function UserTitleDisplay({ 
  title, 
  showProgress = false, 
  currentPoints = 0,
  nextTitle,
  size = 'md' 
}: UserTitleDisplayProps) {
  
  const sizeClasses = {
    sm: {
      text: 'text-sm',
      icon: 'text-base w-6 h-6',
      padding: 'px-2 py-1'
    },
    md: {
      text: 'text-base',
      icon: 'text-lg w-8 h-8',
      padding: 'px-3 py-2'
    },
    lg: {
      text: 'text-xl',
      icon: 'text-2xl w-12 h-12',
      padding: 'px-4 py-3'
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className="flex flex-col gap-2">
      {/* Title Badge */}
      <div className={`
        inline-flex items-center gap-2 rounded-2xl border
        bg-gradient-to-r ${title.gradient} bg-opacity-20 
        border-gray-600/50 backdrop-blur-sm
        ${styles.padding} ${styles.text}
        shadow-lg hover:shadow-xl transition-all duration-300
        group hover:scale-105
      `}>
        <div className={`
          flex items-center justify-center rounded-xl
          ${styles.icon} ${styles.icon.includes('w-12') ? 'p-2' : 'p-1'}
          bg-black/20 backdrop-blur-sm
          group-hover:rotate-12 transition-transform duration-300
        `}>
          <span>{title.icon}</span>
        </div>
        
        <div className="flex flex-col">
          <span className={`font-bold ${title.color} drop-shadow-lg`}>
            {title.name}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-400 font-medium">
              Level {title.level}
            </span>
          )}
        </div>

        {/* Level Indicator */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${i < title.level 
                  ? `bg-gradient-to-r ${title.gradient}` 
                  : 'bg-gray-600/50'
                }
              `} 
            />
          ))}
        </div>
      </div>

      {/* Progress to Next Title */}
      {showProgress && nextTitle && (
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress to {nextTitle.name}</span>
            <span className="text-sm text-gray-300">
              {currentPoints.toLocaleString()} / {nextTitle.requirement.value.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`
                h-2 rounded-full transition-all duration-500 ease-out
                bg-gradient-to-r ${nextTitle.gradient}
                relative overflow-hidden
              `}
              style={{ 
                width: `${Math.min((currentPoints / nextTitle.requirement.value) * 100, 100)}%` 
              }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Next:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{nextTitle.icon}</span>
              <span className={`text-sm font-semibold ${nextTitle.color}`}>
                {nextTitle.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}