'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import AuthLayout from '@/components/layouts/AuthLayout'
import { PublicRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { isValidEmail, isValidPhone } from '@/lib/utils'

interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

interface RegisterErrors {
  username?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  agreeTerms?: string
  general?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {}

    // Username validation
    if (!form.username) {
      newErrors.username = 'Username is required'
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional but if provided must be valid)
    if (form.phone && !isValidPhone(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Terms agreement validation
    if (!form.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const registerData = {
        username: form.username,
        email: form.email,
        password: form.password,
        ...(form.phone && { phone: form.phone })
      }

      const result = await register(registerData)

      if (result.success) {
        // Registration successful, redirect to home or intended page
        router.push('/')
      } else {
        // Handle specific error messages
        const errorMessage = result.error || 'Registration failed. Please try again.'
        
        if (errorMessage.includes('username')) {
          setErrors({ username: 'This username is already taken' })
        } else if (errorMessage.includes('email')) {
          setErrors({ email: 'This email is already registered' })
        } else {
          setErrors({ general: errorMessage })
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({
        general: error.message || 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RegisterForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <PublicRoute>
      <AuthLayout 
        title="Create Account"
        subtitle="Join the PasargameX community today"
      >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Username Field */}
        <Input
          type="text"
          label="Username"
          placeholder="Choose a username"
          value={form.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          error={errors.username}
          helperText="3+ characters, letters, numbers, and underscores only"
          required
          fullWidth
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Email Field */}
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
          fullWidth
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Phone Field */}
        <Input
          type="tel"
          label="Phone Number (Optional)"
          placeholder="+62 812-3456-7890"
          value={form.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          helperText="For account verification and support"
          fullWidth
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />

        {/* Password Field */}
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          helperText="8+ characters with uppercase, lowercase, and numbers"
          required
          fullWidth
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
          iconPosition="right"
        />

        {/* Confirm Password Field */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
          fullWidth
          icon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
          iconPosition="right"
        />

        {/* Terms Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={form.agreeTerms}
            onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
            className="w-4 h-4 mt-0.5 text-brand-red bg-gray-700 border-gray-600 rounded focus:ring-brand-red focus:ring-2"
          />
          <label htmlFor="agreeTerms" className="text-sm text-gray-300 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-red hover:underline" target="_blank">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-red hover:underline" target="_blank">
              Privacy Policy
            </Link>
            . I understand that PasargameX provides a marketplace for gaming services.
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>
        )}

        {/* Register Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          gaming
          loading={isLoading}
        >
          Create Account
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-brand-blue hover:text-blue-400 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
      </AuthLayout>
    </PublicRoute>
  )
}