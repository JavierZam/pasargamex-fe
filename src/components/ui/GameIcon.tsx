'use client'

import { useState } from 'react'

interface GameIconProps {
  icon?: string
  title: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  unlocked?: boolean
  animated?: boolean
  className?: string
}

const RARITY_STYLES = {
  common: {
    bg: 'from-gray-600 to-gray-500',
    shadow: 'shadow-gray-500/20',
    border: 'border-gray-400/50'
  },
  rare: {
    bg: 'from-blue-600 to-blue-500',
    shadow: 'shadow-blue-500/30',
    border: 'border-blue-400/50'
  },
  epic: {
    bg: 'from-purple-600 to-purple-500',
    shadow: 'shadow-purple-500/30',
    border: 'border-purple-400/50'
  },
  legendary: {
    bg: 'from-yellow-500 to-orange-500',
    shadow: 'shadow-yellow-500/40',
    border: 'border-yellow-400/60'
  },
  mythic: {
    bg: 'from-pink-500 via-purple-500 to-cyan-500',
    shadow: 'shadow-pink-500/50',
    border: 'border-pink-400/60'
  }
}

const SIZE_STYLES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl'
}

export default function GameIcon({ 
  icon, 
  title, 
  rarity = 'common', 
  size = 'md', 
  unlocked = false, 
  animated = true,
  className = '' 
}: GameIconProps) {
  const [imageError, setImageError] = useState(false)
  
  const rarityStyle = RARITY_STYLES[rarity]
  const sizeStyle = SIZE_STYLES[size]
  
  // Use placeholder icons based on category if no icon provided
  const getPlaceholderIcon = () => {
    if (icon && icon.startsWith('http')) {
      return null // Will use img tag
    }
    
    if (icon && !imageError) {
      return icon // Use provided emoji/text icon
    }
    
    // Fallback icons based on title keywords
    if (title.toLowerCase().includes('purchase')) return '🛒'
    if (title.toLowerCase().includes('sale')) return '💰'
    if (title.toLowerCase().includes('click')) return '👆'
    if (title.toLowerCase().includes('master')) return '🎯'
    if (title.toLowerCase().includes('father')) return '👑'
    if (title.toLowerCase().includes('god')) return '⚡'
    if (title.toLowerCase().includes('midnight')) return '🌙'
    if (title.toLowerCase().includes('konami')) return '🎮'
    if (title.toLowerCase().includes('logo')) return '❤️'
    if (title.toLowerCase().includes('secret')) return '🔮'
    
    return '🏆' // Default achievement icon
  }

  const displayIcon = getPlaceholderIcon()
  const isImageIcon = icon && icon.startsWith('http') && !imageError

  return (
    <div className={`
      relative flex items-center justify-center rounded-2xl border-2 transition-all duration-300
      ${sizeStyle}
      ${unlocked 
        ? `bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.shadow}` 
        : 'bg-gray-800/50 border-gray-700/50 grayscale opacity-60'
      }
      ${animated && unlocked ? 'hover:scale-110 hover:rotate-3' : ''}
      ${animated && unlocked && rarity === 'mythic' ? 'animate-pulse' : ''}
      ${className}
    `}>
      {/* Main Icon */}
      {isImageIcon ? (
        <img 
          src={icon} 
          alt={title}
          className="w-full h-full object-cover rounded-xl"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`
          ${unlocked ? 'drop-shadow-lg' : 'text-gray-600'}
          ${animated && unlocked && rarity === 'mythic' ? 'animate-bounce' : ''}
        `}>
          {unlocked ? displayIcon : '🔒'}
        </span>
      )}

      {/* Mythic Aura Effect */}
      {unlocked && rarity === 'mythic' && animated && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-cyan-500/20 animate-ping"></div>
      )}

      {/* Legendary Glow */}
      {unlocked && rarity === 'legendary' && animated && (
        <div className="absolute inset-0 rounded-2xl shadow-lg shadow-yellow-500/30 animate-pulse"></div>
      )}

      {/* New/Recent Indicator */}
      {unlocked && animated && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-bounce shadow-lg">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  )
}