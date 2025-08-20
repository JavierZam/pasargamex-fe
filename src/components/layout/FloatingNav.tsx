'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAchievements } from '@/hooks/useAchievements'

interface NavItem {
  id: string
  label: string
  href: string
  icon: JSX.Element
  badge?: number
  color?: string
}

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { trackSecretTrigger } = useAchievements()
  const previousPathname = useRef(pathname)

  const handleFloatingButtonClick = () => {
    setIsOpen(!isOpen)
    trackSecretTrigger('floating_button_clicks')
  }

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close menu when route changes and track navigation patterns
  useEffect(() => {
    setIsOpen(false)
    
    // Track the "No One Text You Yet" achievement
    if (previousPathname.current && pathname) {
      const prev = previousPathname.current
      const current = pathname
      
      // Check for chat <-> dashboard switching
      if ((prev === '/messages' && current === '/dashboard') || 
          (prev === '/dashboard' && current === '/messages')) {
        trackSecretTrigger('chat_dashboard_switch')
      }
    }
    
    previousPathname.current = pathname
  }, [pathname, trackSecretTrigger])

  const navItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse Products',
      href: '/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'categories',
      label: 'Categories',
      href: '/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: 'compare',
      label: 'Compare',
      href: '/compare',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'orange'
    },
    {
      id: 'orders',
      label: 'My Orders',
      href: '/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'indigo'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'seller-dashboard',
      label: 'Seller Hub',
      href: '/seller/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'emerald'
    }
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30',
      purple: isActive ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30',
      orange: isActive ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30',
      indigo: isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30',
      green: isActive ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30',
      emerald: isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30',
      red: isActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className={`fixed bottom-8 right-8 z-40 transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handleFloatingButtonClick}
          className={`group relative w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-red to-brand-blue shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
            isOpen ? 'rotate-45 scale-110 shadow-2xl shadow-brand-red/30' : 'hover:scale-110'
          }`}
        >
          <svg 
            className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-red to-brand-blue opacity-30 animate-ping"></div>
        </button>

        {/* Quick Access Badge */}
        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
          ✨
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu Panel */}
      <div 
        className={`fixed bottom-28 right-8 z-40 transition-all duration-500 transform ${
          isOpen 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
            <div>
              <h3 className="text-white font-semibold text-lg">Quick Navigation</h3>
              <p className="text-gray-400 text-sm">Access all features</p>
            </div>
            <div className="bg-gradient-to-r from-brand-red to-brand-blue p-2 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/products' && pathname.startsWith('/products')) ||
                (item.href === '/seller/dashboard' && pathname.startsWith('/seller'))
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${
                    isActive 
                      ? `${getColorClasses(item.color || 'blue', true)} border-l-4` 
                      : `text-gray-400 border-gray-700/30 ${getColorClasses(item.color || 'blue', false)} border-transparent`
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? `bg-${item.color}-500/20` 
                      : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.badge && (
                      <div className="text-xs text-gray-500 mt-0.5">{item.badge} new</div>
                    )}
                  </div>
                  <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-gray-700/50 space-y-2">
            <Link
              href="/support"
              className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v18m9-9H3" />
              </svg>
              <span className="text-sm font-medium">Support Center</span>
            </Link>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">Close Menu</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}