'use client'

// Complete Chat Context - Refactored with Best Practices
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useNotifications } from '@/contexts/NotificationContext'
import { chatService } from '@/services/chatService'
import { buildApiUrl, API_CONFIG } from '@/lib/config'
import { 
  ChatMessage, 
  ChatRoom, 
  UserPresence, 
  MessageStatus,
  ChatParticipant 
} from '@/types/chat'

interface ChatContextType {
  // Connection state
  connected: boolean
  connecting: boolean
  error: string | null
  
  // Data state  
  messages: Record<string, ChatMessage[]>
  chats: ChatRoom[]
  userPresence: Record<string, UserPresence>
  typingUsers: Record<string, string[]>
  
  // Actions
  connect: () => Promise<boolean>
  disconnect: () => void
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'offer') => Promise<string>
  sendTyping: (chatId: string, typing: boolean) => void
  markMessageAsRead: (chatId: string, messageId: string) => void
  joinChatRoom: (chatId: string) => void
  leaveChatRoom: (chatId: string) => void
  
  // Chat management
  loadChats: () => Promise<void>
  loadChatMessages: (chatId: string, page?: number) => Promise<void>
  refreshChat: (chatId: string) => Promise<void>
  
  // Utility
  getChatById: (chatId: string) => ChatRoom | undefined
  getMessageStatus: (messageId: string) => MessageStatus
  getUserPresence: (userId: string) => UserPresence | undefined
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, userToken: token } = useFirebaseAuth()
  const { showSuccess, showError, showNotification } = useNotifications()
  
  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({})
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  
  // Loading states
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({})
  
  // Refs to prevent stale closures
  const messagesRef = useRef(messages)
  const chatsRef = useRef(chats)
  
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  
  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  // Connect to chat service
  const connect = useCallback(async (): Promise<boolean> => {
    if (!user || !token || connecting) return false
    
    try {
      setConnecting(true)
      setError(null)
      
      const success = await chatService.connect(user.uid, token)
      
      if (success) {
        console.log('✅ [ChatContext] Connected to chat service')
        await loadChats()
      } else {
        setError('Failed to connect to chat service')
      }
      
      return success
    } catch (error) {
      console.error('❌ [ChatContext] Connection failed:', error)
      setError(error instanceof Error ? error.message : 'Connection failed')
      return false
    } finally {
      setConnecting(false)
    }
  }, [user, token, connecting])

  // Disconnect from chat service
  const disconnect = useCallback(() => {
    chatService.disconnect()
    setConnected(false)
    setMessages({})
    setUserPresence({})
    setTypingUsers({})
    setError(null)
  }, [])

  // Load chat list from API
  const loadChats = useCallback(async () => {
    if (!token || loadingChats) return
    
    try {
      setLoadingChats(true)
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CHATS), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data?.items) {
        const transformedChats = await Promise.all(
          data.data.items.map(async (chat: any) => await transformChatData(chat))
        )
        
        // Sort by last message timestamp
        const sortedChats = transformedChats.sort((a, b) => {
          const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : new Date(a.updated_at).getTime()
          const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : new Date(b.updated_at).getTime()
          return bTime - aTime
        })
        
        setChats(sortedChats)
        console.log(`✅ [ChatContext] Loaded ${sortedChats.length} chats`)
      }
    } catch (error) {
      console.error('❌ [ChatContext] Failed to load chats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load chats')
    } finally {
      setLoadingChats(false)
    }
  }, [token, loadingChats])

  // Transform API chat data to internal format
  const transformChatData = async (chat: any): Promise<ChatRoom> => {
    // Load participant details
    let participants: ChatParticipant[] = []
    
    try {
      if (chat.id) {
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.CHATS}/${chat.id}/participants`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.participants) {
            participants = data.data.participants.map((p: any) => ({
              user_id: p.user_id || p.id || '',
              name: p.username || p.display_name || p.name || `Player-${(p.user_id || '').slice(-4)}`,
              username: p.username,
              avatar: p.avatar || p.profile_picture,
              role: p.role || 'participant',
              joined_at: p.joined_at,
              last_read_at: p.last_read_at
            }))
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ [ChatContext] Failed to load participants for chat ${chat.id}:`, error)
    }
    
    const otherParticipant = participants.find(p => p.user_id !== user?.uid)
    
    return {
      id: chat.id || Math.random().toString(),
      type: chat.chat_type || chat.type || 'individual',
      participants,
      last_message: chat.last_message ? {
        id: Math.random().toString(),
        chat_id: chat.id || '',
        sender_id: '',
        sender_name: 'Unknown',
        content: typeof chat.last_message === 'string' ? chat.last_message : (chat.last_message.content || ''),
        type: 'text',
        status: 'delivered',
        timestamp: chat.last_message_at || chat.updated_at || new Date().toISOString(),
        attachment_urls: [],
        metadata: {}
      } : undefined,
      unread_count: chat.unread_count || 0,
      created_at: chat.created_at || new Date().toISOString(),
      updated_at: chat.updated_at || new Date().toISOString(),
      product_id: chat.product_id,
      other_participant: otherParticipant,
      display_name: otherParticipant?.name || 'Unknown Player',
      display_avatar: otherParticipant?.avatar
    }
  }

  // Load messages for a specific chat
  const loadChatMessages = useCallback(async (chatId: string, page: number = 1) => {
    if (!token || loadingMessages[chatId]) return
    
    try {
      setLoadingMessages(prev => ({ ...prev, [chatId]: true }))
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.CHATS}/${chatId}/messages?page=${page}&limit=50`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data?.items) {
        const transformedMessages: ChatMessage[] = data.data.items.map((msg: any) => ({
          id: msg.id,
          chat_id: chatId,
          sender_id: msg.sender_id || msg.user_id,
          sender_name: msg.sender_name || msg.username || 'Unknown',
          content: msg.content || '',
          type: msg.type || 'text',
          status: msg.status || 'delivered',
          timestamp: msg.timestamp || msg.created_at,
          attachment_urls: msg.attachment_urls || [],
          metadata: msg.metadata || {}
        }))
        
        setMessages(prev => ({
          ...prev,
          [chatId]: transformedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        }))
        
        console.log(`✅ [ChatContext] Loaded ${transformedMessages.length} messages for chat ${chatId}`)
      }
    } catch (error) {
      console.error(`❌ [ChatContext] Failed to load messages for chat ${chatId}:`, error)
    } finally {
      setLoadingMessages(prev => ({ ...prev, [chatId]: false }))
    }
  }, [token, loadingMessages])

  // Send message
  const sendMessage = useCallback(async (chatId: string, content: string, type: 'text' | 'image' | 'offer' = 'text'): Promise<string> => {
    if (!user || !connected) {
      throw new Error('Not connected to chat service')
    }
    
    // Create optimistic message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      chat_id: chatId,
      sender_id: user.uid,
      sender_name: user.displayName || user.email || 'You',
      content,
      type,
      status: 'sending',
      timestamp: new Date().toISOString(),
      is_optimistic: true,
      temp_id: tempId
    }
    
    // Add optimistic message to state
    setMessages(prev => {
      const chatMessages = prev[chatId] || []
      return {
        ...prev,
        [chatId]: [...chatMessages, optimisticMessage].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      }
    })
    
    // Update chat list immediately
    updateChatWithMessage(chatId, optimisticMessage)
    
    // Send via WebSocket
    const sentTempId = chatService.sendMessage(chatId, content, type)
    
    return sentTempId
  }, [user, connected])

  // Update chat list when new message arrives
  const updateChatWithMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats(prev => {
      const existingIndex = prev.findIndex(chat => chat.id === chatId)
      
      if (existingIndex >= 0) {
        const updatedChats = [...prev]
        const chat = updatedChats[existingIndex]
        
        // Update chat with new message
        const updatedChat: ChatRoom = {
          ...chat,
          last_message: message,
          updated_at: new Date().toISOString(),
          unread_count: message.sender_id !== user?.uid ? (chat.unread_count || 0) + 1 : chat.unread_count
        }
        
        // Move to top
        updatedChats.splice(existingIndex, 1)
        updatedChats.unshift(updatedChat)
        
        return updatedChats
      }
      
      return prev
    })
  }, [user?.uid])

  // WebSocket event handlers
  useEffect(() => {
    if (!user) return

    const unsubscribers: Array<() => void> = []
    
    // Connection status
    unsubscribers.push(
      chatService.onConnectionStatusChange(setConnected)
    )
    
    // Messages
    unsubscribers.push(
      chatService.onMessage((message) => {
        console.log('💬 [ChatContext] New message received:', message.id)
        
        setMessages(prev => {
          const chatMessages = prev[message.chat_id] || []
          
          // Handle optimistic message replacement
          if (message.temp_id) {
            const tempIndex = chatMessages.findIndex(m => m.temp_id === message.temp_id)
            if (tempIndex >= 0) {
              const updatedMessages = [...chatMessages]
              updatedMessages[tempIndex] = { ...message, is_optimistic: false }
              return { ...prev, [message.chat_id]: updatedMessages }
            }
          }
          
          // Check for duplicates
          if (chatMessages.some(m => m.id === message.id)) {
            return prev
          }
          
          const updatedMessages = [...chatMessages, message].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          return { ...prev, [message.chat_id]: updatedMessages }
        })
        
        // Update chat list
        updateChatWithMessage(message.chat_id, message)
        
        // Show notification for messages from others
        if (message.sender_id !== user.uid) {
          showNotification({
            title: message.sender_name,
            message: message.content,
            type: 'info'
          })
        }
      })
    )
    
    // Typing indicators
    unsubscribers.push(
      chatService.onTyping((data) => {
        setTypingUsers(prev => {
          const currentTypers = prev[data.chat_id] || []
          
          if (data.typing) {
            if (!currentTypers.includes(data.user_id)) {
              return { ...prev, [data.chat_id]: [...currentTypers, data.user_id] }
            }
          } else {
            return { ...prev, [data.chat_id]: currentTypers.filter(id => id !== data.user_id) }
          }
          
          return prev
        })
      })
    )
    
    // Presence updates
    unsubscribers.push(
      chatService.onPresence((presence) => {
        console.log('🟢 [ChatContext] Presence update:', presence.user_id, presence.is_online ? 'online' : 'offline')
        setUserPresence(prev => ({
          ...prev,
          [presence.user_id]: presence
        }))
      })
    )
    
    // Read receipts
    unsubscribers.push(
      chatService.onReadReceipt((data) => {
        if (data.reader_id === user.uid) return // Don't update our own messages
        
        setMessages(prev => {
          const chatMessages = prev[data.chat_id] || []
          const updatedMessages = chatMessages.map(msg =>
            msg.id === data.message_id ? { ...msg, status: 'read' as MessageStatus } : msg
          )
          return { ...prev, [data.chat_id]: updatedMessages }
        })
      })
    )
    
    // Delivery receipts
    unsubscribers.push(
      chatService.onDeliveryReceipt((data) => {
        setMessages(prev => {
          const chatMessages = prev[data.chat_id] || []
          const updatedMessages = chatMessages.map(msg =>
            msg.id === data.message_id && msg.status === 'sent' 
              ? { ...msg, status: 'delivered' as MessageStatus } 
              : msg
          )
          return { ...prev, [data.chat_id]: updatedMessages }
        })
      })
    )
    
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [user, updateChatWithMessage, showNotification])

  // Auto-connect when user is available
  useEffect(() => {
    if (user && token && !connected && !connecting) {
      connect()
    }
  }, [user, token, connected, connecting, connect])

  // Utility functions
  const getChatById = useCallback((chatId: string) => {
    return chats.find(chat => chat.id === chatId)
  }, [chats])

  const getMessageStatus = useCallback((messageId: string) => {
    for (const chatMessages of Object.values(messages)) {
      const message = chatMessages.find(m => m.id === messageId)
      if (message) return message.status
    }
    return 'sent' as MessageStatus
  }, [messages])

  const getUserPresence = useCallback((userId: string) => {
    return userPresence[userId]
  }, [userPresence])

  const refreshChat = useCallback(async (chatId: string) => {
    await loadChatMessages(chatId)
  }, [loadChatMessages])

  const contextValue: ChatContextType = {
    // Connection state
    connected,
    connecting,
    error,
    
    // Data state
    messages,
    chats,
    userPresence,
    typingUsers,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    sendTyping: chatService.sendTyping.bind(chatService),
    markMessageAsRead: chatService.markMessageAsRead.bind(chatService),
    joinChatRoom: chatService.joinChatRoom.bind(chatService),
    leaveChatRoom: chatService.leaveChatRoom.bind(chatService),
    
    // Chat management
    loadChats,
    loadChatMessages,
    refreshChat,
    
    // Utility
    getChatById,
    getMessageStatus,
    getUserPresence
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}