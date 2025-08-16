'use client'

import { useState, useEffect, useRef } from 'react'
import GameCard3D from '@/components/ui/game-card-3d'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface GameTitle {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  banner?: string
  logo_url?: string
  background_url?: string
  character_url?: string
  total_products?: number
  categories?: string[]
  status?: string
  attributes?: Array<{
    name: string
    type: string
    required: boolean
    options?: string[]
    description?: string
  }>
  created_at: string
  updated_at: string
}

const mockGames: GameTitle[] = [
  {
    id: '1',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    description: 'Open-world action RPG',
    logo_url: '/api/placeholder-image?text=GI&width=200&height=200&bg=%23E6B800',
    background_url: '/api/placeholder-image?text=Genshin&width=400&height=300&bg=%235A3E8A',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%23A855F7',
    total_products: 1250,
    categories: ['Accounts', 'Items', 'Currency'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Honkai: Star Rail',
    slug: 'honkai-star-rail',
    description: 'Turn-based RPG',
    logo_url: '/api/placeholder-image?text=HSR&width=200&height=200&bg=%23EC4899',
    background_url: '/api/placeholder-image?text=HSR&width=400&height=300&bg=%23BE185D',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%23F472B6',
    total_products: 890,
    categories: ['Accounts', 'Currency', 'Boosting'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Valorant',
    slug: 'valorant',
    description: 'Tactical FPS',
    logo_url: '/api/placeholder-image?text=VAL&width=200&height=200&bg=%23EF4444',
    background_url: '/api/placeholder-image?text=Valorant&width=400&height=300&bg=%23DC2626',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%23F87171',
    total_products: 2100,
    categories: ['Accounts', 'Boosting', 'Skins'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '4',
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    description: 'MOBA Mobile Game',
    logo_url: '/api/placeholder-image?text=ML&width=200&height=200&bg=%233B82F6',
    background_url: '/api/placeholder-image?text=ML&width=400&height=300&bg=%231D4ED8',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%236366F1',
    total_products: 1680,
    categories: ['Accounts', 'Diamond', 'Boosting'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '5',
    name: 'Free Fire',
    slug: 'free-fire',
    description: 'Battle Royale Mobile',
    logo_url: '/api/placeholder-image?text=FF&width=200&height=200&bg=%2322C55E',
    background_url: '/api/placeholder-image?text=Free%20Fire&width=400&height=300&bg=%2316A34A',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%234ADE80',
    total_products: 950,
    categories: ['Accounts', 'Diamonds', 'Items'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '6',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    description: 'Battle Royale',
    logo_url: '/api/placeholder-image?text=PUBG&width=200&height=200&bg=%23F97316',
    background_url: '/api/placeholder-image?text=PUBG&width=400&height=300&bg=%23EA580C',
    character_url: '/api/placeholder-image?text=Char&width=300&height=400&bg=%23FB923C',
    total_products: 760,
    categories: ['Accounts', 'UC', 'Skins'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

const gameGlowColors = [
  'rgba(167, 139, 250, 0.6)', // Purple for Genshin
  'rgba(236, 72, 153, 0.6)',  // Pink for HSR
  'rgba(239, 68, 68, 0.6)',   // Red for Valorant
  'rgba(59, 130, 246, 0.6)',  // Blue for ML
  'rgba(34, 197, 94, 0.6)',   // Green for FF
  'rgba(249, 115, 22, 0.6)'   // Orange for PUBG
]

export default function TopGamesSection() {
  const [games, setGames] = useState<GameTitle[]>(mockGames)
  const [loading, setLoading] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [scrollDirection, setScrollDirection] = useState(1) // 1 = right, -1 = left
  const [scrollSpeed, setScrollSpeed] = useState(1) // Base speed multiplier
  const [isUserControlling, setIsUserControlling] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Fetch real games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        // Try to get real data from API using the proper method
        const response = await apiClient.getGameTitles({ limit: 6, status: 'active' })
        if (response.success && response.data) {
          // Handle both array format and paginated format
          const items = Array.isArray(response.data) ? response.data : (response.data as any).items || []
          
          if (items.length > 0) {
            // Map API response to our interface and fetch product counts
            const apiGames: GameTitle[] = await Promise.all(
              items.map(async (game: any) => {
                // Fetch product count for each game
                const productCount = await apiClient.getProductCount(game.id)
                
                return {
                  id: game.id,
                  name: game.name,
                  slug: game.slug,
                  description: game.description || '',
                  icon: game.icon,
                  banner: game.banner,
                  logo_url: game.icon || game.logo_url, // Use icon as fallback for logo_url
                  background_url: game.banner || game.background_url, // Use banner as fallback
                  character_url: game.character_url || game.banner,
                  total_products: productCount,
                  categories: game.categories || [],
                  status: game.status,
                  attributes: game.attributes || [],
                  created_at: game.created_at,
                  updated_at: game.updated_at
                }
              })
            )
            
            console.log(`✅ Loaded ${apiGames.length} games from API with product counts`)
            setGames(apiGames)
          } else {
            console.log('📝 No games found in API, using mock data')
            setGames(mockGames)
          }
        } else {
          console.log('📝 API response invalid, using mock data')
          setGames(mockGames)
        }
      } catch (error) {
        console.log('📝 API error, using mock data:', error)
        // Keep using mock data as fallback
        setGames(mockGames)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Handle mouse wheel control for carousel
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      // Scroll up = faster right direction, Scroll down = left direction
      if (e.deltaY > 0) {
        // Scroll down = go left
        setScrollDirection(-1)
        setScrollSpeed(4) // Moderate speed for left
      } else {
        // Scroll up = go right faster
        setScrollDirection(1) 
        setScrollSpeed(6) // Faster for right
      }
      
      setIsUserControlling(true)
      
      // Clear existing timeout
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current)
      }
      
      // Reset to default after 2 seconds of no interaction
      userTimeoutRef.current = setTimeout(() => {
        setScrollDirection(1) // Default right
        setScrollSpeed(1) // Default speed
        setIsUserControlling(false)
      }, 2000)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      carousel.dataset.startX = touch.clientX.toString()
      setIsUserControlling(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const startX = parseFloat(carousel.dataset.startX || '0')
      const deltaX = touch.clientX - startX
      
      if (Math.abs(deltaX) > 10) { // Minimum swipe threshold
        if (deltaX > 0) {
          // Swipe right = go left (reverse logic for natural feel)
          setScrollDirection(-1)
          setScrollSpeed(4)
        } else {
          // Swipe left = go right
          setScrollDirection(1)
          setScrollSpeed(4)
        }
      }
    }

    const handleTouchEnd = () => {
      // Reset to default after 2 seconds
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current)
      }
      
      userTimeoutRef.current = setTimeout(() => {
        setScrollDirection(1)
        setScrollSpeed(1)
        setIsUserControlling(false)
      }, 2000)
    }

    carousel.addEventListener('wheel', handleWheel, { passive: false })
    carousel.addEventListener('touchstart', handleTouchStart, { passive: false })
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false })
    carousel.addEventListener('touchend', handleTouchEnd)

    return () => {
      carousel.removeEventListener('wheel', handleWheel)
      carousel.removeEventListener('touchstart', handleTouchStart)
      carousel.removeEventListener('touchmove', handleTouchMove)
      carousel.removeEventListener('touchend', handleTouchEnd)
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current)
      }
    }
  }, [])

  // Seamless infinite scroll animation with slower default speed
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const cardWidth = 320 // 280px card + 40px gap
        const totalWidth = games.length * cardWidth
        
        // Slower base movement speed (0.5px per frame = 30px/second)
        const baseSpeed = 0.5
        const moveAmount = scrollDirection * (baseSpeed * scrollSpeed)
        let newPosition = prev + moveAmount
        
        // Seamless loop without blinking - using modulo for smoother transitions
        if (newPosition >= totalWidth) {
          newPosition = 0
        } else if (newPosition < 0) {
          newPosition = totalWidth - Math.abs(newPosition)
        }
        
        return newPosition
      })
    }, 16) // 60fps for buttery smooth animation

    return () => clearInterval(interval)
  }, [scrollDirection, scrollSpeed, games.length])

  const handleGameClick = (game: GameTitle) => {
    router.push(`/browse?game=${game.slug}`)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white font-gaming mb-4">
              <span className="text-brand-red">TOP </span>
              <span className="text-brand-blue">GAMES</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Hover over the cards to see amazing 3D effects and explore the most popular games
            </p>
          </div>
          
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 justify-items-center">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-64 h-80 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">TOP </span>
            <span className="text-brand-blue">GAMES</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hover over the cards to see amazing 3D effects and explore the most popular games
          </p>
        </div>

        {/* Games Carousel */}
        <div className="relative overflow-hidden py-4 carousel-container">
          <div 
            ref={carouselRef}
            className="flex gap-8 justify-start carousel-track"
            style={{ 
              paddingTop: '60px', 
              paddingBottom: '60px',
              transform: `translate3d(-${scrollPosition}px, 0, 0)`,
              width: `${games.length * 3 * 320}px`, // Triple the games for seamless loop
              transition: 'none' // Disable CSS transitions for smooth manual control
            }}
          >
            {/* Triple the games array for seamless infinite loop */}
            {[...games, ...games, ...games].map((game, index) => (
              <div key={`${game.id}-${index}`} className="flex-shrink-0" style={{ overflow: 'visible', width: '280px' }}>
                <GameCard3D
                  gameTitle={game}
                  glowColor={gameGlowColors[index % gameGlowColors.length]}
                  onClick={() => handleGameClick(game)}
                />
              </div>
            ))}
          </div>
          
          {/* Control indicators */}
          <div className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
            <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {isUserControlling ? '🎮 Manual control' : '🔄 Auto-scrolling'}
            </div>
          </div>
          
          {/* Scroll hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-50 hover:opacity-100 transition-opacity">
            <div className="text-white text-xs bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              Scroll with mouse wheel or touch to control • Auto resumes in 2s
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/browse')}
            className="bg-gradient-to-r from-brand-red to-brand-blue text-white px-8 py-3 rounded-lg font-semibold gaming-glow hover:scale-105 transition-all duration-300"
          >
            View All Games
          </button>
        </div>
      </div>
    </section>
  )
}