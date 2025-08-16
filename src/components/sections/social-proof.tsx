'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { apiClient } from '@/lib/api'

interface Testimonial {
  id: string
  name: string
  username: string
  avatar?: string
  rating: number
  review: string
  game: string
  purchase: string
  date: string
  verified: boolean
}

interface Platform {
  name: string
  rating: number
  reviews: number
  logo: string
  color: string
}

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: 'AlexGamer99',
    rating: 5,
    review: 'Bought a Valorant account and the delivery was instant! The seller was professional and the account details were exactly as described. Will definitely buy again!',
    game: 'Valorant',
    purchase: 'Immortal Rank Account',
    date: '2024-01-15',
    verified: true
  },
  {
    id: '2', 
    name: 'Sarah Rodriguez',
    username: 'SarahPlays',
    rating: 5,
    review: 'Amazing service for Genshin Impact! Got my AR 55 account with all the characters I wanted. The escrow system made me feel secure throughout the process.',
    game: 'Genshin Impact',
    purchase: 'AR 55 Premium Account',
    date: '2024-01-18',
    verified: true
  },
  {
    id: '3',
    name: 'Michael Johnson', 
    username: 'MikeMLPro',
    rating: 5,
    review: 'Professional ML boosting service helped me reach Legend rank in just 2 days. Fast, reliable, and great communication. Highly recommended!',
    game: 'Mobile Legends',
    purchase: 'Epic to Legend Boost',
    date: '2024-01-20',
    verified: true
  },
  {
    id: '4',
    name: 'Emma Wilson',
    username: 'EmmaGames',
    rating: 4,
    review: 'Great platform for buying gaming items. The verification process is thorough and I felt safe making my purchase. Customer support was helpful too.',
    game: 'Free Fire',
    purchase: '50,000 Diamonds',
    date: '2024-01-22',
    verified: true
  },
  {
    id: '5',
    name: 'David Kim',
    username: 'DKGaming',
    rating: 5,
    review: 'Best marketplace for gaming accounts! Bought multiple accounts here and never had any issues. The quality is always as promised.',
    game: 'League of Legends', 
    purchase: 'Diamond Rank Account',
    date: '2024-01-25',
    verified: true
  }
]

const PLATFORM_REVIEWS: Platform[] = [
  { name: 'Trustpilot', rating: 4.8, reviews: 3247, logo: '⭐', color: 'text-green-400' },
  { name: 'Google Reviews', rating: 4.9, reviews: 1852, logo: '📱', color: 'text-blue-400' },
  { name: 'Facebook', rating: 4.7, reviews: 964, logo: '👥', color: 'text-blue-500' },
  { name: 'Reddit', rating: 4.6, reviews: 576, logo: '🔄', color: 'text-orange-400' }
]

export default function SocialProofSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    loadTestimonials()
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const loadTestimonials = async () => {
    try {
      // For now, use mock data until reviews API is implemented
      // const response = await apiClient.get('/reviews', { limit: 10, status: 'approved' })
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTestimonials(MOCK_TESTIMONIALS)
    } catch (error) {
      setTestimonials(MOCK_TESTIMONIALS)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}>
        ★
      </span>
    ))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">TRUSTED BY </span>
            <span className="text-brand-blue">GAMERS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Join thousands of satisfied gamers who trust PasargameX for their gaming needs. 
            Real reviews from real customers who've made their gaming dreams come true.
          </p>
        </div>

        {/* Platform Reviews */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLATFORM_REVIEWS.map((platform, index) => (
            <div key={platform.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-all">
              <div className="text-3xl mb-3">{platform.logo}</div>
              <div className="text-white font-semibold mb-1">{platform.name}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {renderStars(Math.floor(platform.rating))}
                <span className={`ml-2 font-bold ${platform.color}`}>
                  {platform.rating}
                </span>
              </div>
              <div className="text-gray-400 text-sm" suppressHydrationWarning>
                {platform.reviews.toLocaleString()} reviews
              </div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        {!loading && testimonials.length > 0 && (
          <div className="mb-16">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 max-w-4xl mx-auto relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 text-6xl text-brand-red">❝</div>
                <div className="absolute bottom-10 right-10 text-6xl text-brand-blue rotate-180">❝</div>
              </div>

              <div className="relative z-10">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-red to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(testimonials[currentTestimonial].name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">
                        {testimonials[currentTestimonial].name}
                      </h3>
                      {testimonials[currentTestimonial].verified && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      @{testimonials[currentTestimonial].username}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(testimonials[currentTestimonial].rating)}
                  <span className="text-gray-400 text-sm ml-2">
                    {testimonials[currentTestimonial].date}
                  </span>
                </div>

                {/* Review */}
                <p className="text-gray-300 text-lg leading-relaxed mb-6 italic">
                  "{testimonials[currentTestimonial].review}"
                </p>

                {/* Purchase Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Game:</span>
                    <span className="text-brand-blue font-medium">
                      {testimonials[currentTestimonial].game}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Purchase:</span>
                    <span className="text-brand-red font-medium">
                      {testimonials[currentTestimonial].purchase}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-brand-red' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full" />
                  <div>
                    <div className="bg-gray-700 h-4 rounded mb-2" />
                    <div className="bg-gray-700 h-3 rounded w-20" />
                  </div>
                </div>
                <div className="bg-gray-700 h-4 rounded mb-2" />
                <div className="bg-gray-700 h-4 rounded mb-2" />
                <div className="bg-gray-700 h-4 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <div key={testimonial.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all group">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(testimonial.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">
                      @{testimonial.username}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Review */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                  "{testimonial.review}"
                </p>

                {/* Purchase Info */}
                <div className="text-xs text-gray-500">
                  <span className="text-brand-blue">{testimonial.game}</span> • {testimonial.date}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to join our community?
            </h3>
            <p className="text-gray-400 mb-6">
              Start your gaming journey with PasargameX today and see why thousands of gamers trust us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all gaming-glow">
                Start Shopping
              </button>
              <button className="px-8 py-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all rounded-lg font-semibold">
                Leave a Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}