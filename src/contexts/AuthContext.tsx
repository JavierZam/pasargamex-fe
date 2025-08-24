'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    setIsClient(true)
    let isMounted = true;
    
    const initAuth = () => {
      try {
        // Wait for localStorage to be ready
        if (typeof window === 'undefined') return;
        
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('auth_token')
        
        
        if (token && storedUser && isMounted) {
          // Set token in API client
          apiClient.setToken(token)
          
          try {
            // Parse stored user first
            const parsedUser = JSON.parse(storedUser)
            
            // Validate that we have essential user fields
            if (!parsedUser.username && !parsedUser.email && !parsedUser.id) {
              if (isMounted) {
                clearAuthData('invalid-user-data')
              }
              return
            }
            
            // Set user from storage immediately (for quick load) 
            if (isMounted) {
              setState({
                user: parsedUser,
                isLoading: false,
                isAuthenticated: true
              })
            }
            
          } catch (parseError) {
            console.error('Authentication parse error:', parseError)
            if (isMounted) {
              clearAuthData('parse-error')
            }
          }
        } else {
          if (isMounted) {
            setState(prev => ({ ...prev, isLoading: false }))
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error)
        if (isMounted) {
          clearAuthData('init-error')
        }
      }
    }

    // Multiple attempts to initialize auth
    initAuth()
    
    // Backup initialization after delay
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        initAuth()
      }
    }, 500)

    return () => {
      isMounted = false;
      clearTimeout(timeoutId)
    }
  }, [])

  const clearAuthData = useCallback((reason = 'unknown') => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    apiClient.setToken(null)
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await apiClient.login(email, password)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        
        // Extract token and user from response data
        let token, user;
        
        if (responseData.token && responseData.user) {
          // Direct token/user structure
          token = responseData.token;
          user = responseData.user;
        } else if (responseData.data && responseData.data.token && responseData.data.user) {
          // Nested structure
          token = responseData.data.token;
          user = responseData.data.user;
        } else if (responseData.username || responseData.email || responseData.id) {
          // responseData IS the user object directly (likely from a wrapper like {success: true, data: userData})
          token = responseData.token || responseData.access_token;
          user = responseData;
        } else {
          // Fallback - try to find user in any nested structure
          token = responseData.token || responseData.access_token;
          user = responseData.user || responseData;
        }
        
        // Ensure we have the essential user fields
        if (!user.username && !user.email && !user.id) {
          setState(prev => ({ ...prev, isLoading: false }))
          return { 
            success: false, 
            error: 'Invalid user data received from server' 
          }
        }
        
        // Store auth data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
        apiClient.setToken(token)
        
        setState({
          user: user,
          isLoading: false,
          isAuthenticated: true
        })
        
        return { success: true }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await apiClient.register(data)
      
      if (response.success) {
        const responseData = response.data as any
        
        if (responseData?.token && responseData?.user) {
          // Auto-login after registration
          localStorage.setItem('auth_token', responseData.token)
          localStorage.setItem('user', JSON.stringify(responseData.user))
          apiClient.setToken(responseData.token)
          
          setState({
            user: responseData.user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
        
        return { success: true }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
        return { 
          success: false, 
          error: response.error?.message || 'Registration failed' 
        }
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }
    }
  }, [])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.logout()
    } catch (error) {
      // Continue with logout even if server request fails
      console.error('Logout server request failed:', error)
    } finally {
      clearAuthData('user-logout')
    }
  }, [clearAuthData])

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return
    
    try {
      const response = await apiClient.getProfile()
      
      if (response.success && response.data) {
        const user = response.data as User
        localStorage.setItem('user', JSON.stringify(user))
        setState(prev => ({ ...prev, user }))
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      // Don't logout on refresh failure, token might still be valid
    }
  }, [state.isAuthenticated])

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(() => {
      refreshUser()
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshUser])

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for checking if user has specific role
export function useRole() {
  const { user } = useAuth()
  
  return {
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller' || user?.role === 'admin',
    isBuyer: user?.role === 'buyer' || user?.role === 'admin',
    isVerified: user?.verification_status === 'verified',
    role: user?.role
  }
}