import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }
  
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    )
  }
  
  return (
    <div className={cn(
      'rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold',
      sizes[size],
      className
    )}>
      {fallback || '?'}
    </div>
  )
}

export default Avatar