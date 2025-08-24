'use client'

import { useState, useEffect } from 'react'
import { calculateLevel, getLevelProgress, getNextMilestone, formatExp, LEVEL_REWARDS } from '@/utils/levelSystem'

interface ExpLevelDisplayProps {
  totalExp: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  animated?: boolean
  className?: string
}

export default function ExpLevelDisplay({ 
  totalExp, 
  size = 'md', 
  showDetails = true, 
  animated = true,
  className = '' 
}: ExpLevelDisplayProps) {
  const [displayExp, setDisplayExp] = useState(totalExp)
  const levelInfo = calculateLevel(displayExp)
  const progress = getLevelProgress(displayExp)
  const nextMilestone = getNextMilestone(levelInfo.level)

  // Animate EXP changes
  useEffect(() => {
    if (!animated || Math.abs(totalExp - displayExp) < 10) {
      setDisplayExp(totalExp)
      return
    }

    const duration = 1000 // 1 second
    const steps = 30
    const increment = (totalExp - displayExp) / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setDisplayExp(totalExp)
        clearInterval(timer)
      } else {
        setDisplayExp(prev => prev + increment)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalExp, displayExp, animated])

  const sizeClasses = {
    sm: {
      container: 'p-3',
      level: 'text-lg',
      title: 'text-sm',
      exp: 'text-xs',
      progress: 'h-1.5'
    },
    md: {
      container: 'p-4',
      level: 'text-2xl',
      title: 'text-base',
      exp: 'text-sm',
      progress: 'h-2'
    },
    lg: {
      container: 'p-6',
      level: 'text-3xl',
      title: 'text-lg',
      exp: 'text-base',
      progress: 'h-3'
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className={`
      bg-gradient-to-br from-gray-800/30 to-gray-900/30 
      backdrop-blur-sm rounded-2xl border border-gray-700/30
      ${styles.container} ${className}
    `}>
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            ${styles.level} font-bold text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-400 to-purple-400
            ${animated ? 'animate-pulse' : ''}
          `}>
            LV. {levelInfo.level}
          </div>
          
          {showDetails && (
            <div>
              <div className={`${styles.title} font-semibold text-white`}>
                {levelInfo.title}
              </div>
              <div className={`${styles.exp} text-gray-400`}>
                {formatExp(Math.floor(displayExp))} EXP
              </div>
            </div>
          )}
        </div>

        {/* EXP to Next Level */}
        {levelInfo.expToNext > 0 && showDetails && (
          <div className="text-right">
            <div className={`${styles.exp} text-gray-400`}>
              To Next Level
            </div>
            <div className={`${styles.exp} font-semibold text-blue-400`}>
              {formatExp(levelInfo.expToNext)} EXP
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showDetails && levelInfo.expToNext > 0 && (
        <div className="mb-3">
          <div className={`
            w-full bg-gray-700 rounded-full ${styles.progress} overflow-hidden
          `}>
            <div 
              className={`
                h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full
                transition-all duration-1000 ease-out relative overflow-hidden
                ${animated ? 'animate-pulse' : ''}
              `}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {Math.floor(progress)}%
            </span>
            {nextMilestone && (
              <span className="text-xs text-yellow-400">
                Next: {nextMilestone.reward.title} @ LV.{nextMilestone.level}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent Unlocks */}
      {showDetails && levelInfo.unlocks.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">Level Perks:</div>
          <div className="flex flex-wrap gap-1">
            {levelInfo.unlocks.map((unlock, index) => (
              <span 
                key={index}
                className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30"
              >
                ✓ {unlock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Preview */}
      {showDetails && nextMilestone && size !== 'sm' && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <div className="text-xs text-yellow-400 font-medium">
            🎯 Next Milestone: Level {nextMilestone.level}
          </div>
          <div className="text-xs text-gray-300">
            {nextMilestone.reward.title} • {nextMilestone.reward.unlocks.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}