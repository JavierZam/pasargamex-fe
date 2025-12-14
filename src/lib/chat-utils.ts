// Chat-specific utility functions
import { formatRelativeTime } from './utils'

/**
 * Format last seen time with special handling for chat contexts
 */
export function formatLastSeen(lastSeen?: string | null, fallbackDate?: string | null): string {
  const dateToUse = lastSeen || fallbackDate
  if (!dateToUse) return 'Long time ago'
  
  try {
    const date = new Date(dateToUse)
    if (isNaN(date.getTime())) return 'Long time ago'
    return formatRelativeTime(date)
  } catch {
    return 'Long time ago'
  }
}

/**
 * Validate if a URL is a valid avatar image URL
 */
export function isValidAvatarUrl(url?: string | null): boolean {
  if (!url) return false
  if (url.includes('Unknown')) return false
  if (url.includes('undefined')) return false
  if (url.includes('null')) return false
  if (!url.startsWith('http')) return false
  return true
}

/**
 * Truncate message content for preview
 */
export function truncateMessage(message: string | undefined, maxLength: number = 50): string {
  if (!message || message.trim() === '' || message.trim() === 'No Message') {
    return '💭 Ready to chat!'
  }
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

/**
 * Get message status icon based on status
 */
export function getMessageStatusIcon(status: string, isRead: boolean = false): string {
  switch (status) {
    case 'sending':
      return '⏳'
    case 'sent':
      return '✓'
    case 'delivered':
      return '✓✓'
    case 'read':
      return '✓✓' // Will be styled blue in component
    case 'failed':
      return '❌'
    default:
      return '✓'
  }
}

/**
 * Generate a temporary message ID for optimistic updates
 */
export function generateTempMessageId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if a message ID is a temporary/optimistic ID
 */
export function isTempMessageId(id: string): boolean {
  return id.startsWith('temp-')
}

/**
 * Get role badge color classes for participant roles
 */
export function getRoleBadgeClasses(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-gradient-to-r from-red-600/80 to-red-700/80 text-white border-red-400/50'
    case 'seller':
      return 'bg-gradient-to-r from-neon-green/30 to-green-500/30 text-neon-green border-neon-green/50'
    case 'middleman':
      return 'bg-gradient-to-r from-neon-yellow/30 to-yellow-500/30 text-neon-yellow border-neon-yellow/50'
    case 'buyer':
    default:
      return 'bg-gradient-to-r from-brand-blue/30 to-blue-500/30 text-brand-blue-light border-brand-blue/50'
  }
}

/**
 * Get role explanation text for tooltips
 */
export function getRoleExplanation(role: string): string {
  const explanations: Record<string, string> = {
    seller: '🛍️ Can list & sell products',
    buyer: '💳 Can purchase products',
    admin: '🛡️ System administrator',
    middleman: '👨‍💼 Transaction mediator'
  }
  return explanations[role] || role
}

/**
 * Sort chats by last message timestamp (newest first)
 */
export function sortChatsByLastMessage<T extends { last_message?: { timestamp?: string }; updated_at?: string; created_at?: string }>(
  chats: T[]
): T[] {
  return [...chats].sort((a, b) => {
    const aTime = a.last_message?.timestamp 
      ? new Date(a.last_message.timestamp).getTime() 
      : new Date(a.updated_at || a.created_at || 0).getTime()
    const bTime = b.last_message?.timestamp 
      ? new Date(b.last_message.timestamp).getTime() 
      : new Date(b.updated_at || b.created_at || 0).getTime()
    return bTime - aTime
  })
}

/**
 * Parse typing users from record to array of names
 */
export function getTypingUserNames(
  typingUsers: Record<string, string[]>, 
  chatId: string,
  currentUserId?: string
): string[] {
  const users = typingUsers[chatId] || []
  return users.filter(id => id !== currentUserId)
}
