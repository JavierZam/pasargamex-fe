// Complete Chat System Types - Refactored
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  sender_name: string
  content: string
  type: 'text' | 'image' | 'offer' | 'system'
  status: MessageStatus
  timestamp: string
  attachment_urls?: string[]
  metadata?: Record<string, any>
  
  // Optimistic message fields
  temp_id?: string
  is_optimistic?: boolean
  retry_count?: number
}

export interface UserPresence {
  user_id: string
  is_online: boolean
  last_seen: string
  last_activity: string
}

export interface ChatParticipant {
  user_id: string
  name: string
  username?: string
  avatar?: string
  role: 'buyer' | 'seller' | 'admin' | 'participant'
  joined_at?: string
  last_read_at?: string
}

export interface ChatRoom {
  id: string
  type: 'individual' | 'group' | 'product'
  participants: ChatParticipant[]
  last_message?: ChatMessage
  unread_count: number
  created_at: string
  updated_at: string
  product_id?: string
  
  // Computed fields
  other_participant?: ChatParticipant
  display_name?: string
  display_avatar?: string
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'presence' | 'read_receipt' | 'delivery_receipt'
  data: any
  timestamp: string
}

export interface TypingIndicator {
  chat_id: string
  user_id: string
  user_name: string
  typing: boolean
  expires_at: string
}

// WebSocket Events
export interface WSMessageEvent extends WebSocketMessage {
  type: 'message'
  data: ChatMessage
}

export interface WSTypingEvent extends WebSocketMessage {
  type: 'typing'
  data: TypingIndicator
}

export interface WSPresenceEvent extends WebSocketMessage {
  type: 'presence'
  data: UserPresence
}

export interface WSReadReceiptEvent extends WebSocketMessage {
  type: 'read_receipt'
  data: {
    chat_id: string
    message_id: string
    reader_id: string
    reader_name: string
  }
}

export interface WSDeliveryReceiptEvent extends WebSocketMessage {
  type: 'delivery_receipt'
  data: {
    chat_id: string
    message_id: string
    delivered_to: string
  }
}