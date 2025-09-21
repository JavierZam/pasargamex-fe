'use client'

import { useState } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui'
import ProfileImage from '@/components/ui/ProfileImage'

export default function UserProfile() {
  const { user, logout, loading } = useFirebaseAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  // User profile loaded successfully

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
      >
        <ProfileImage 
          src={user.photoURL}
          alt={user.displayName || 'User'}
          fallbackText={user.displayName || user.email || 'U'}
          size="sm"
        />
        <span className="hidden sm:block text-sm font-medium">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)} 
          />
          
          {/* Dropdown Menu */}
          <Card className="absolute right-0 mt-2 w-64 bg-gray-800 border-gray-700 shadow-xl z-20">
            <CardContent className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-700">
                <ProfileImage 
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  fallbackText={user.displayName || user.email || 'U'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.displayName || 'Gaming Legend'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {user.email}
                  </p>
                  {user.emailVerified && (
                    <p className="text-green-400 text-xs flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </p>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-3 space-y-1">
                <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                
                <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Settings
                </button>
                
                <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Orders
                </button>
                
                <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Wallet
                </button>
              </div>

              {/* Sign Out */}
              <div className="pt-3 border-t border-gray-700">
                <Button
                  onClick={logout}
                  disabled={loading}
                  variant="outline"
                  className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}