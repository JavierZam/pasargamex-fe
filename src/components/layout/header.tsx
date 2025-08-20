'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import UserProfileDropdown from './UserProfileDropdown'
import LiveSearch from '@/components/ui/LiveSearch'
import { useAchievements } from '@/hooks/useAchievements'

export default function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { trackSecretTrigger } = useAchievements()

  const handleLogoClick = () => {
    trackSecretTrigger('logo_clicks')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group" onClick={handleLogoClick}>
              <div className="bg-gradient-to-r from-brand-red to-brand-blue p-2.5 rounded-2xl group-hover:shadow-lg group-hover:shadow-brand-red/30 transition-all duration-300 group-hover:scale-105">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="font-gaming text-2xl font-bold group-hover:scale-105 transition-transform duration-300">
                <span className="text-brand-red drop-shadow-lg">PASAR</span>
                <span className="text-brand-blue drop-shadow-lg">GAMEX</span>
              </div>
            </Link>
          </div>

          {/* Center Search - Hero Element */}
          <div className="hidden md:flex flex-1 max-w-xl mx-12">
            <LiveSearch 
              placeholder="🎮 Search games, accounts, sellers..." 
              className="w-full"
            />
          </div>

          {/* Right Section - Minimal */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link
                href="/wishlist"
                className="relative group p-3 rounded-2xl bg-gray-800/40 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300"
                title="Wishlist"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">
                  3
                </div>
              </Link>

              <Link
                href="/messages"
                className="relative group p-3 rounded-2xl bg-gray-800/40 hover:bg-green-500/20 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
                title="Messages"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg">
                  2
                </div>
              </Link>
            </div>

            {/* Sell Button */}
            <Link href="/seller/create-product">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-green-500/30 hover:scale-105">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sell
              </Button>
            </Link>

            {/* Profile */}
            <UserProfileDropdown />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
              title="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <Link href="/seller/create-product">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-2xl text-sm font-medium shadow-lg hover:shadow-green-500/30 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>


        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-[60]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-semibold">Search</h2>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6m0 12L6 6" />
                  </svg>
                </button>
              </div>
              <LiveSearch 
                placeholder="Search games, accounts, sellers..." 
                className="w-full"
                showRecentSearches={true}
              />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}