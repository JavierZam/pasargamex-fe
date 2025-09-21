'use client'

import { useState, useEffect } from 'react'
import { UserTitle } from '@/types/gamification'

interface TitleProgressDisplayProps {
  currentTitle: UserTitle
  currentPoints: number
  nextTitle?: UserTitle
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  animated?: boolean
  className?: string
}

export default function TitleProgressDisplay({ 
  currentTitle,
  currentPoints,
  nextTitle,
  size = 'md', 
  showDetails = true, 
  animated = true,
  className = '' 
}: TitleProgressDisplayProps) {
  const [displayPoints, setDisplayPoints] = useState(currentPoints)

  // Animate points changes
  useEffect(() => {
    if (!animated || Math.abs(currentPoints - displayPoints) < 10) {
      setDisplayPoints(currentPoints)
      return
    }

    const duration = 1000 // 1 second
    const steps = 30
    const increment = (currentPoints - displayPoints) / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setDisplayPoints(currentPoints)
        clearInterval(timer)
      } else {
        setDisplayPoints(prev => prev + increment)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [currentPoints, displayPoints, animated])

  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-lg',
      subtitle: 'text-sm',
      sales: 'text-xs',
      progress: 'h-1.5'
    },
    md: {
      container: 'p-4',
      title: 'text-2xl',
      subtitle: 'text-base',
      sales: 'text-sm',
      progress: 'h-2'
    },
    lg: {
      container: 'p-6',
      title: 'text-3xl',
      subtitle: 'text-lg', 
      sales: 'text-base',
      progress: 'h-3'
    }
  }

  const styles = sizeClasses[size]

  const currentGradient = currentTitle.gradient
  const nextGradient = nextTitle ? nextTitle.gradient : currentGradient
  
  const progress = nextTitle ? Math.min((currentPoints / nextTitle.requirement.value) * 100, 100) : 100
  const pointsToNext = nextTitle ? Math.max(nextTitle.requirement.value - currentPoints, 0) : 0

  return (
    <div className={`
      bg-gradient-to-br from-gray-800/30 to-gray-900/30 
      backdrop-blur-sm rounded-2xl border border-gray-700/30
      ${styles.container} ${className}
    `}>
      {/* Current Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            ${styles.title} font-bold text-transparent bg-clip-text 
            bg-gradient-to-r ${currentGradient}
            ${animated ? 'animate-pulse' : ''}
            drop-shadow-lg
          `} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
            {currentTitle.name}
          </div>
          
          {showDetails && (
            <div>
              <div className={`${styles.sales} text-gray-400`}>
                {Math.floor(displayPoints)} EXP
              </div>
            </div>
          )}
        </div>

        {/* Title Icon */}
        <div className="text-3xl">
          {currentTitle.icon}
        </div>
      </div>

      {/* Progress to Next Title */}
      {nextTitle && showDetails && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`${styles.sales} text-gray-400`}>
              Progress to {nextTitle.name}
            </span>
            <span className={`${styles.sales} text-gray-300`}>
              {pointsToNext.toLocaleString()} EXP to go
            </span>
          </div>
          
          <div className={`
            w-full bg-gray-700 rounded-full ${styles.progress} overflow-hidden
          `}>
            <div 
              className={`
                h-full rounded-full transition-all duration-1000 ease-out
                bg-gradient-to-r ${nextGradient}
                relative overflow-hidden
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
              {Math.floor(progress)}% complete
            </span>
            <span className={`text-xs text-transparent bg-clip-text bg-gradient-to-r ${nextGradient}`}>
              Next: {nextTitle.name}
            </span>
          </div>
        </div>
      )}

      {/* Next Title Preview */}
      {showDetails && nextTitle && size !== 'sm' && (
        <div className={`mt-3 p-2 rounded-xl border bg-gradient-to-r ${nextGradient} bg-opacity-10 border-opacity-20`}>
          <div className={`text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r ${nextGradient}`}>
            🎯 Next Title: {nextTitle.name}
          </div>
          <div className="text-xs text-gray-300">
            Requirement: {nextTitle.requirement.value.toLocaleString()} EXP
          </div>
          <div className="text-xs text-gray-400">
            {nextTitle.description}
          </div>
        </div>
      )}

      {/* Max Title Achieved */}
      {!nextTitle && currentTitle.id === 'one_above_all' && (
        <div className="mt-3 p-3 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl border border-pink-500/30">
          <div className="text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              MAXIMUM TITLE ACHIEVED!
            </div>
            <div className="text-xs text-gray-300">
              You are truly One Above All
            </div>
          </div>
        </div>
      )}
    </div>
  )
}