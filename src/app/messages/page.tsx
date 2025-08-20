'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner, Avatar } from '@/components/ui'

interface Chat {
  id: string
  participants: string[]
  product_id?: string
  transaction_id?: string
  type: 'direct' | 'group' | 'transaction'
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'system' | 'offer'
  attachment_urls?: string[]
  metadata?: Record<string, any>
  created_at: string
}

interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Get user ID from URL params (for starting chat with specific user)
  const targetUserId = searchParams.get('user')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      loadChats()
      // Initialize WebSocket connection
      initWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initWebSocket = () => {
    if (!user?.uid) return

    // WebSocket URL - adjust based on your backend setup
    const wsUrl = `wss://pasargamex-api-244929333106.asia-southeast2.run.app/v1/ws?userId=${user.uid}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'new_message') {
            const message = data.message as Message
            setMessages(prev => [...prev, message])
            
            // Update last message in chat list
            setChats(prev => prev.map(chat => 
              chat.id === message.chat_id 
                ? { ...chat, last_message: message }
                : chat
            ))
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(initWebSocket, 3000)
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  const loadChats = async () => {
    try {
      setLoading(true)
      
      // Mock chat data for demonstration
      const mockChats: Chat[] = [
        {
          id: 'chat_001',
          participants: [user?.uid || '', 'seller_123'],
          product_id: 'prod_001',
          type: 'direct',
          last_message: {
            id: 'msg_001',
            chat_id: 'chat_001',
            sender_id: 'seller_123',
            content: 'Hello! Thanks for your interest in my Genshin account. Let me know if you have any questions!',
            type: 'text',
            created_at: '2024-01-15T10:30:00Z'
          },
          unread_count: 1,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'chat_002',
          participants: [user?.uid || '', 'buyer_456'],
          transaction_id: 'txn_001',
          type: 'transaction',
          last_message: {
            id: 'msg_002',
            chat_id: 'chat_002',
            sender_id: user?.uid || '',
            content: 'Payment has been completed. Please deliver the account details.',
            type: 'text',
            created_at: '2024-01-14T15:45:00Z'
          },
          unread_count: 0,
          created_at: '2024-01-14T15:00:00Z',
          updated_at: '2024-01-14T15:45:00Z'
        }
      ]

      // Mock users data
      const mockUsers = new Map<string, User>([
        ['seller_123', { id: 'seller_123', username: 'ProGameSeller', email: 'seller@example.com' }],
        ['buyer_456', { id: 'buyer_456', username: 'GamerBoy99', email: 'buyer@example.com' }],
      ])

      setChats(mockChats)
      setUsers(mockUsers)
      
      // Auto-select first chat or create new chat if targetUserId provided
      if (targetUserId && !selectedChat) {
        // Create or find chat with target user
        const existingChat = mockChats.find(chat => 
          chat.participants.includes(targetUserId)
        )
        if (existingChat) {
          setSelectedChat(existingChat)
          loadMessages(existingChat.id)
        }
      } else if (mockChats.length > 0 && !selectedChat) {
        setSelectedChat(mockChats[0])
        loadMessages(mockChats[0].id)
      }
      
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: 'msg_001',
          chat_id: chatId,
          sender_id: 'seller_123',
          content: 'Hello! Thanks for your interest in my Genshin account. Let me know if you have any questions!',
          type: 'text',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'msg_002',
          chat_id: chatId,
          sender_id: user?.uid || '',
          content: 'Hi! I\'m interested in the account. Can you tell me more about the characters available?',
          type: 'text',
          created_at: '2024-01-15T10:35:00Z'
        },
        {
          id: 'msg_003',
          chat_id: chatId,
          sender_id: 'seller_123',
          content: 'Sure! The account has all 5-star characters including Zhongli, Venti, Raiden Shogun, and more. All are well-built with good artifacts.',
          type: 'text',
          created_at: '2024-01-15T10:40:00Z'
        }
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedChat || sendingMessage) return

    try {
      setSendingMessage(true)
      
      const message: Message = {
        id: `temp_${Date.now()}`,
        chat_id: selectedChat.id,
        sender_id: user?.uid || '',
        content: newMessage.trim(),
        type: 'text',
        created_at: new Date().toISOString()
      }

      // Add message optimistically to UI
      setMessages(prev => [...prev, message])
      setNewMessage('')

      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          chat_id: selectedChat.id,
          content: newMessage.trim(),
          message_type: 'text'
        }))
      }

      // Fallback to HTTP API
      // await apiClient.sendMessage(selectedChat.id, { content: newMessage.trim(), type: 'text' })
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== `temp_${Date.now()}`))
    } finally {
      setSendingMessage(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getOtherParticipant = (chat: Chat) => {
    const otherUserId = chat.participants.find(id => id !== user?.uid)
    return otherUserId ? users.get(otherUserId) : null
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex">
      {/* Chat List Sidebar */}
      <div className="w-1/3 max-w-sm bg-gray-800/50 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-400 text-sm">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.69-.413l-2.818 2.818L9.4 18.6c-.1-.2-.1-.4-.1-.6v-1.7A8 8 0 113 12v1.5c0 .6.3 1.1.8 1.3z" />
                </svg>
                <p className="text-sm">No conversations yet</p>
              </div>
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat)
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat)
                      loadMessages(chat.id)
                    }}
                    className={`w-full p-4 rounded-lg text-left hover:bg-gray-700/50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-gray-700/70 border border-brand-red/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar 
                        fallback={otherUser?.username?.[0] || '?'} 
                        size="md" 
                        src={otherUser?.avatar_url}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium truncate">
                            @{otherUser?.username || 'Unknown User'}
                          </h3>
                          {chat.unread_count > 0 && (
                            <span className="bg-brand-red text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {chat.last_message?.content || 'No messages yet'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-gray-800/30 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar 
                  fallback={getOtherParticipant(selectedChat)?.username?.[0] || '?'} 
                  size="md" 
                  src={getOtherParticipant(selectedChat)?.avatar_url}
                />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    @{getOtherParticipant(selectedChat)?.username || 'Unknown User'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {selectedChat.type === 'transaction' ? 'Transaction Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.uid
                const sender = isOwnMessage ? null : users.get(message.sender_id)

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : ''}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar 
                            fallback={sender?.username?.[0] || '?'} 
                            size="sm" 
                            src={sender?.avatar_url}
                          />
                          <span className="text-gray-400 text-sm">
                            @{sender?.username || 'Unknown'}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-brand-red to-brand-blue text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-6 bg-gray-800/30 border-t border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sendingMessage}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-gradient-to-r from-brand-red to-brand-blue text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.69-.413l-2.818 2.818L9.4 18.6c-.1-.2-.1-.4-.1-.6v-1.7A8 8 0 113 12v1.5c0 .6.3 1.1.8 1.3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Select a conversation</h2>
              <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}