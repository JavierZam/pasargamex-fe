'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useActiveChat } from '@/hooks/useActiveChat'
import { ChatMessageComponent } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { buildApiUrl, API_CONFIG } from '@/lib/config'
import { isValidAvatarUrl, formatLastSeen, getRoleBadgeClasses, getRoleExplanation } from '@/lib/chat-utils'

interface ChatWindowProps {
  chatId: string | null
  chatTitle?: string
  participants?: Array<{
    user_id: string
    name: string
    avatar?: string
    role: 'buyer' | 'seller' | 'admin' | 'middleman'
  }>
  productId?: string
  onClose?: () => void
  chatData?: any // Raw chat data from backend with other_user info
}

export function ChatWindow({ chatId, chatTitle, participants = [], productId, onClose, chatData }: ChatWindowProps) {
  const { user, userToken: token } = useFirebaseAuth()
  
  // Debug user data (reduced logging)
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('🔍 Debug ChatWindow User Data:', {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName
    })
  }
  const {
    connected,
    messages,
    typingUsers,
    userPresence,
    sendMessage,
    sendPaymentOffer,
    sendTyping,
    connect
  } = useActiveChat(chatId)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [connectionError, setConnectionError] = useState(false)
  const [productData, setProductData] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [participantData, setParticipantData] = useState<any[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  // Manual scroll to bottom only when user sends new message
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Scroll to bottom when opening chat room - ALWAYS go to latest messages
  useEffect(() => {
    if (chatId) {
      console.log('🔄 Chat opened:', chatId, 'Messages count:', messages.length)
      // Always scroll to bottom when chat room opens, regardless of message count
      const scrollTimer = setTimeout(() => {
        if (messagesEndRef.current) {
          console.log('📍 Scrolling to bottom of chat')
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' })
        }
      }, 200) // Longer delay to ensure messages are loaded and rendered
      
      return () => clearTimeout(scrollTimer)
    }
  }, [chatId, messages.length]) // Trigger when chatId changes OR when messages load

  // Monitor connection status
  useEffect(() => {
    console.log('🔗 Connection status changed:', { connected, chatId, willShowError: !connected && !!chatId })
    if (connected) {
      setConnectionError(false)
    } else if (chatId) {
      // Add a small delay to avoid showing error for momentary disconnections
      const timeout = setTimeout(() => {
        setConnectionError(true)
      }, 2000) // Wait 2 seconds before showing connection error
      
      return () => clearTimeout(timeout)
    }
  }, [connected, chatId])

  // Load detailed participant data with caching
  const [participantCache, setParticipantCache] = useState<Record<string, any>>({})
  
  useEffect(() => {
    const loadParticipantData = async () => {
      if (!chatId || !token || participants.length === 0) {
        return
      }
      
      // Check if we already have cached data for all participants
      const allCached = participants.every(p => participantCache[p.user_id])
      if (allCached) {
        setParticipantData(participants.map(p => participantCache[p.user_id]))
        return
      }
      
      try {
        setLoadingParticipants(true)
        console.log('📚 Loading participant data for', participants.length, 'participants')
        
        const participantPromises = participants.map(async (participant) => {
          try {
            // Load user data from backend
            console.log('👥 Loading data for user:', participant.user_id)
            const userResponse = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${participant.user_id}`), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          
            if (userResponse.ok) {
              const userData = await userResponse.json()
              // Use Firebase photoURL for current user, backend data for others
              const isCurrentUser = participant.user_id === user?.uid
              const firebasePhotoURL = isCurrentUser ? user?.photoURL : null
              const backendAvatar = userData.data?.avatar_url || userData.data?.profile_image || userData.data?.photo_url
              
              const processedParticipant = {
                ...participant,
                name: userData.data?.username || userData.data?.display_name || participant.name || 'Gaming User',
                avatar: firebasePhotoURL || backendAvatar || null,
                online_status: userData.data?.online_status || 'offline',
                last_seen: userData.data?.last_seen,
                verified: userData.data?.verification_status === 'verified'
              }
              
              console.log('✅ Processed participant data:', {
                user_id: participant.user_id,
                name: processedParticipant.name,
                avatar: processedParticipant.avatar,
                online_status: processedParticipant.online_status,
                isCurrentUser,
                firebasePhotoURL,
                backendAvatar,
                avatarSource: firebasePhotoURL ? 'Firebase' : backendAvatar ? 'Backend' : 'None'
              })
              console.log('📄 Full backend data for', participant.user_id, ':', userData.data)
              
              return processedParticipant
            } else {
              console.warn('⚠️ Failed to load user data for:', participant.user_id, userResponse.status)
              return {
                ...participant,
                name: participant.name || 'Gaming User',
                avatar: null,
                online_status: 'offline'
              }
            }
          } catch (userError) {
            console.error('❌ Error loading user data for:', participant.user_id, userError)
            return {
              ...participant,
              name: participant.name || 'Gaming User',
              avatar: null,
              online_status: 'offline'
            }
          }
        })
        
        const enrichedParticipants = await Promise.all(participantPromises)
        console.log('✅ Loaded participant data:', enrichedParticipants.length, 'participants')
        
        // Update cache
        const newCache = { ...participantCache }
        enrichedParticipants.forEach(p => {
          newCache[p.user_id] = p
        })
        setParticipantCache(newCache)
        setParticipantData(enrichedParticipants)
      } catch (error) {
        console.error('❌ Failed to load participant data:', error)
        // Set fallback data to prevent crashes
        setParticipantData(participants.map(p => ({
          ...p,
          name: p.name || 'Gaming User',
          avatar: null,
          online_status: 'offline'
        })))
      } finally {
        setLoadingParticipants(false)
      }
    }

    loadParticipantData()
  }, [chatId, token, participants, participantCache])

  // Load product data if productId is provided
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId || !token) return
      
      try {
        setLoadingProduct(true)
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setProductData(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to load product data:', error)
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProductData()
  }, [productId, token])

  const handleSendMessage = (content: string, type?: 'text' | 'image' | 'offer', attachments?: string[]) => {
    if (chatId) {
      sendMessage(chatId, content, type, attachments)
      // Only scroll when user sends a message
      setTimeout(() => scrollToBottom(), 100)
    }
  }

  const handleSendPaymentOffer = (amount: number, productId: string, description: string) => {
    if (chatId) {
      sendPaymentOffer(chatId, amount, productId, description)
    }
  }

  const handleTyping = (typing: boolean) => {
    if (chatId) {
      sendTyping(chatId, typing)
    }
  }

  const handlePaymentAction = (messageId: string, action: 'accept' | 'reject') => {
    // In a real app, you'd send this to your payment service
    console.log('Payment action:', { messageId, action })
    // You might want to send a system message or update the UI
    if (chatId) {
      const actionText = action === 'accept' ? 'accepted' : 'rejected'
      sendMessage(chatId, `Payment offer ${actionText}`, 'text')
    }
  }

  const otherParticipants = useMemo(() => {
    const result = participantData.length > 0 
      ? participantData.filter(p => p.user_id !== user?.uid)
      : participants.filter(p => p.user_id !== user?.uid)
    
    // Only log when data actually changes
    if (result.length > 0) {
      console.log('👥 Other participants updated:', {
        count: result.length,
        names: result.map(p => p.name),
        hasAvatars: result.map(p => !!p.avatar && !p.avatar?.includes('Unknown'))
      })
    }
    
    return result
  }, [participantData, participants, user?.uid])

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-dark-primary/30">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-brand-red/20 to-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-6 gaming-glow">
            <div className="text-4xl">🎮</div>
          </div>
          <h3 className="text-2xl font-gaming font-bold text-white mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue">
              SELECT A CHAT
            </span>
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Choose a conversation from the sidebar to start gaming communication
          </p>
          <div className="mt-6 text-sm text-gray-500">
            💬 Chat • 💰 Trade • 🏆 Dominate
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-dark-primary/30">
      {/* Gaming Chat Header */}
      <div className="border-b border-gray-700/50 bg-gradient-to-r from-bg-dark-secondary to-bg-dark-accent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* User Avatar with better fallback */}
            <div className="relative w-12 h-12">
              {otherParticipants.length > 0 && isValidAvatarUrl(otherParticipants[0].avatar) ? (
                <>
                  <img 
                    src={otherParticipants[0].avatar}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-neon-green/50 gaming-glow"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      console.log('❌ Avatar load error for:', otherParticipants[0].avatar)
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div 
                    className="w-12 h-12 bg-gradient-to-r from-brand-red to-brand-blue rounded-full flex items-center justify-center gaming-glow absolute top-0 left-0" 
                    style={{ display: 'none' }}
                  >
                    <span className="text-white font-bold text-lg">
                      {otherParticipants[0].name?.charAt(0).toUpperCase() || '🎮'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-brand-red to-brand-blue rounded-full flex items-center justify-center gaming-glow">
                  <span className="text-white font-bold text-lg">
                    {otherParticipants.length > 0 
                      ? otherParticipants[0].name?.charAt(0).toUpperCase() || '🎮'
                      : '🎮'
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-gaming font-semibold text-white text-lg gaming-text-glow">
                  {otherParticipants.length > 0 
                    ? otherParticipants[0].name || 'Gaming User'
                    : (chatTitle || 'GAMING CHAT')
                  }
                </h2>
                {otherParticipants.length > 0 && otherParticipants[0].verified && (
                  <div className="bg-neon-green/20 text-neon-green text-xs px-2 py-0.5 rounded-full border border-neon-green/40">
                    ✓ VERIFIED
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                {/* Real Online Status - prioritize real-time presence data */}
                {otherParticipants.length > 0 ? (() => {
                  const otherUserId = otherParticipants[0].user_id
                  const presenceData = userPresence[otherUserId]
                  const isOnline = presenceData?.is_online || otherParticipants[0].online_status === 'online'
                  
                  return isOnline ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      <span className="text-neon-green font-semibold">ONLINE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 font-semibold">
                          Last seen {formatLastSeen(
                            presenceData?.last_seen || otherParticipants[0].last_seen, 
                            chatData?.last_message_at || chatData?.other_user?.updated_at
                          )}
                        </span>
                      </div>
                    </div>
                  )
                })() : connected ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-neon-green font-semibold">CONNECTED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse"></div>
                    <span className="text-neon-yellow font-semibold">CONNECTING...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {onClose && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="bg-bg-dark-primary/50 border-gray-600/50 text-gray-300 hover:bg-brand-red/20 hover:border-brand-red/50 hover:text-white transition-all duration-300 sm:hidden"
            >
              ✕
            </Button>
          )}
        </div>
        
        {/* Gaming Participant roles with explanations */}
        {participants.length > 0 && (
          <div className="flex gap-2 mt-3">
            {participants.map(participant => {
              const roleExplanation = {
                'seller': '🛍️ Can list & sell products',
                'buyer': '💳 Can purchase products', 
                'admin': '🛡️ System administrator',
                'middleman': '👨‍💼 Transaction mediator'
              }
              
              return (
                <div
                  key={participant.user_id}
                  title={roleExplanation[participant.role as keyof typeof roleExplanation] || participant.role}
                  className={`px-3 py-1 rounded-lg text-xs font-gaming font-semibold border cursor-help transition-all duration-200 hover:scale-105 ${
                    participant.role === 'admin' 
                      ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 border-red-500/30 hover:bg-red-600/30' 
                      : participant.role === 'seller'
                      ? 'bg-gradient-to-r from-neon-green/20 to-green-600/20 text-neon-green border-neon-green/30 hover:bg-neon-green/30'
                      : participant.role === 'middleman'
                      ? 'bg-gradient-to-r from-neon-yellow/20 to-yellow-600/20 text-neon-yellow border-neon-yellow/30 hover:bg-neon-yellow/30'
                      : 'bg-gradient-to-r from-brand-blue/20 to-blue-600/20 text-brand-blue-light border-brand-blue/30 hover:bg-brand-blue/30'
                  }`}
                >
                  {participant.name} • {participant.role.toUpperCase()}
                </div>
              )
            })}
          </div>
        )}

        {/* Product Context Display like in test file */}
        {productData && (
          <div className="mt-3 p-3 bg-gradient-to-r from-bg-dark-primary/50 to-bg-dark-secondary/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-3">
              {productData.image_url && (
                <img 
                  src={productData.image_url} 
                  alt={productData.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-600/30"
                />
              )}
              <div className="flex-1">
                <h3 className="font-gaming font-semibold text-white text-sm">
                  🎮 {productData.name || productData.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-neon-green font-bold text-sm">
                    Rp {productData.price?.toLocaleString('id-ID') || '0'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Delivery: {productData.delivery_method || 'instant'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-neon-green to-green-600 text-white font-gaming text-xs px-4 py-2 rounded-lg gaming-glow hover:shadow-neon-green/30"
                  onClick={() => {
                    // Send product showcase message
                    if (chatId) {
                      sendMessage(chatId, `[Product] ${productData.name} - Rp ${productData.price}`, 'text')
                    }
                  }}
                >
                  💳 Purchase
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-neon-blue to-blue-600 text-white font-gaming text-xs px-3 py-2 rounded-lg hover:shadow-neon-blue/30"
                >
                  ↻ Refresh
                </Button>
              </div>
            </div>
          </div>
        )}

        {loadingProduct && (
          <div className="mt-3 p-3 bg-bg-dark-secondary/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
              Loading product information...
            </div>
          </div>
        )}
      </div>

      {/* Gaming Connection error banner */}
      {connectionError && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-b border-red-500/50 p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
            <div className="text-red-300 text-sm font-gaming">
              CONNECTION LOST • ATTEMPTING RECONNECT
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => connect()}
              className="bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:text-white text-xs font-gaming px-4 py-2 rounded-lg transition-all duration-300"
            >
              🔄 RETRY
            </Button>
          </div>
        </div>
      )}

      {/* Gaming Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-bg-dark-primary/20 to-bg-dark-secondary/10 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-brand-red/20 to-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-6 gaming-glow">
                <div className="text-3xl">👋</div>
              </div>
              <h3 className="text-xl font-gaming font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue">
                  START THE CONVERSATION
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Send your first message to begin the ultimate gaming experience
              </p>
              <div className="mt-4 text-sm text-gray-500">
                💬 Type below to start chatting
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            // Enhance message with correct sender name and avatar from participant data
            const enhancedMessage = { ...message }
            
            // Find sender in participant data
            const sender = participantData.find(p => p.user_id === message.sender_id) ||
                          participants.find(p => p.user_id === message.sender_id)
            
            // Enhance sender name if missing or "Unknown"
            if (!message.sender_name || message.sender_name === 'Unknown') {
              if (sender && sender.name && sender.name !== 'Unknown') {
                enhancedMessage.sender_name = sender.name
              }
            }
            
            // Add avatar URL to enhanced message for ChatMessageComponent to use
            if (sender) {
              enhancedMessage.sender_avatar = sender.avatar
            }
            
            return (
              <ChatMessageComponent
                key={message.id}
                message={enhancedMessage}
                isCurrentUser={message.sender_id === user?.uid}
                onPaymentAction={handlePaymentAction}
              />
            )
          })
        )}
        
        {/* Typing indicator - convert user IDs to usernames */}
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers.map(userId => {
            const participant = participantData.find(p => p.user_id === userId)
            return participant?.name || userId
          })} />
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendPaymentOffer={handleSendPaymentOffer}
        onTyping={handleTyping}
        disabled={!connected && !connectionError}
        placeholder={connected ? "Type your message..." : connectionError ? "Click RETRY to reconnect" : "Connecting..."}
        chatId={chatId}
      />
    </div>
  )
}