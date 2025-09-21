'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProfileImageProps {
  src?: string | null
  alt: string
  fallbackText: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg', 
  lg: 'w-12 h-12 text-xl'
}

export default function ProfileImage({ 
  src, 
  alt, 
  fallbackText, 
  size = 'sm', 
  className = '' 
}: ProfileImageProps) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  // If no src or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-brand-red to-brand-blue flex items-center justify-center font-medium text-white shadow-lg gaming-glow`}>
        {fallbackText.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-700 relative gaming-glow`}>
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red to-brand-blue flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized // For external URLs like Google profile pics
        sizes="(max-width: 48px) 48px, 48px"
      />
    </div>
  )
}