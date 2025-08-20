'use client'

import Image from 'next/image'
import Link from 'next/link'
import TopGamesSection from '@/components/sections/top-games'
import FeaturedProductsSection from '@/components/sections/featured-products'
import LiveStatsSection from '@/components/sections/live-stats'
import GameCategoriesSection from '@/components/sections/game-categories'
import SocialProofSection from '@/components/sections/social-proof'
import TrustElementsSection from '@/components/sections/trust-elements'
import FAQSection from '@/components/sections/faq'
import QuickNavigationSection from '@/components/sections/QuickNavigation'
import GamificationSection from '@/components/sections/GamificationSection'
import { PriceDisplay } from '@/components/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">

      {/* Hero Section with Product Showcase */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Main Logo - Only Here */}
              <div className="mb-8">
                <div className="font-gaming text-4xl lg:text-5xl font-black tracking-wider">
                  <div className="relative inline-block">
                    <span className="text-brand-red drop-shadow-lg">PASAR</span>
                    <span className="text-brand-blue drop-shadow-lg">GAMEX</span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-brand-blue opacity-20 blur-xl"></div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                The Ultimate{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue">
                  Gaming Marketplace
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Buy, sell, and trade gaming accounts, in-game items, and professional boosting services. 
                Secure transactions with escrow protection and 24/7 support.
              </p>
              
              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-brand-red">12K+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-blue">5K+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
              
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/products"
                  className="bg-gradient-to-r from-brand-red to-brand-blue px-8 py-4 text-sm font-semibold text-white shadow-sm hover:shadow-lg gaming-glow rounded-lg transition-all"
                >
                  Start Shopping
                </Link>
                <Link
                  href="/sell" 
                  className="border-2 border-gray-600 px-8 py-4 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-all rounded-lg"
                >
                  Start Selling
                </Link>
              </div>
            </div>

            {/* Right: Product Preview */}
            <div className="relative">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 font-gaming">
                  <span className="text-brand-red">HOT</span> <span className="text-brand-blue">DEALS</span>
                </h3>
                
                {/* Sample Products */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-xl font-bold">
                      🎮
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Genshin Impact Account</div>
                      <div className="text-sm text-gray-400">AR 60 • 5-Star Characters</div>
                    </div>
                    <div className="text-brand-red font-bold">
                      <PriceDisplay basePrice={4750000} size="sm" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-xl font-bold">
                      ⚡
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Valorant Account</div>
                      <div className="text-sm text-gray-400">Immortal Rank • Rare Skins</div>
                    </div>
                    <div className="text-brand-blue font-bold">
                      <PriceDisplay basePrice={2375000} size="sm" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xl font-bold">
                      🏆
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">ML Boosting Service</div>
                      <div className="text-sm text-gray-400">Epic to Legend • Fast</div>
                    </div>
                    <div className="text-brand-red font-bold">
                      <PriceDisplay basePrice={395000} size="sm" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Link href="/products" className="text-sm text-brand-blue hover:text-white transition-colors">
                    View All Products →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-red gaming-glow">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <dt className="text-base font-semibold leading-7 text-white">Secure Escrow</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-300">
                  Protected transactions with our secure escrow system. Your money is safe until delivery is confirmed.
                </dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-blue gaming-glow">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <dt className="text-base font-semibold leading-7 text-white">Instant Delivery</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-300">
                  Get your gaming accounts and items delivered instantly after payment confirmation.
                </dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-brand-red to-brand-blue gaming-glow">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v18m9-9H3" />
                  </svg>
                </div>
                <dt className="text-base font-semibold leading-7 text-white">24/7 Support</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-300">
                  Our dedicated support team is available around the clock to help resolve any issues.
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Enhanced Gaming Background with Multiple Layers */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Main Gaming Background */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25" 
               style={{ backgroundImage: 'url("https://storage.googleapis.com/pasargamex-assets-dev/public/test-folder/ec8ba461-4a68-43a1-a9fa-2403ff867740-15856841901692765675%20(1).jpg")' }} />
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-gray-900/75 to-black/85" />
          
          {/* Animated gaming particles */}
          <div className="absolute left-[calc(50%-4rem)] top-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)] animate-pulse">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-brand-red to-brand-blue opacity-8" />
          </div>
          
          {/* Interactive floating elements */}
          <div className="absolute right-10 bottom-20 w-32 h-32 bg-brand-blue opacity-10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute left-20 top-1/2 w-24 h-24 bg-brand-red opacity-10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute right-1/3 top-1/4 w-16 h-16 bg-purple-500 opacity-8 rounded-full blur-lg animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Gaming character silhouettes using local assets */}
          <div className="absolute right-0 bottom-0 w-80 h-80 opacity-15">
            <Image 
              src="/images/[CITYPNG.COM]HD Valorant Game Omen Character Player PNG - 2000x2000.png" 
              alt="Gaming Character"
              width={320}
              height={320}
              className="object-contain filter grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          
          <div className="absolute left-0 top-1/3 w-72 h-72 opacity-10">
            <Image 
              src="/images/[CITYPNG.COM]HD Razor Genshin Impact Character PNG - 3500x3500.png" 
              alt="Gaming Character"
              width={288}
              height={288}
              className="object-contain filter grayscale"
            />
          </div>
        </div>
      </main>

      {/* Quick Navigation Section */}
      <QuickNavigationSection />

      {/* Gamification Section */}
      <GamificationSection />

      {/* Top Games Section with 3D Cards */}
      <TopGamesSection />

      {/* Live Statistics Section */}
      <LiveStatsSection />

      {/* Game Categories Section */}
      <GameCategoriesSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Trust Elements Section */}
      <TrustElementsSection />

      {/* FAQ Section */}
      <FAQSection />

    </div>
  )
}