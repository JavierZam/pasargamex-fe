'use client'

import { toast } from '@/components/ui/Toast'
import { buildWsUrl } from '@/lib/config'

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  sender_name: string
  content: string
  type: 'text' | 'image' | 'system' | 'offer'
  attachment_urls?: string[]
  metadata?: Record<string, any>
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface ChatRoom {
  id: string
  participants: Array<{
    user_id: string
    name: string
    avatar?: string
    role: 'buyer' | 'seller' | 'admin'
  }>
  last_message?: ChatMessage
  unread_count: number
  created_at: string
  updated_at: string
  product_id?: string
}

export interface WSMessage {
  type: string
  chat_id?: string
  message?: ChatMessage
  data?: any
  timestamp?: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private token: string | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private pingInterval: NodeJS.Timeout | null = null
  
  // Rate limiting
  private lastMessageTime = 0
  private messageQueue: any[] = []
  private isProcessingQueue = false
  private lastTypingTime = 0
  private lastErrorToastTime = 0
  
  // Event listeners
  private messageHandlers: Set<(message: ChatMessage) => void> = new Set()
  private statusHandlers: Set<(connected: boolean) => void> = new Set()
  private typingHandlers: Set<(data: { chat_id: string, user_id: string, typing: boolean }) => void> = new Set()
  private chatUpdateHandlers: Set<(data: any) => void> = new Set()
  private readReceiptHandlers: Set<(data: { chat_id: string, message_id: string, reader_id: string }) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-connect when user logs in
      this.checkAuthStatus()
    }
  }

  private checkAuthStatus() {
    // Check localStorage for Firebase auth token (stored by useFirebaseAuth)
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('firebase-token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token')
    
    if (token) {
      this.setToken(token)
      console.log('🔌 Auth token found, ready to connect')
    } else {
      console.warn('⚠️ No auth token found in localStorage')
    }
  }

  setToken(token: string) {
    this.token = token
  }

  connect(): Promise<boolean> {
    console.log('🚀 [WebSocketService] connect() called')
    console.log('🔍 [WebSocketService] Current state:', {
      hasWs: !!this.ws,
      wsReadyState: this.ws?.readyState,
      hasToken: !!this.token,
      tokenLength: this.token?.length,
      isConnected: this.isConnected
    })
    
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('✅ [WebSocketService] WebSocket already connected')
        resolve(true)
        return
      }

      if (!this.token) {
        console.error('❌ [WebSocketService] No authentication token available')
        console.error('🔍 [WebSocketService] Token check details:', {
          token: this.token,
          typeof: typeof this.token,
          localStorage_keys: Object.keys(localStorage)
        })
        this.statusHandlers.forEach(handler => handler(false))
        reject(new Error('No authentication token'))
        return
      }
      
      // Validate token format
      if (typeof this.token !== 'string' || this.token.length < 10) {
        console.error('❌ Invalid token format')
        console.error('🔍 [WebSocketService] Token format details:', {
          token_type: typeof this.token,
          token_length: this.token?.length,
          token_preview: this.token?.substring(0, 20)
        })
        this.statusHandlers.forEach(handler => handler(false))
        reject(new Error('Invalid token format'))
        return
      }

      // Add timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        console.error('❌ WebSocket connection timeout')
        if (this.ws) {
          this.ws.close()
        }
        reject(new Error('Connection timeout'))
      }, 10000) // 10 second timeout

      try {
        // Use configured WebSocket URL
        console.log('🔑 Using token:', this.token?.substring(0, 20) + '...')
        
        const wsUrl = buildWsUrl(this.token)
        console.log('🔌 Creating WebSocket connection to:', wsUrl.split('?')[0])
        console.log('🔍 [WebSocketService] Full WebSocket URL (masked):', wsUrl.replace(/token=[^&]+/, 'token=***MASKED***'))
        console.log('🔍 [WebSocketService] About to create WebSocket object...')
        
        this.ws = new WebSocket(wsUrl)
        
        console.log('🔌 WebSocket object created, readyState:', this.ws.readyState)
        console.log('🔍 [WebSocketService] WebSocket constructor URL:', this.ws.url.replace(/token=[^&]+/, 'token=***MASKED***'))

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout) // Clear timeout on successful connection
          console.log('✅ [WebSocketService] WebSocket connected successfully!')
          console.log('🔔 [WebSocketService] Notifying', this.statusHandlers.size, 'status handlers')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          // Notify status handlers
          this.statusHandlers.forEach(handler => handler(true))
          
          // Start ping/pong for keepalive
          this.startPing()
          
          // Only show toast on first connection or reconnection
          if (this.reconnectAttempts > 0) {
            toast.success('Chat reconnected')
          }
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          try {
            const data: WSMessage = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected', { code: event.code, reason: event.reason })
          this.isConnected = false
          this.cleanup()
          
          // Notify listeners
          this.statusHandlers.forEach(handler => handler(false))
          
          // Only auto-reconnect if it wasn't a manual close (code 1000)
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
            
            // Exponential backoff for reconnection
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
            setTimeout(() => {
              if (!this.isConnected) { // Only reconnect if still not connected
                this.connect().catch(err => {
                  console.error('❌ Reconnection failed:', err)
                })
              }
            }, Math.min(delay, 30000)) // Max 30 second delay
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached')
            toast.error('Chat disconnected - please refresh')
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout) // Clear timeout on error
          console.error('❌ [WebSocketService] WebSocket error:', error)
          console.error('🔍 [WebSocketService] WebSocket state:', this.ws?.readyState)
          console.error('🔍 [WebSocketService] WebSocket URL:', wsUrl.split('?')[0])
          this.isConnected = false
          this.statusHandlers.forEach(handler => handler(false))
          reject(error)
        }

      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
    this.cleanup()
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    this.isConnected = false
  }

  private startPing() {
    // Removed ping functionality as backend doesn't support it
    // The WebSocket connection will be maintained by browser automatically
    console.log('ℹ️ Ping functionality disabled - backend does not support ping messages')
  }

  private handleMessage(data: WSMessage) {
    console.log('📨 Received:', data.type)

    switch (data.type) {
      case 'auth_success':
        console.log('✅ Chat authenticated successfully')
        break

      case 'auth_error':
        console.error('❌ Chat authentication failed')
        this.disconnect()
        break

      case 'message':
      case 'new_message':
        if (data.message || data.data) {
          const message = data.message || data.data
          this.messageHandlers.forEach(handler => handler(message!))
        }
        break

      case 'message_read_receipt':
        console.log('👁️ Message read receipt:', data.data)
        if (data.data) {
          this.readReceiptHandlers.forEach(handler => handler(data.data))
        }
        break

      case 'user_presence':
        console.log('🟢 User presence update:', data.data)
        this.chatUpdateHandlers.forEach(handler => handler(data))
        break

      case 'offer_update':
        console.log('💰 Offer update:', data.data)
        if (data.data?.status) {
          toast.info(`Offer ${data.data.status}!`)
        }
        this.chatUpdateHandlers.forEach(handler => handler(data))
        break

      case 'group_chat_created':
        console.log('👥 Group chat created:', data.data)
        this.chatUpdateHandlers.forEach(handler => handler(data))
        break

      case 'ping':
        // Send pong response
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'pong' }))
        }
        break

      case 'message_delivered':
      case 'message_sent':
      case 'message_status_update':
        // Handle message status updates
        if (data.message) {
          console.log('🔄 Message status update:', data.type, data.message.id)
          // Update message status based on event type
          const status = data.type === 'message_sent' ? 'sent' : 
                        data.type === 'message_delivered' ? 'delivered' : 
                        data.message.status || 'delivered'
          const updatedMessage = { ...data.message, status }
          this.messageHandlers.forEach(handler => handler(updatedMessage))
        } else if (data.data?.message_id && data.data?.status) {
          // Handle status update with just ID and status
          console.log('🔄 Message status update by ID:', data.data.message_id, data.data.status)
          const statusMessage = {
            id: data.data.message_id,
            status: data.data.status,
            timestamp: new Date().toISOString()
          } as any
          this.messageHandlers.forEach(handler => handler(statusMessage))
        }
        break

      case 'typing_indicator':
        if (data.data) {
          this.typingHandlers.forEach(handler => handler(data.data))
        }
        break

      case 'chat_updated':
      case 'user_joined':
      case 'user_left':
        this.chatUpdateHandlers.forEach(handler => handler(data))
        break

      case 'payment_status_update':
        // Handle payment updates from chat
        if (data.data) {
          toast.info('Payment status updated')
          this.chatUpdateHandlers.forEach(handler => handler(data))
        }
        break

      case 'pong':
        // Keep-alive response
        break

      case 'error':
        console.error('❌ WebSocket server error:', data.data)
        // Only show toast for critical errors, not unknown message types
        const errorMsg = data.data?.message || data.message || 'Unknown error'
        if (!errorMsg.toLowerCase().includes('unknown message type')) {
          toast.error(`Chat error: ${errorMsg}`)
        }
        break

      case 'rate_limit_exceeded':
        console.warn('⚠️ Rate limit exceeded:', data.data)
        // Prevent spam of error toasts - only show once every 5 seconds
        const now = Date.now()
        if (now - this.lastErrorToastTime > 5000) {
          toast.error('Sending messages too fast. Please wait a moment.')
          this.lastErrorToastTime = now
        }
        break

      default:
        console.warn('⚠️ Unhandled message type:', data.type, data)
        // Don't show error toast to prevent spam
    }
  }

  // Public methods for chat operations
  joinChatRoom(chatId: string) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'join_chat_room',
        chat_id: chatId
      }))
    }
  }

  leaveChatRoom(chatId: string) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'leave_chat_room',
        chat_id: chatId
      }))
    }
  }

  // NOTE: Message sending is now handled via HTTP POST, not WebSocket
  // This method is deprecated - use HTTP API instead
  sendMessage() {
    console.warn('⚠️ sendMessage via WebSocket is deprecated. Use HTTP POST to /v1/chats/{chatId}/messages instead.')
    return false
  }

  sendTyping(chatId: string, typing: boolean) {
    if (!this.isConnected || !this.ws) return
    
    // Rate limiting: prevent sending typing indicators too frequently
    const now = Date.now()
    if (now - this.lastTypingTime < 500) { // 500ms minimum between typing events
      return
    }
    
    try {
      // Use the same format as HTML test
      this.ws.send(JSON.stringify({
        type: typing ? 'typing_start' : 'typing_stop',
        chat_id: chatId
      }))
      this.lastTypingTime = now
      console.log('✍️ Sent typing:', typing ? 'typing_start' : 'typing_stop')
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error)
    }
  }

  sendPaymentOffer(chatId: string, amount: number, productId: string, description: string) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        chat_id: chatId,
        content: description,
        message_type: 'offer',
        metadata: {
          type: 'payment_offer',
          amount,
          product_id: productId,
          currency: 'IDR'
        }
      }))
    }
  }

  markMessageAsRead(chatId: string, messageId: string) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Cannot send read receipt: WebSocket not connected')
      return
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'mark_message_read',
        chat_id: chatId,
        data: {
          message_id: messageId
        }
      }))
      console.log('📖 Sent read receipt for message:', messageId)
    } catch (error) {
      console.error('❌ Failed to send read receipt:', error)
    }
  }

  joinChatRoom(chatId: string) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Cannot join chat room: WebSocket not connected')
      return
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'join_chat_room',
        chat_id: chatId
      }))
      console.log('🏠 Joined chat room:', chatId.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to join chat room:', error)
    }
  }

  leaveChatRoom(chatId: string) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Cannot leave chat room: WebSocket not connected')
      return
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'leave_chat_room',
        chat_id: chatId
      }))
      console.log('🚪 Left chat room:', chatId.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to leave chat room:', error)
    }
  }

  // Event listeners
  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onConnectionStatus(handler: (connected: boolean) => void) {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  onTyping(handler: (data: { chat_id: string, user_id: string, typing: boolean }) => void) {
    this.typingHandlers.add(handler)
    return () => this.typingHandlers.delete(handler)
  }

  onChatUpdate(handler: (data: any) => void) {
    this.chatUpdateHandlers.add(handler)
    return () => this.chatUpdateHandlers.delete(handler)
  }

  onReadReceipt(handler: (data: { chat_id: string, message_id: string, reader_id: string }) => void) {
    this.readReceiptHandlers.add(handler)
    return () => this.readReceiptHandlers.delete(handler)
  }

  // Message queue processing removed - messages are now sent via HTTP POST

  // Getters
  get connected() {
    return this.isConnected
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()
export default webSocketService