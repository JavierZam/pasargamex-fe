'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface GameCard3DProps {
  gameTitle: {
    id: string
    name: string
    slug: string
    logo_url?: string
    background_url?: string
    character_url?: string
    icon?: string
    banner?: string
    total_products?: number
    categories?: string[]
  }
  glowColor?: string
  onClick?: () => void
}

export default function GameCard3D({ gameTitle, glowColor = 'rgba(220, 38, 38, 0.5)', onClick }: GameCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const imageWrapper = imageWrapperRef.current
    if (!card || !imageWrapper) return

    const maxRotation = 15

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      
      // Calculate cursor position relative to card
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Normalize cursor position from -1 to 1
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateXValue = (y - centerY) / centerY * -1
      const rotateYValue = (x - centerX) / centerX

      // Calculate final rotation values
      const finalRotateX = rotateXValue * maxRotation
      const finalRotateY = rotateYValue * maxRotation

      // Apply rotations using CSS custom properties
      card.style.setProperty('--rotateX', `${finalRotateX}deg`)
      card.style.setProperty('--rotateY', `${finalRotateY}deg`)

      // Update glare position
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      card.style.setProperty('--glare-x', `${glareX}%`)
      card.style.setProperty('--glare-y', `${glareY}%`)
      card.style.setProperty('--glare-opacity', '1')

      // Trigger balanced pop-out effect
      imageWrapper.style.setProperty('--image-scale', '1.15')
      imageWrapper.style.setProperty('--image-y', '-30px')
      imageWrapper.style.setProperty('--image-z', '120px')
    }

    const handleMouseLeave = () => {
      // Reset all properties
      card.style.setProperty('--rotateX', '0deg')
      card.style.setProperty('--rotateY', '0deg')
      card.style.setProperty('--glare-opacity', '0')
      
      imageWrapper.style.setProperty('--image-scale', '1')
      imageWrapper.style.setProperty('--image-y', '0px')
      imageWrapper.style.setProperty('--image-z', '60px')
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="scene" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onClick={onClick}
        className="game-card-3d bg-gray-800 rounded-xl shadow-2xl relative border-2 border-gray-700/50 flex flex-col justify-end items-center cursor-pointer group"
        style={{
          '--glow-color': glowColor,
          transformStyle: 'preserve-3d',
        } as React.CSSProperties}
      >
        {/* Background Image */}
        {(gameTitle.background_url || gameTitle.banner) && (
          <Image
            src={gameTitle.background_url || gameTitle.banner || ''}
            alt={`${gameTitle.name} Background`}
            fill
            className="card-background"
          />
        )}

        {/* Image Wrapper */}
        <div
          ref={imageWrapperRef}
          className="card-image-wrapper w-full h-full"
        >
          {/* Logo (visible by default) */}
          {(gameTitle.logo_url || gameTitle.icon) && (
            <Image
              src={gameTitle.logo_url || gameTitle.icon || ''}
              alt={`${gameTitle.name} Logo`}
              width={176}
              height={176}
              className="card-icon"
              quality={95}
              priority
            />
          )}

          {/* Character (visible on hover) */}
          {(gameTitle.character_url || gameTitle.background_url || gameTitle.banner) && (
            <Image
              src={gameTitle.character_url || gameTitle.background_url || gameTitle.banner || ''}
              alt={`${gameTitle.name} Character`}
              width={288}
              height={384}
              className="card-character"
              quality={95}
            />
          )}
        </div>

        {/* Content */}
        <div className="card-content text-center pb-6 z-10">
          <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
            {gameTitle.name}
          </h3>
          <p className="text-red-400 text-sm font-medium">
            {gameTitle.total_products || 0} Products Available
          </p>
          {gameTitle.categories && gameTitle.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {gameTitle.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Glare Effect */}
        <div className="card-glare" />

        {/* Gaming Border Effect */}
        <div className="absolute inset-0 rounded-xl gaming-border opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}