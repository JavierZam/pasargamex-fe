// Complete Chat Service - Refactored with Best Practices
import { 
  ChatMessage, 
  ChatRoom, 
  UserPresence, 
  MessageStatus,
  WSMessageEvent,
  WSTypingEvent,
  WSPresenceEvent,
  WSReadReceiptEvent,
  WSDeliveryReceiptEvent
} from '@/types/chat'

class ChatService {
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionPromise: Promise<boolean> | null = null
  
  // Event handlers
  private messageHandlers = new Set<(message: ChatMessage) => void>()
  private statusHandlers = new Set<(connected: boolean) => void>()
  private typingHandlers = new Set<(data: { chat_id: string; user_id: string; typing: boolean }) => void>()
  private presenceHandlers = new Set<(presence: UserPresence) => void>()
  private readReceiptHandlers = new Set<(data: { chat_id: string; message_id: string; reader_id: string }) => void>()
  private deliveryReceiptHandlers = new Set<(data: { chat_id: string; message_id: string }) => void>()
  
  // Message queue for offline messages
  private messageQueue: Array<{ type: string; data: any }> = []
  
  // Current user info
  private currentUserId: string | null = null
  private authToken: string | null = null

  async connect(userId: string, token: string): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.currentUserId = userId
    this.authToken = token
    
