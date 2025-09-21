'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { webSocketService, type ChatMessage, type ChatRoom } from '@/services/websocket'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { buildApiUrl, API_CONFIG } from '@/lib/config'
import { useNotifications } from '@/contexts/NotificationContext'

interface WebSocketContextType {
  connected: boolean
  connect: () => Promise<boolean>
  disconnect: () => void
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'offer', attachments?: string[]) => void
  sendPaymentOffer: (chatId: string, amount: number, productId: string, description: string) => void
  sendTyping: (chatId: string, typing: boolean) => void
  joinChatRoom: (chatId: string) => void
  leaveChatRoom: (chatId: string) => void
  markMessageAsRead: (chatId: string, messageId: string) => void
  messages: Record<string, ChatMessage[]>
  typingUsers: Record<string, string[]>
  userPresence: Record<string, { is_online: boolean, last_seen: string }>
  setMessages: (messages: Record<string, ChatMessage[]> | ((prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>)) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, userToken: token } = useFirebaseAuth()
  const { showSuccess, showError } = useNotifications()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  const [userPresence, setUserPresence] = useState<Record<string, { is_online: boolean, last_seen: string }>>({})
  
  // Refs to prevent infinite re-renders
  const messageHandlerRef = useRef<(message: ChatMessage) => void>()
  const statusHandlerRef = useRef<(status: boolean) => void>()
  const typingHandlerRef = useRef<(data: { chat_id: string, user_id: string, typing: boolean }) => void>()
  const readReceiptHandlerRef = useRef<(data: { chat_id: string, message_id: string, reader_id: string }) => void>()
  const presenceHandlerRef = useRef<(data: { user_id: string, is_online: boolean, last_seen: string }) => void>()

  // Initialize handlers
  useEffect(() => {
    messageHandlerRef.current = (message: ChatMessage) => {
      console.log('🌐 [WebSocketContext] New message received:', message)
      setMessages(prev => {
        const chatMessages = prev[message.chat_id] || []
        
        // Handle message updates (delivered, read, etc.)
        const existingIndex = chatMessages.findIndex(m => m.id === message.id)
        if (existingIndex >= 0) {
          console.log('🔄 [WebSocketContext] Updating existing message status:', message.id, message.status)
          const updatedMessages = [...chatMessages]
          updatedMessages[existingIndex] = { ...updatedMessages[existingIndex], ...message }
          return {
            ...prev,
            [message.chat_id]: updatedMessages
          }
        }
        
        // Handle status updates for optimistic messages (by checking temp IDs)
        const tempIndex = chatMessages.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.content === message.content &&
          Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp || Date.now()).getTime()) < 10000
        )
        if (tempIndex >= 0) {
          console.log('🔄 [WebSocketContext] Updating temp message status:', chatMessages[tempIndex].id, message.status)
          const updatedMessages = [...chatMessages]
          updatedMessages[tempIndex] = { ...updatedMessages[tempIndex], status: message.status || 'delivered' }
          return {
            ...prev,
            [message.chat_id]: updatedMessages
          }
        }
        
        // Check if message already exists (prevent duplicates)
        if (chatMessages.some(m => m.id === message.id)) {
          console.log('⚠️ [WebSocketContext] Duplicate message ignored:', message.id)
          return prev
        }
        
        // Remove any optimistic messages for this content/timestamp range (within 5 seconds)
        const messageTime = new Date(message.timestamp).getTime()
        const filteredMessages = chatMessages.filter(m => {
          if (m.id.startsWith('temp-')) {
            const tempTime = new Date(m.timestamp).getTime()
            const timeDiff = Math.abs(messageTime - tempTime)
            // If content matches and time is within 5 seconds, this is likely the optimistic version
            if (m.content === message.content && timeDiff < 5000) {
              console.log('🔄 [WebSocketContext] Replacing optimistic message:', m.id, 'with real message:', message.id)
              return false // Remove optimistic message
            }
          }
          return true
        })
        
        const updatedMessages = [...filteredMessages, message].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        console.log(`✅ [WebSocketContext] Added message to chat ${message.chat_id}. Total messages:`, updatedMessages.length)
        
        return {
          ...prev,
          [message.chat_id]: updatedMessages
        }
      })
    }

    statusHandlerRef.current = (status: boolean) => {
      setConnected(status)
    }

    typingHandlerRef.current = (data: { chat_id: string, user_id: string, typing: boolean }) => {
      setTypingUsers(prev => {
        const currentTypers = prev[data.chat_id] || []
        
        if (data.typing) {
          // Add user to typing list if not already there
          if (!currentTypers.includes(data.user_id)) {
            return {
              ...prev,
              [data.chat_id]: [...currentTypers, data.user_id]
            }
          }
        } else {
          // Remove user from typing list
          return {
            ...prev,
            [data.chat_id]: currentTypers.filter(userId => userId !== data.user_id)
          }
        }
        
        return prev
      })
    }

    readReceiptHandlerRef.current = (data: { chat_id: string, message_id: string, reader_id: string }) => {
      console.log('👁️ [WebSocketContext] Read receipt received:', data)
      
      // Only update if this is not our own read receipt
      if (data.reader_id === user?.uid) {
        return // Don't update our own messages when we read them
      }

      // Update message status to 'read' for the specific message
      setMessages(prev => {
        const chatMessages = prev[data.chat_id] || []
        const updatedMessages = chatMessages.map(msg => 
          msg.id === data.message_id ? { ...msg, status: 'read' as const } : msg
        )
        
        return {
          ...prev,
          [data.chat_id]: updatedMessages
        }
      })
    }

    presenceHandlerRef.current = (data: any) => {
      console.log('🟢 [WebSocketContext] Presence update received:', data)
      console.log('🔍 [WebSocketContext] Current presence keys before update:', Object.keys(userPresence))
      
      // Handle user_presence messages
      if (data.type === 'user_presence') {
        console.log('👤 [WebSocketContext] Processing presence for user:', data.user_id)
        setUserPresence(prev => {
          const updated = {
            ...prev,
            [data.user_id]: {
              is_online: data.is_online,
              last_seen: data.last_seen
            }
          }
          console.log('📝 [WebSocketContext] Updated presence state:', Object.keys(updated))
          return updated
        })
      } else {
        console.log('⚠️ [WebSocketContext] Non-user_presence message:', data.type)
      }
    }
  }, [user?.uid])

  // Setup WebSocket service when user is authenticated
  useEffect(() => {
    console.log('🔧 [WebSocketContext] Setup effect triggered, user:', user?.uid, 'token:', !!token)
    if (user && token) {
      webSocketService.setToken(token)
      
      // Register handlers
      const unsubscribeMessage = webSocketService.onMessage(messageHandlerRef.current!)
      const unsubscribeStatus = webSocketService.onConnectionStatus(statusHandlerRef.current!)
      const unsubscribeTyping = webSocketService.onTyping(typingHandlerRef.current!)
      const unsubscribeReadReceipt = webSocketService.onReadReceipt(readReceiptHandlerRef.current!)
      const unsubscribePresence = webSocketService.onChatUpdate(presenceHandlerRef.current!)
      
      return () => {
        unsubscribeMessage()
        unsubscribeStatus()
        unsubscribeTyping()
        unsubscribeReadReceipt()
        unsubscribePresence()
      }
    }
  }, [user, token])

  // Auto-connect when authenticated (but only when not already connected)
  useEffect(() => {
    console.log('🔧 [WebSocketContext] Auto-connect effect triggered:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      tokenLength: token?.length,
      connected,
      userUID: user?.uid?.substring(0, 8)
    })
    
    if (user && token && !connected) {
      console.log('🔌 [WebSocketContext] Auto-connecting WebSocket...', { 
        user: !!user, 
        token: !!token, 
        tokenLength: token.length,
        connected 
      })
      
      const connectWithRetry = async () => {
        try {
          console.log('🔑 [WebSocketContext] Setting token and connecting...')
          console.log('🔍 [WebSocketContext] Token preview:', token.substring(0, 30) + '...')
          webSocketService.setToken(token)
          console.log('📡 [WebSocketContext] Calling webSocketService.connect()...')
          await webSocketService.connect()
          console.log('✅ [WebSocketContext] WebSocket auto-connected successfully')
        } catch (error) {
          console.error('❌ [WebSocketContext] Auto-connect failed:', error)
          console.error('🔍 [WebSocketContext] Error details:', {
            message: error.message,
            stack: error.stack?.substring(0, 200)
          })
          // Don't show error toast for auto-connect failures
        }
      }
      
      connectWithRetry()
    } else {
      console.log('⏸️ [WebSocketContext] Skipping auto-connect:', {
        hasUser: !!user,
        hasToken: !!token,
        connected
      })
    }
  }, [user, token, connected])

  const connect = useCallback(async (): Promise<boolean> => {
    if (!user || !token) {
      console.error('❌ [WebSocketContext] Cannot connect: no user or token available')
      showError('Authentication Required', 'Please sign in to use chat')
      return false
    }
    
    console.log('🔌 [WebSocketContext] Manual connection attempt...')
    try {
      webSocketService.setToken(token)
      const result = await webSocketService.connect()
      if (result) {
        console.log('✅ [WebSocketContext] Manual WebSocket connection successful')
        showSuccess('Connected', 'Chat connected successfully')
      }
      return result
    } catch (error) {
      console.error('❌ [WebSocketContext] Manual connection failed:', error)
      showError('Connection Failed', 'Failed to connect to chat')
      return false
    }
  }, [user, token, showSuccess, showError])

  const disconnect = useCallback(() => {
    webSocketService.disconnect()
  }, [])

  const sendMessage = useCallback(async (
    chatId: string, 
    content: string, 
    type: 'text' | 'image' | 'offer' = 'text',
    attachments?: string[]
  ) => {
    if (!content.trim()) return
    
    console.log('📤 [WebSocketContext] Debug sending message:', { 
      chatId, 
      content, 
      type, 
      userUID: user?.uid,
      userName: user?.displayName,
      token: !!token,
      connected 
    })
    
    // Optimistic update - add message immediately to UI
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      sender_id: user?.uid || 'unknown',
      sender_name: user?.displayName || user?.email || 'You',
      content,
      type,
      timestamp: new Date().toISOString(),
      status: 'sending',
      attachment_urls: attachments || [],
      metadata: {}
    }
    
    // Add to local state immediately
    setMessages(prev => {
      const updatedMessages = {
        ...prev,
        [chatId]: [...(prev[chatId] || []), optimisticMessage]
      }
      console.log('🔄 [WebSocketContext] Added optimistic message to state:', {
        chatId,
        messageCount: updatedMessages[chatId].length,
        messageContent: optimisticMessage.content.substring(0, 30)
      })
      return updatedMessages
    })
    
    // Send via HTTP POST (like HTML test) instead of WebSocket
    try {
      // Get fresh token before sending message to avoid 401 errors
      let freshToken = token
      if (user) {
        try {
          freshToken = await user.getIdToken(true) // Force refresh token
          console.log('🔄 [WebSocketContext] Got fresh token for message sending')
        } catch (tokenError) {
          console.error('❌ [WebSocketContext] Failed to get fresh token:', tokenError)
        }
      }
      
      const messageData = {
        content,
        type,
        ...(attachments && attachments.length > 0 && { attachment_urls: attachments })
      }
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.CHATS}/${chatId}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify(messageData)
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ [WebSocketContext] Message sent via HTTP POST')
          // Update optimistic message with real message data
          if (data.data) {
            setMessages(prev => {
              const updatedMessages = {
                ...prev,
                [chatId]: prev[chatId]?.map(m => 
                  m.id === optimisticMessage.id ? { 
                    ...data.data, 
                    status: 'sent'  // Force status to 'sent' first, not delivered
                  } : m
                ) || []
              }
              console.log('🔄 [WebSocketContext] Updated message with server data, status: sent')
              return updatedMessages
            })
            
            // Only simulate delivered status - DON'T auto-mark as read
            const messageId = data.data.id || optimisticMessage.id
            setTimeout(() => {
              setMessages(prev => ({
                ...prev,
                [chatId]: prev[chatId]?.map(m => 
                  m.id === messageId ? { ...m, status: 'delivered' } : m
                ) || []
              }))
              console.log('📬 [WebSocketContext] Message marked as delivered:', messageId)
            }, 1000)
          } else {
            // Just update status if no message data returned
            setMessages(prev => {
              const updatedMessages = {
                ...prev,
                [chatId]: prev[chatId]?.map(m => 
                  m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
                ) || []
              }
              console.log('🔄 [WebSocketContext] Updated message status - should trigger chat list update')
              return updatedMessages
            })
            
            // Only simulate delivered status - DON'T auto-mark as read
            setTimeout(() => {
              setMessages(prev => ({
                ...prev,
                [chatId]: prev[chatId]?.map(m => 
                  m.id === optimisticMessage.id ? { ...m, status: 'delivered' } : m
                ) || []
              }))
            }, 1000)
          }
        } else {
          throw new Error(data.error?.message || 'Failed to send message')
        }
      } else {
        throw new Error('HTTP request failed')
      }
    } catch (error) {
      console.error('❌ [WebSocketContext] Failed to send message:', error)
      // Update message status to failed
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(m => 
          m.id === optimisticMessage.id ? { ...m, status: 'failed' } : m
        ) || []
      }))
    }
  }, [user, showError])

  const sendPaymentOffer = useCallback((
    chatId: string,
    amount: number,
    productId: string,
    description: string
  ) => {
    webSocketService.sendPaymentOffer(chatId, amount, productId, description)
  }, [])

  const sendTyping = useCallback((chatId: string, typing: boolean) => {
    webSocketService.sendTyping(chatId, typing)
  }, [])

  const joinChatRoom = useCallback((chatId: string) => {
    webSocketService.joinChatRoom(chatId)
  }, [])

  const leaveChatRoom = useCallback((chatId: string) => {
    webSocketService.leaveChatRoom(chatId)
  }, [])

  const markMessageAsRead = useCallback((chatId: string, messageId: string) => {
    webSocketService.markMessageAsRead(chatId, messageId)
  }, [])

  // Debug log for messages state changes
  console.log('🔄 [WebSocketContext] messages state:', {
    messageCount: Object.keys(messages).length,
    chatsWithMessages: Object.entries(messages).map(([chatId, msgs]) => ({
      chatId: chatId.substring(0, 8),
      count: msgs.length
    }))
  })

  const contextValue: WebSocketContextType = {
    connected,
    connect,
    disconnect,
    sendMessage,
    sendPaymentOffer,
    sendTyping,
    joinChatRoom,
    leaveChatRoom,
    markMessageAsRead,
    messages,
    typingUsers,
    userPresence,
    setMessages
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}