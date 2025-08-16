'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackToHome?: boolean
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle,
  showBackToHome = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-red rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-blue rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Back Link */}
        <div className="text-center mb-8">
          {showBackToHome && (
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          )}
          
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-gaming">
              <span className="text-brand-red">PASAR</span>
              <span className="text-brand-blue">GAME</span>
              <span className="text-white">X</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mt-2 rounded-full" />
          </div>
          
          {/* Title & Subtitle */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Auth Card */}
        <Card variant="gaming" padding="xl" className="shadow-2xl">
          {children}
        </Card>

        {/* Additional Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-brand-red hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-red hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Verified Platform</span>
          </div>
        </div>
      </div>
    </div>
  )
}