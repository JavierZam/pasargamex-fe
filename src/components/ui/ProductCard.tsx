'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { PriceDisplay, StarRating } from '@/components/ui'
import { Badge } from '@/components/ui'
import WishlistButton from './WishlistButton'

interface ProductCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  rating?: number
  reviews?: number
  seller?: string
  seller_id?: string
  isNew?: boolean
  onClick?: () => void
}

export default function ProductCard({ 
  id, 
  title, 
  description, 
  price, 
  category, 
  image, 
  rating = 0, 
  reviews = 0, 
  seller = 'Unknown Seller', 
  seller_id,
  isNew = false, 
  onClick 
}: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const maxRotation = 8

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateXValue = (y - centerY) / centerY * -1
      const rotateYValue = (x - centerX) / centerX

      const finalRotateX = rotateXValue * maxRotation
      const finalRotateY = rotateYValue * maxRotation

      card.style.setProperty('--rotateX', `${finalRotateX}deg`)
      card.style.setProperty('--rotateY', `${finalRotateY}deg`)

      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      card.style.setProperty('--glare-x', `${glareX}%`)
      card.style.setProperty('--glare-y', `${glareY}%`)
      card.style.setProperty('--glare-opacity', '0.3')
    }

    const handleMouseLeave = () => {
      card.style.setProperty('--rotateX', '0deg')
      card.style.setProperty('--rotateY', '0deg')
      card.style.setProperty('--glare-opacity', '0')
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className="scene" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onClick={onClick}
        className="product-card bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl relative border border-gray-700/50 cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/20"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg))',
          transition: 'transform 0.1s ease-out'
        } as React.CSSProperties}
      >
        {/* Image Section */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {!imageError ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎮</div>
                <div className="text-gray-400 text-sm">Product Image</div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const currentUrl = new URL(window.location.href)
                const params = new URLSearchParams(currentUrl.search)
                const existingProducts = params.get('products')?.split(',') || []
                if (!existingProducts.includes(id)) {
                  const newProducts = [...existingProducts, id].slice(0, 4) // Max 4 products
                  window.open(`/compare?products=${newProducts.join(',')}`, '_blank')
                }
              }}
              className="bg-black/70 backdrop-blur-sm rounded-full p-2 hover:bg-brand-blue/70 transition-colors shadow-lg"
              title="Compare"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <WishlistButton
              productId={id}
              variant="icon"
              size="sm"
              className="shadow-lg"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="info" className="text-xs">{category}</Badge>
            {isNew && <Badge variant="danger" className="text-xs">NEW</Badge>}
          </div>

          {/* Price */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <PriceDisplay basePrice={price} size="sm" className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {description}
          </p>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={rating} size="sm" />
            <span className="text-gray-400 text-sm">({reviews})</span>
          </div>

          {/* Seller - Enhanced */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
                 onClick={(e) => {
                   e.stopPropagation();
                   if (seller_id) {
                     window.open(`/seller/${seller_id}`, '_blank');
                   }
                 }}>
              <div className="w-6 h-6 bg-gradient-to-br from-brand-red to-brand-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                {seller?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">@{seller}</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={4.5} size="sm" />
                  <span className="text-xs text-gray-400">(4.5)</span>
                </div>
              </div>
            </div>
            <div className="text-brand-red font-medium">
              View Details →
            </div>
          </div>
        </div>

        {/* Glare Effect */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)`,
            opacity: 'var(--glare-opacity, 0)',
            transition: 'opacity 0.1s ease-out'
          }}
        />

        {/* Gaming Border Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-red/20 to-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ 
               background: 'linear-gradient(45deg, var(--brand-red, #DC2626)/0.2, var(--brand-blue, #1E3A8A)/0.2)',
               padding: '1px',
               mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               maskComposite: 'subtract'
             }} 
        />
      </div>
    </div>
  )
}