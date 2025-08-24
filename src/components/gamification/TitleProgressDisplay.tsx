'use client'

import { useState, useEffect } from 'react'
import { calculateTitle, formatSales, TITLE_REQUIREMENTS } from '@/utils/levelSystem'

interface TitleProgressDisplayProps {
  totalSales: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  animated?: boolean
  className?: string
}

export default function TitleProgressDisplay({ 
  totalSales, 
  size = 'md', 
  showDetails = true, 
  animated = true,
  className = '' 
}: TitleProgressDisplayProps) {
  const [displaySales, setDisplaySales] = useState(totalSales)
  const titleInfo = calculateTitle(displaySales)

  // Animate sales changes
  useEffect(() => {
    if (!animated || Math.abs(totalSales - displaySales) < 1000) {
      setDisplaySales(totalSales)
      return
    }

    const duration = 1000 // 1 second
    const steps = 30
    const increment = (totalSales - displaySales) / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setDisplaySales(totalSales)
        clearInterval(timer)
      } else {
        setDisplaySales(prev => prev + increment)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalSales, displaySales, animated])

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

  // Get title styling
  const getTitleStyling = (titleId: string) => {
    switch (titleId) {
      case 'human':
        return 'from-gray-400 to-gray-500'
      case 'demi_god':
        return 'from-yellow-400 to-orange-500'
      case 'god':
        return 'from-orange-500 to-red-500'
      case 'all_father':
        return 'from-purple-500 to-indigo-600'
      case 'one_above_all':
        return 'from-pink-400 via-purple-400 to-cyan-400'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const currentGradient = getTitleStyling(titleInfo.currentTitle.id)
  const nextGradient = titleInfo.nextTitle ? getTitleStyling(titleInfo.nextTitle.id) : currentGradient

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
          `}>
            {titleInfo.currentTitle.name}
          </div>
          
          {showDetails && (
            <div>
              <div className={`${styles.sales} text-gray-400`}>
                {formatSales(Math.floor(displaySales))} in sales
              </div>
            </div>
          )}
        </div>

        {/* Title Icon */}
        <div className="text-3xl">
          {titleInfo.currentTitle.id === 'human' && '👤'}
          {titleInfo.currentTitle.id === 'demi_god' && '⚡'}
          {titleInfo.currentTitle.id === 'god' && '🔥'}
          {titleInfo.currentTitle.id === 'all_father' && '👑'}
          {titleInfo.currentTitle.id === 'one_above_all' && '✨'}
        </div>
      </div>

      {/* Progress to Next Title */}
      {titleInfo.nextTitle && showDetails && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`${styles.sales} text-gray-400`}>
              Progress to {titleInfo.nextTitle.name}
            </span>
            <span className={`${styles.sales} text-gray-300`}>
              {formatSales(titleInfo.salesToNext)} to go
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
              style={{ width: `${titleInfo.progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {Math.floor(titleInfo.progress)}% complete
            </span>
            <span className={`text-xs text-transparent bg-clip-text bg-gradient-to-r ${nextGradient}`}>
              Next: {titleInfo.nextTitle.name}
            </span>
          </div>
        </div>
      )}

      {/* Current Title Unlocks */}
      {showDetails && titleInfo.currentTitle.unlocks.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">Current Perks:</div>
          <div className="flex flex-wrap gap-1">
            {titleInfo.currentTitle.unlocks.map((unlock, index) => (
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

      {/* Next Title Preview */}
      {showDetails && titleInfo.nextTitle && size !== 'sm' && (
        <div className={`mt-3 p-2 rounded-xl border bg-gradient-to-r ${nextGradient} bg-opacity-10 border-opacity-20`}>
          <div className={`text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r ${nextGradient}`}>
            🎯 Next Title: {titleInfo.nextTitle.name}
          </div>
          <div className="text-xs text-gray-300">
            Requirement: {formatSales(titleInfo.nextTitle.salesRequired)} in sales
          </div>
          <div className="text-xs text-gray-400">
            Unlocks: {titleInfo.nextTitle.unlocks.join(', ')}
          </div>
        </div>
      )}

      {/* Max Title Achieved */}
      {!titleInfo.nextTitle && titleInfo.currentTitle.id === 'one_above_all' && (
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