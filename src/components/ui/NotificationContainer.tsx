'use client'

import React, { useEffect, useState } from 'react'
import { useNotifications, Notification } from '@/contexts/NotificationContext'

const NOTIFICATION_ICONS = {
  success: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const NOTIFICATION_STYLES = {
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
}

interface NotificationItemProps {
  notification: Notification
  onClose: (id: string) => void
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsRemoving(true)
    setTimeout(() => onClose(notification.id), 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-4
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div
        className={`
          max-w-md w-full bg-gray-800/95 backdrop-blur-sm border rounded-xl shadow-2xl overflow-hidden
          ${NOTIFICATION_STYLES[notification.type]}
        `}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${NOTIFICATION_STYLES[notification.type]} rounded-full p-1`}>
              {NOTIFICATION_ICONS[notification.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {notification.message}
              </p>
              
              {/* Action Button */}
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action?.onClick()
                    handleClose()
                  }}
                  className={`
                    mt-3 text-sm font-medium hover:underline transition-all
                    ${notification.type === 'success' ? 'text-green-400 hover:text-green-300' : 
                      notification.type === 'error' ? 'text-red-400 hover:text-red-300' :
                      notification.type === 'warning' ? 'text-yellow-400 hover:text-yellow-300' :
                      'text-blue-400 hover:text-blue-300'}
                  `}
                >
                  {notification.action.label} →
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar for timed notifications */}
        {notification.duration && notification.duration > 0 && (
          <div className="h-1 bg-gray-700">
            <div 
              className={`h-full transition-all ease-linear bg-gradient-to-r ${
                notification.type === 'success' ? 'from-green-500 to-green-400' :
                notification.type === 'error' ? 'from-red-500 to-red-400' :
                notification.type === 'warning' ? 'from-yellow-500 to-yellow-400' :
                'from-blue-500 to-blue-400'
              }`}
              style={{
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col items-end pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  )
}