'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  // Helper methods
  showSuccess: (title: string, message: string, action?: Notification['action']) => void
  showError: (title: string, message: string, action?: Notification['action']) => void
  showWarning: (title: string, message: string, action?: Notification['action']) => void
  showInfo: (title: string, message: string, action?: Notification['action']) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Helper methods
  const showSuccess = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'success', title, message, action })
  }, [addNotification])

  const showError = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'error', title, message, action, duration: 8000 })
  }, [addNotification])

  const showWarning = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'warning', title, message, action })
  }, [addNotification])

  const showInfo = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'info', title, message, action })
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}