    this.connectionPromise = this.establishConnection()
    return this.connectionPromise
  }

  private async establishConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:8080/ws?token=${this.authToken}`
        console.log('🔗 [ChatService] Connecting to:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('✅ [ChatService] Connected to WebSocket')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.connectionPromise = null
          
          // Start heartbeat
          this.startHeartbeat()
          
          // Process queued messages
          this.processMessageQueue()
          
          // Notify handlers
          this.statusHandlers.forEach(handler => handler(true))
          resolve(true)
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleWebSocketMessage(message)
          } catch (error) {
            console.error('❌ [ChatService] Failed to parse message:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('🔌 [ChatService] Connection closed:', event.code, event.reason)
          this.handleDisconnection()
          resolve(false)
        }
        
        this.ws.onerror = (error) => {
          console.error('❌ [ChatService] WebSocket error:', error)
          this.handleDisconnection()
          reject(error)
        }
        
        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ [ChatService] Connection timeout')
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, 10000)
        
      } catch (error) {
        console.error('❌ [ChatService] Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  private handleWebSocketMessage(message: any): void {
    console.log('📨 [ChatService] Received message:', message.type)
    
    switch (message.type) {
      case 'message':
        this.handleMessageReceived(message as WSMessageEvent)
        break
        
      case 'typing':
        this.handleTypingReceived(message as WSTypingEvent)
        break
        
      case 'presence':
      case 'user_presence':
        this.handlePresenceReceived(message as WSPresenceEvent)
        break
        
      case 'read_receipt':
        this.handleReadReceiptReceived(message as WSReadReceiptEvent)
        break
        
      case 'delivery_receipt':
        this.handleDeliveryReceiptReceived(message as WSDeliveryReceiptEvent)
        break
        
      case 'pong':
        // Heartbeat response - connection is alive
        break
        
      case 'auth_success':
        console.log('✅ [ChatService] Authentication successful')
        break
        
      case 'auth_required':
        console.warn('🔑 [ChatService] Authentication required')
        break
        
      case 'error':
        console.error('❌ [ChatService] Server error:', message)
        break
        
      default:
        console.warn('🔍 [ChatService] Unknown message type:', message.type)
    }
  }

  private handleMessageReceived(event: WSMessageEvent): void {
    const message = event.data
    
    // Ensure message has proper status
    if (!message.status) {
      message.status = 'delivered'
    }
    
    console.log('💬 [ChatService] New message:', message.id, message.content?.substring(0, 30))
    this.messageHandlers.forEach(handler => handler(message))
    
    // Auto-send delivery receipt if not our message
    if (message.sender_id !== this.currentUserId) {
      this.sendDeliveryReceipt(message.chat_id, message.id)
    }
  }

  private handleTypingReceived(event: WSTypingEvent): void {
    const data = event.data
    this.typingHandlers.forEach(handler => 
      handler({ 
        chat_id: data.chat_id, 
        user_id: data.user_id, 
        typing: data.typing 
      })
    )
  }

  private handlePresenceReceived(event: WSPresenceEvent): void {
    const presence = event.data
    console.log('🟢 [ChatService] Presence update:', presence.user_id, presence.is_online ? 'online' : 'offline')
    this.presenceHandlers.forEach(handler => handler(presence))
  }

  private handleReadReceiptReceived(event: WSReadReceiptEvent): void {
    const data = event.data
    console.log('👁️ [ChatService] Read receipt:', data.message_id, 'by', data.reader_name)
    this.readReceiptHandlers.forEach(handler => handler(data))
  }

  private handleDeliveryReceiptReceived(event: WSDeliveryReceiptEvent): void {
    const data = event.data
    console.log('📬 [ChatService] Delivery receipt:', data.message_id)
    this.deliveryReceiptHandlers.forEach(handler => handler(data))
  }

  private handleDisconnection(): void {
    this.isConnected = false
    this.connectionPromise = null
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    this.statusHandlers.forEach(handler => handler(false))
    
    // Auto-reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`🔄 [ChatService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        if (this.currentUserId && this.authToken) {
          this.connect(this.currentUserId, this.authToken)
        }
      }, delay)
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30 second heartbeat
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const queuedMessage = this.messageQueue.shift()
      if (queuedMessage && this.ws) {
        this.ws.send(JSON.stringify(queuedMessage))
      }
    }
  }

  // Public methods
  sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'offer' = 'text'): string {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const message = {
      type: 'send_message',
      data: {
        temp_id: tempId,
        chat_id: chatId,
        content,
        type,
        timestamp: new Date().toISOString()
      }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
    
    return tempId
  }

  sendTyping(chatId: string, typing: boolean): void {
    const message = {
      type: 'typing',
      data: { chat_id: chatId, typing }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    }
  }

  markMessageAsRead(chatId: string, messageId: string): void {
    const message = {
      type: 'mark_read',
      data: { chat_id: chatId, message_id: messageId }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private sendDeliveryReceipt(chatId: string, messageId: string): void {
    const message = {
      type: 'delivery_receipt',
      data: { chat_id: chatId, message_id: messageId }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    }
  }

  joinChatRoom(chatId: string): void {
    const message = {
      type: 'join_room',
      data: { chat_id: chatId }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    }
  }

  leaveChatRoom(chatId: string): void {
    const message = {
      type: 'leave_room', 
      data: { chat_id: chatId }
    }
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    }
  }

  // Event subscriptions
  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onConnectionStatusChange(handler: (connected: boolean) => void): () => void {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  onTyping(handler: (data: { chat_id: string; user_id: string; typing: boolean }) => void): () => void {
    this.typingHandlers.add(handler)
    return () => this.typingHandlers.delete(handler)
  }

  onPresence(handler: (presence: UserPresence) => void): () => void {
    this.presenceHandlers.add(handler)
    return () => this.presenceHandlers.delete(handler)
  }

  onReadReceipt(handler: (data: { chat_id: string; message_id: string; reader_id: string }) => void): () => void {
    this.readReceiptHandlers.add(handler)
    return () => this.readReceiptHandlers.delete(handler)
  }

  onDeliveryReceipt(handler: (data: { chat_id: string; message_id: string }) => void): () => void {
    this.deliveryReceiptHandlers.add(handler)
    return () => this.deliveryReceiptHandlers.delete(handler)
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    this.isConnected = false
    this.connectionPromise = null
  }

  // Getters
  get connected(): boolean {
    return this.isConnected
  }
}

// Singleton instance
export const chatService = new ChatService()
export default chatService