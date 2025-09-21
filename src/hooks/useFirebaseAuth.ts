'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '@/lib/firebase'
import { toast } from '@/components/ui/Toast'

interface UseFirebaseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  
  // Authentication methods
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  
  // Helper methods
  isAuthenticated: boolean
  userToken: string | null
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  
  // OAuth debouncing to prevent multiple simultaneous calls
  const oauthCallInProgress = useRef(false)
  const oauthDebounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        try {
          // Get fresh token (force refresh if expired)
          const token = await user.getIdToken(true)
          setUserToken(token)
          
          // Store auth data in localStorage for compatibility with existing code
          const userData = {
            id: user.uid,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          }
          
          localStorage.setItem('auth_token', token)
          localStorage.setItem('user', JSON.stringify(userData))
          
          console.log('🔥 Firebase OAuth - User data stored with fresh token:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            provider: user.providerData[0]?.providerId,
            tokenLength: token.length
          })
          
          // Debounced OAuth call to prevent race conditions
          if (oauthDebounceTimer.current) {
            clearTimeout(oauthDebounceTimer.current)
          }
          
          oauthDebounceTimer.current = setTimeout(async () => {
            // Only make OAuth call if none is in progress
            if (oauthCallInProgress.current) {
              console.log('🚫 OAuth call already in progress, skipping...')
              return
            }
            
            oauthCallInProgress.current = true
            
            try {
              console.log('🔄 Making debounced OAuth call...')
              const response = await fetch('http://localhost:8080/v1/auth/oauth', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              
              if (response.ok) {
                const data = await response.json()
                console.log('✅ OAuth backend user updated:', data)
              } else {
                console.log('⚠️ OAuth backend update failed, but continuing with Firebase auth')
              }
            } catch (error) {
              console.log('⚠️ OAuth backend call failed, but continuing with Firebase auth:', error)
            } finally {
              oauthCallInProgress.current = false
            }
          }, 10000) // 10 second debounce to prevent OAuth spam
        } catch (err) {
          console.error('Error getting user token:', err)
        }
      } else {
        setUserToken(null)
        // Clear auth data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        console.log('🔥 Firebase user signed out')
      }
    })

    return () => {
      unsubscribe()
      // Clean up debounce timer
      if (oauthDebounceTimer.current) {
        clearTimeout(oauthDebounceTimer.current)
      }
    }
  }, [])

  // Auto-refresh token every 50 minutes (Firebase tokens expire after 1 hour)
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null
    
    if (user) {
      refreshInterval = setInterval(async () => {
        try {
          console.log('🔄 Refreshing Firebase token...')
          const freshToken = await user.getIdToken(true)
          setUserToken(freshToken)
          localStorage.setItem('auth_token', freshToken)
          console.log('✅ Token refreshed successfully')
        } catch (error) {
          console.error('❌ Failed to refresh token:', error)
        }
      }, 50 * 60 * 1000) // 50 minutes
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [user])

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await signInWithPopup(auth, googleProvider)
      toast.success('Welcome!', `Signed in as ${result.user.displayName}`)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with Google'
      setError(errorMessage)
      toast.error('Sign In Failed', errorMessage)
      console.error('Google sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await signInWithPopup(auth, facebookProvider)
      toast.success('Welcome!', `Signed in as ${result.user.displayName}`)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with Facebook'
      setError(errorMessage)
      toast.error('Sign In Failed', errorMessage)
      console.error('Facebook sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome!', `Signed in as ${result.user.email}`)
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      toast.error('Sign In Failed', errorMessage)
      console.error('Email sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      
      toast.success('Account Created!', `Welcome to PasargameX, ${displayName || email}`)
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      toast.error('Sign Up Failed', errorMessage)
      console.error('Email sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth)
      toast.info('Goodbye!', 'You have been signed out')
    } catch (err: any) {
      console.error('Sign out error:', err)
      toast.error('Sign Out Failed', 'An error occurred while signing out')
    }
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    logout,
    isAuthenticated: !!user,
    userToken
  }
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled'
    case 'auth/cancelled-popup-request':
      return 'Sign in was cancelled'
    default:
      return 'An error occurred during authentication'
  }
}