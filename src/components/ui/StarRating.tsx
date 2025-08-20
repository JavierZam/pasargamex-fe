'use client'

import React, { useState } from 'react'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  showValue?: boolean
  onChange?: (rating: number) => void
  className?: string
}

const sizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-5 h-5'
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

export default function StarRating({ 
  rating, 
  size = 'md', 
  readonly = true, 
  showValue = false,
  onChange,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [tempRating, setTempRating] = useState(rating)

  const displayRating = readonly ? rating : (hoverRating || tempRating)

  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      setTempRating(starRating)
      onChange(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= displayRating
          const isPartial = !readonly && starValue === Math.ceil(displayRating) && displayRating % 1 !== 0

          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              className={`
                ${sizes[size]} 
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                transition-all duration-200
                ${!readonly ? 'focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-opacity-50 rounded' : ''}
              `}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              aria-label={`Rate ${starValue} stars`}
            >
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className={`
                  ${isFilled 
                    ? 'text-yellow-400' 
                    : readonly 
                      ? 'text-gray-300' 
                      : 'text-gray-400 hover:text-yellow-300'
                  }
                  transition-colors duration-200
                `}
              >
                {isPartial ? (
                  <defs>
                    <linearGradient id={`gradient-${i}`}>
                      <stop offset={`${(displayRating % 1) * 100}%`} stopColor="currentColor" className="text-yellow-400" />
                      <stop offset={`${(displayRating % 1) * 100}%`} stopColor="currentColor" className="text-gray-300" />
                    </linearGradient>
                  </defs>
                ) : null}
                <path
                  fillRule="evenodd"
                  d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
                  clipRule="evenodd"
                  fill={isPartial ? `url(#gradient-${i})` : 'currentColor'}
                />
              </svg>
            </button>
          )
        })}
      </div>
      
      {showValue && (
        <span className={`${textSizes[size]} text-gray-400 ml-1`}>
          ({displayRating.toFixed(1)})
        </span>
      )}
    </div>
  )
}