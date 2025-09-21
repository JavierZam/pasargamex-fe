'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const router = useRouter()
  
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    loading,
    isAuthenticated
  } = useFirebaseAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'signin') {
      await signInWithEmail(email, password)
    } else {
      await signUpWithEmail(email, password, displayName)
    }
  }

  const handleGoogleAuth = async () => {
    await signInWithGoogle()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark-primary via-bg-dark-secondary to-bg-dark-primary flex items-center justify-center px-4">
      {/* Gaming Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 via-transparent to-brand-blue/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23DC2626%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M20%200v20h20V0z%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="relative max-w-md w-full bg-bg-dark-accent/90 backdrop-blur-xl border border-brand-red/20 rounded-2xl shadow-2xl overflow-hidden gaming-glow">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-red to-brand-blue text-center p-8 relative overflow-hidden">
          {/* Gaming pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22white%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <Link href="/" className="relative inline-block mb-4 group">
            <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 border border-white/20 gaming-glow">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </Link>
          
          <h1 className="relative text-3xl text-white font-bold mb-2 font-gaming drop-shadow-lg">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Join PasargameX'}
          </h1>
          <p className="relative text-white/90 text-sm">
            {activeTab === 'signin' 
              ? 'Sign in to access your gaming marketplace' 
              : 'Create an account to start trading gaming items'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 relative">
          {/* Google Sign In */}
          <button
            type="button"
            className="w-full h-12 bg-white/95 hover:bg-white text-gray-900 font-medium rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-brand-red/25 flex items-center justify-center disabled:opacity-50 group border border-white/20 gaming-glow-white"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </>
            ) : (
              'Continue with Google'
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brand-red/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-bg-dark-accent px-4 py-1 text-gray-300 font-gaming text-xs tracking-wider">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {activeTab === 'signup' && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 bg-bg-dark-secondary/80 border border-gray-600/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all duration-200 hover:border-brand-red/50"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-bg-dark-secondary/80 border border-gray-600/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all duration-200 hover:border-brand-red/50"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-bg-dark-secondary/80 border border-gray-600/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all duration-200 hover:border-brand-red/50"
              required
            />

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-brand-red to-brand-blue hover:from-brand-red/90 hover:to-brand-blue/90 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-brand-red/25 disabled:opacity-50 gaming-glow"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {activeTab === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                activeTab === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center py-4 border-t border-brand-red/20">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
              className="text-sm text-brand-blue hover:text-brand-blue-light font-medium transition-colors gaming-text-glow"
            >
              {activeTab === 'signin' 
                ? "Don't have an account? Create one" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to PasargameX
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}