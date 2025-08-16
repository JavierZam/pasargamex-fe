'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface GameCategory {
  id: string
  name: string
  slug: string
  description: string
  icon_url?: string
  product_count: number
  popular: boolean
  gradient: string
}

const MOCK_CATEGORIES: GameCategory[] = [
  {
    id: '1',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    description: 'Accounts, characters, and primogems',
    product_count: 1234,
    popular: true,
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    id: '2', 
    name: 'Valorant',
    slug: 'valorant',
    description: 'High-rank accounts and rare skins',
    product_count: 856,
    popular: true,
    gradient: 'from-red-500 to-pink-600'
  },
  {
    id: '3',
    name: 'Mobile Legends',
    slug: 'mobile-legends', 
    description: 'Rank boosting and diamond top-up',
    product_count: 742,
    popular: true,
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: '4',
    name: 'Free Fire',
    slug: 'free-fire',
    description: 'Diamond packages and elite accounts',
    product_count: 623,
    popular: false,
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: '5',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    description: 'UC purchases and account upgrades',
    product_count: 445,
    popular: false,
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    id: '6',
    name: 'League of Legends',
    slug: 'league-of-legends',
    description: 'RP, accounts, and skin collections',
    product_count: 387,
    popular: false,
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: '7',
    name: 'Honkai Star Rail',
    slug: 'honkai-star-rail',
    description: 'Characters and stellar jade packages',
    product_count: 298,
    popular: false,
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: '8',
    name: 'Apex Legends',
    slug: 'apex-legends',
    description: 'Ranked services and coin packages',
    product_count: 156,
    popular: false,
    gradient: 'from-orange-500 to-yellow-600'
  }
]

export default function GameCategoriesSection() {
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadGameCategories()
  }, [])

  const loadGameCategories = async () => {
    try {
      const response = await apiClient.getGameTitles({ limit: 20, status: 'active' })
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as any).items || []
        
        // Transform API data to match our category format
        const transformedCategories = items.map((item: any, index: number) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || 'Premium gaming services',
          icon_url: item.icon_url,
          product_count: Math.floor(Math.random() * 800) + 100, // Mock count
          popular: index < 3,
          gradient: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length]?.gradient || 'from-gray-500 to-gray-600'
        }))

        setCategories(transformedCategories.length > 0 ? transformedCategories : MOCK_CATEGORIES)
      } else {
        setCategories(MOCK_CATEGORIES)
      }
    } catch (error) {
      console.error('Error loading game categories:', error)
      setCategories(MOCK_CATEGORIES)
    } finally {
      setLoading(false)
    }
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 6)

  const CategoryCard = ({ category, index }: { category: GameCategory; index: number }) => (
    <Link 
      href={`/browse?game=${category.slug}`}
      className="group relative overflow-hidden rounded-xl bg-gray-800 hover:shadow-2xl transition-all duration-500 hover:scale-105"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      {/* Popular Badge */}
      {category.popular && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 text-xs bg-brand-red text-white rounded-full font-bold flex items-center gap-1">
            🔥 Hot
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Icon/Image */}
        <div className="mb-4 relative">
          {category.icon_url ? (
            <Image
              src={category.icon_url}
              alt={category.name}
              width={64}
              height={64}
              className="rounded-lg mx-auto group-hover:scale-110 transition-transform"
            />
          ) : (
            <div className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl text-white font-bold group-hover:scale-110 transition-transform`}>
              {category.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="text-center flex-1">
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-red transition-colors">
            {category.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {category.description}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Products</span>
            <span className="text-brand-blue font-semibold">
              {category.product_count.toLocaleString()}
            </span>
          </div>
          
          {/* Progress bar showing relative popularity */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full bg-gradient-to-r ${category.gradient} transition-all duration-1000 group-hover:w-full`}
              style={{ 
                width: `${Math.min(100, (category.product_count / Math.max(...categories.map(c => c.product_count))) * 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  )

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">GAME </span>
            <span className="text-brand-blue">CATEGORIES</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Browse by your favorite games. From mobile legends to PC masterpieces, 
            find exactly what you're looking for in our curated categories.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4" />
                <div className="bg-gray-700 h-4 rounded mb-2" />
                <div className="bg-gray-700 h-4 rounded w-2/3 mx-auto mb-4" />
                <div className="bg-gray-700 h-3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedCategories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>

            {/* Show More/Less Button */}
            {categories.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all rounded-lg font-semibold"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <svg className="w-5 h-5 ml-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      View All Categories
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Quick Navigation */}
        <div className="mt-16 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-400">
              Use our advanced search or browse all products to find exactly what you need
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="px-6 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all gaming-glow text-center"
            >
              Browse All Products
            </Link>
            <Link
              href="/search"
              className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all rounded-lg font-semibold text-center"
            >
              Advanced Search
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}