'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import UserProfileDropdown from './UserProfileDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="font-gaming text-xl font-bold">
                <span className="text-brand-red">PASAR</span>
                <span className="text-brand-blue">GAMEX</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/products"
                className="text-gray-300 hover:text-brand-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-300 hover:text-brand-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/sell"
                className="text-gray-300 hover:text-brand-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sell
              </Link>
              <Link
                href="/support"
                className="text-gray-300 hover:text-brand-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Support
              </Link>
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <UserProfileDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700 mt-4">
              <Link
                href="/products"
                className="text-gray-300 hover:text-brand-red block px-3 py-2 rounded-md text-base font-medium"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-300 hover:text-brand-red block px-3 py-2 rounded-md text-base font-medium"
              >
                Categories
              </Link>
              <Link
                href="/sell"
                className="text-gray-300 hover:text-brand-red block px-3 py-2 rounded-md text-base font-medium"
              >
                Sell
              </Link>
              <Link
                href="/support"
                className="text-gray-300 hover:text-brand-red block px-3 py-2 rounded-md text-base font-medium"
              >
                Support
              </Link>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="md:hidden">
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}