'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement'
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement'
  title: string
  message: string
  duration?: number
}

// Global toast manager
class ToastManager {
  private toasts: ToastData[] = []
  private listeners: ((toasts: ToastData[]) => void)[] = []

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  add(toast: Omit<ToastData, 'id'>) {
    const id = Date.now().toString()
    const newToast: ToastData = { ...toast, id }
    this.toasts.push(newToast)
    this.notify()

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, toast.duration || 5000)

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  clear() {
    this.toasts = []
    this.notify()
  }
}

export const toastManager = new ToastManager()

// Toast component
function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    
    // Progress animation
    const startTime = Date.now()
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(progressTimer)
      }
    }, 50)

    // Auto hide
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearInterval(progressTimer)
    }
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50 text-green-100'
      case 'error':
        return 'bg-red-900/90 border-red-500/50 text-red-100'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100'
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50 text-blue-100'
      case 'achievement':
        return 'bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-500/50 text-purple-100'
      default:
        return 'bg-gray-900/90 border-gray-500/50 text-gray-100'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'achievement': return '🏆'
      default: return '📢'
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      case 'achievement': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div 
      className={`
        relative max-w-sm w-full p-4 rounded-lg border backdrop-blur-sm shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getTypeStyles()}
        ${type === 'achievement' ? 'animate-pulse' : ''}
      `}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        ×
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold mb-1">
            {title}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Achievement special effects */}
      {type === 'achievement' && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute -top-2 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-300" />
          <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-600" />
        </>
      )}
    </div>
  )
}

// Toast container
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  const handleClose = (id: string) => {
    toastManager.remove(id)
  }

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={handleClose}
          />
        </div>
      ))}
    </div>,
    document.body
  )
}

// Helper functions for easy usage
export const toast = {
  success: (title: string, message: string, duration?: number) =>
    toastManager.add({ type: 'success', title, message, duration }),
  
  error: (title: string, message: string, duration?: number) =>
    toastManager.add({ type: 'error', title, message, duration }),
  
  warning: (title: string, message: string, duration?: number) =>
    toastManager.add({ type: 'warning', title, message, duration }),
  
  info: (title: string, message: string, duration?: number) =>
    toastManager.add({ type: 'info', title, message, duration }),
  
  achievement: (title: string, message: string, duration = 7000) =>
    toastManager.add({ type: 'achievement', title, message, duration }),
}