'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth, useRole } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'admin' | 'seller' | 'buyer'
  requireVerified?: boolean
  fallbackPath?: string
  showLoading?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireRole,
  requireVerified = false,
  fallbackPath = '/login',
  showLoading = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { isAdmin, isSeller, isBuyer, isVerified, role } = useRole()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return // Wait for auth to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const loginUrl = `${fallbackPath}?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return
    }

    // If specific role is required
    if (requireRole && isAuthenticated) {
      let hasRequiredRole = false
      
      switch (requireRole) {
        case 'admin':
          hasRequiredRole = isAdmin
          break
        case 'seller':
          hasRequiredRole = isSeller
          break
        case 'buyer':
          hasRequiredRole = isBuyer
          break
      }

      if (!hasRequiredRole) {
        // Redirect based on user's actual role
        if (isAdmin) {
          router.push('/admin')
        } else if (isSeller) {
          router.push('/seller')
        } else {
          router.push('/dashboard')
        }
        return
      }
    }

    // If verification is required
    if (requireVerified && isAuthenticated && !isVerified) {
      router.push('/verify-account')
      return
    }
  }, [
    isLoading, 
    isAuthenticated, 
    requireAuth, 
    requireRole, 
    requireVerified, 
    isAdmin, 
    isSeller, 
    isBuyer, 
    isVerified, 
    router, 
    pathname, 
    fallbackPath
  ])

  // Show loading spinner while checking auth
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-brand-red mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if auth requirements are not met
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireRole && isAuthenticated) {
    let hasRequiredRole = false
    
    switch (requireRole) {
      case 'admin':
        hasRequiredRole = isAdmin
        break
      case 'seller':
        hasRequiredRole = isSeller
        break
      case 'buyer':
        hasRequiredRole = isBuyer
        break
    }

    if (!hasRequiredRole) {
      return null
    }
  }

  if (requireVerified && isAuthenticated && !isVerified) {
    return null
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Route-specific protection components
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="admin" fallbackPath="/login">
      {children}
    </ProtectedRoute>
  )
}

export function SellerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="seller" requireVerified fallbackPath="/login">
      {children}
    </ProtectedRoute>
  )
}

export function BuyerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="buyer" fallbackPath="/login">
      {children}
    </ProtectedRoute>
  )
}

// Public route (redirect authenticated users away)
export function PublicRoute({ 
  children, 
  redirectPath = '/' 
}: { 
  children: React.ReactNode
  redirectPath?: string 
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isLoading, isAuthenticated, router, redirectPath])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}