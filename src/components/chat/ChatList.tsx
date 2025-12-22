'use client'

import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { ChatRoom } from '@/services/websocket'
import wsService from '@/services/websocket'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { truncateMessage, isValidAvatarUrl, getRoleBadgeClasses } from '@/lib/chat-utils'
import { buildApiUrl, API_CONFIG } from '@/lib/config'

interface ChatListProps {
  selectedChatId?: string | null
  onChatSelect: (chatId: string, chatData?: any) => void
  onNewChat?: () => void
}

export function ChatList({ selectedChatId, onChatSelect, onNewChat }: ChatListProps) {
  const { user, userToken: token } = useFirebaseAuth()
  const { messages, connected, userPresence } = useWebSocketContext()
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Cache for usernames to avoid repeated API calls
  const usernameCache = useState<Record<string, string>>({})

  // Load username from backend API
  const loadUsername = async (userId: string): Promise<string> => {
    if (!userId) return 'Gaming User'
    
    if (usernameCache[0][userId]) {
      console.log(`Username from cache for ${userId}:`, usernameCache[0][userId])
      return usernameCache[0][userId]
    }

    try {
      console.log(`Loading username from API for user ID: ${userId}`)
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`API response status for ${userId}:`, response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`API response data for ${userId}:`, data)
        
        if (data.success && data.data) {
          const username = data.data.username || data.data.display_name || data.data.name || `User-${userId.slice(-4)}`
          console.log(`Found username for ${userId}:`, username)
          usernameCache[1](prev => ({ ...prev, [userId]: username }))
          return username
        }
      } else {
        console.log(`API error for ${userId}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.error(`Failed to load username for ${userId}:`, error)
    }

    const fallbackName = `Player-${userId.slice(-4)}`
    console.log(`Using fallback name for ${userId}:`, fallbackName)
    usernameCache[1](prev => ({ ...prev, [userId]: fallbackName }))
    return fallbackName
  }

  // Load chat rooms from API - using real backend endpoints from test file
  useEffect(() => {
    const loadChats = async () => {
      if (!token) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Use the real backend API endpoint from test file
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CHATS), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to load chats')
        }
        
        const data = await response.json()
        
        if (data.success && data.data && data.data.items) {
          console.log('Raw chat data from backend:', JSON.stringify(data.data.items, null, 2))
          
          // Transform backend data to frontend format based on actual backend structure from test file
          const transformedChats = await Promise.all(data.data.items.map(async (chat: any) => {
            console.log('Processing chat:', chat)
            
            // Load detailed participants data using separate participants API like in test file
            let participantsWithNames = []
            try {
              if (chat?.id) {
                console.log(`Loading participants for chat ${chat.id}`)
                const participantsResponse = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.CHATS}/${chat.id}/participants`), {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                if (participantsResponse.ok) {
                  const participantsData = await participantsResponse.json()
                  console.log(`Participants API response for ${chat.id}:`, JSON.stringify(participantsData, null, 2))
                  
                  if (participantsData.success && participantsData.data && participantsData.data.participants) {
                    participantsWithNames = participantsData.data.participants.map((p: any) => ({
                      user_id: p.user_id || p.id || '',
                      name: p.username || p.display_name || p.name || `Player-${(p.user_id || '').slice(-4)}`,
                      avatar: p.avatar || p.profile_picture,
                      role: p.role || 'buyer'
                    }))
                    console.log(`Processed ${participantsWithNames.length} participants for chat ${chat.id}`)
                  }
                }
              }
              
              // Fallback to original participants if API call fails
              if (participantsWithNames.length === 0) {
                console.log('Using fallback participants from chat data')
                participantsWithNames = await Promise.all(
                  (chat?.participants || []).map(async (p: any) => {
                    const userId = p?.user_id || p?.id || ''
                    let displayName = p?.username || p?.display_name || p?.name
                    
                    if (!displayName && userId) {
                      displayName = await loadUsername(userId)
                    }
                    
                    return {
                      user_id: userId,
                      name: displayName || `Player-${userId.slice(-4)}`,
                      avatar: p?.avatar || p?.profile_picture,
                      role: p?.role || (p?.user_id === user?.uid ? 'buyer' : 'seller')
                    }
                  })
                )
              }
            } catch (error) {
              console.error(`Error loading participants for chat ${chat?.id}:`, error)
              participantsWithNames = []
            }

            return {
              id: chat?.id || Math.random().toString(),
              participants: participantsWithNames,
              last_message: chat?.last_message ? {
                id: Math.random().toString(),
                chat_id: chat?.id || '',
                sender_id: '',
                sender_name: 'Gaming User',
                content: typeof chat.last_message === 'string' ? chat.last_message : (chat.last_message?.content || ''),
                type: 'text',
                timestamp: chat?.last_message_at || chat?.updated_at || new Date().toISOString(),
                status: 'delivered',
                attachment_urls: [],
                metadata: {}
              } : null,
              unread_count: chat?.unread_count || 0,
              created_at: chat?.created_at || new Date().toISOString(),
              updated_at: chat?.updated_at || new Date().toISOString(),
              product_id: chat?.product_id
            }
          }))
          
          // Sort chats by last message timestamp (newest first) - fix sorting issue
          const sortedChats = transformedChats.sort((a, b) => {
            const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : new Date(a.updated_at).getTime()
            const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : new Date(b.updated_at).getTime()
            return bTime - aTime
          })
          
          console.log('Transformed and sorted chats:', sortedChats.map(c => ({
            id: c.id.substring(0, 8),
            last_msg_timestamp: c.last_message?.timestamp,
            updated_at: c.updated_at
          })))
          setChats(sortedChats)
        } else {
          console.log('No chats found in response:', data)
          setChats([])
        }
      } catch (error) {
        console.error('Failed to load chat rooms:', error)
        setError('Failed to load conversations from backend')
        setChats([])
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [token, user])

  // Listen for chat_list_update events from WebSocket (for updates when not inside a chat room)
  useEffect(() => {
    const handleChatUpdate = (data: any) => {
      if (data.type === 'chat_list_update') {
        console.log('📋 Chat list update received:', data)
        
        setChats(prevChats => {
          const chatId = data.chat_id
          const chatIndex = prevChats.findIndex(c => c.id === chatId)
          
          if (chatIndex === -1) {
            // Chat not in list, skip (will be loaded on next page load)
            return prevChats
          }
          
          const updatedChats = [...prevChats]
          const existingChat = updatedChats[chatIndex]
          
          // Update the chat with new message info
          updatedChats[chatIndex] = {
            ...existingChat,
            last_message: {
              id: `update-${Date.now()}`,
              chat_id: chatId,
              sender_id: data.sender_id,
              sender_name: data.sender_name || 'User',
              content: data.last_message,
              type: data.message_type || 'text',
              timestamp: data.last_message_at,
              status: 'delivered',
              attachment_urls: [],
              metadata: {}
            },
            updated_at: data.last_message_at,
            // Only increment unread if this chat is NOT currently selected
            unread_count: chatId === selectedChatId ? 0 : (existingChat.unread_count || 0) + 1
          }
          
          // Re-sort to move this chat to top
          updatedChats.sort((a, b) => {
            const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : new Date(a.updated_at || a.created_at).getTime()
            const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : new Date(b.updated_at || b.created_at).getTime()
            return bTime - aTime
          })
          
          console.log('✅ Chat list updated, moved chat to top:', chatId.substring(0, 8))
          return updatedChats
        })
      }
    }

    const unsubscribe = wsService.onChatUpdate(handleChatUpdate)
    return () => { unsubscribe() }
  }, [user?.uid])

  // Real-time update chat list when NEW messages arrive (not when loading old messages)
  useEffect(() => {
    // Batch update: compute a single updated chats array and set it once to avoid repeated moves
    if (Object.keys(messages).length === 0) {
      return
    }

    setChats(prevChats => {
      // Map existing chats for quick lookup
      const chatMap = new Map<string, ChatRoom>()
      prevChats.forEach(c => chatMap.set(c.id, c))

      // For each chat in messages, decide whether to update its last_message
      Object.entries(messages).forEach(([chatId, chatMessages]) => {
        if (!chatMessages || chatMessages.length === 0) return

        const lastMessage = chatMessages[chatMessages.length - 1]
        const messageAge = Date.now() - new Date(lastMessage.timestamp).getTime()
        const isOptimisticMessage = lastMessage.id.includes('temp-')

        // Skip messages that are too old (not relevant for 'recent conversations')
        if (!isOptimisticMessage && messageAge > 60000) {
          // old message, ignore for ordering
          return
        }

        const existingChat = chatMap.get(chatId)
        const prevTimestamp = existingChat?.last_message?.timestamp ? new Date(existingChat.last_message.timestamp).getTime() : new Date(existingChat?.updated_at || existingChat?.created_at || 0).getTime()
        const lastMsgTime = new Date(lastMessage.timestamp).getTime()

        // Only update if the incoming message is newer than what we already have
        if (!existingChat || lastMsgTime >= prevTimestamp) {
          const updatedChat: ChatRoom = existingChat ? { ...existingChat } : {
            id: chatId,
            participants: [],
            last_message: undefined,
            unread_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_id: undefined
          }

          updatedChat.last_message = {
            id: lastMessage.id,
            chat_id: chatId,
            sender_id: lastMessage.sender_id,
            sender_name: lastMessage.sender_name,
            content: lastMessage.content || 'New message',
            type: lastMessage.type,
            timestamp: lastMessage.timestamp,
            status: lastMessage.status,
            attachment_urls: lastMessage.attachment_urls || [],
            metadata: lastMessage.metadata || {}
          }

          updatedChat.updated_at = new Date().toISOString()
          // If message from someone else AND this chat is not currently selected, increment unread
          if (lastMessage.sender_id !== user?.uid && chatId !== selectedChatId) {
            updatedChat.unread_count = (existingChat?.unread_count || 0) + 1
          } else if (chatId === selectedChatId) {
            updatedChat.unread_count = 0 // Reset if currently viewing
          }

          chatMap.set(chatId, updatedChat)
        }
      })

      // Build merged array preserving chats that weren't modified, and sort by last_message timestamp desc
      const merged = Array.from(chatMap.values())
      merged.sort((a, b) => {
        const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : new Date(a.updated_at || a.created_at).getTime()
        const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : new Date(b.updated_at || b.created_at).getTime()
        return bTime - aTime
      })

      console.log('✅ Chat list sorted; total:', merged.length, 'Top:', merged[0]?.id?.substring(0,8))
      return merged
    })
  }, [messages, user?.uid, selectedChatId])

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      chat.participants.some(p => p.name.toLowerCase().includes(query)) ||
      (typeof chat.last_message === 'string' ? chat.last_message : chat.last_message?.content)?.toLowerCase().includes(query)
    )
  })

  const getOtherParticipant = (chat: ChatRoom) => {
    return chat.participants.find(p => p.user_id !== user?.uid)
  }

  const formatLastMessageTime = (timestamp: string) => {
    try {
      return formatRelativeTime(timestamp)
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-dark-secondary/80">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin mx-auto mb-6 gaming-glow"></div>
          <p className="text-white font-gaming font-semibold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Loading Gaming Hub...</p>
          <div className="text-sm text-gray-300 mt-3 animate-pulse">🎮 Fetching your conversations</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-bg-dark-secondary/80 border-r border-gray-700/50">
      {/* Gaming Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-br from-bg-dark-primary via-bg-dark-secondary to-bg-dark-primary/90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-gaming font-bold bg-gradient-to-r from-brand-red via-neon-purple to-brand-blue bg-clip-text text-transparent drop-shadow-lg">
            MESSAGES
          </h2>
          {onNewChat && (
            <Button
              onClick={onNewChat}
              size="sm"
              className="bg-gradient-to-r from-brand-red via-neon-purple to-brand-blue text-white font-gaming text-xs px-4 py-2 rounded-xl gaming-glow hover:shadow-lg hover:shadow-brand-red/40 transition-all duration-300 transform hover:scale-105 border border-white/20"
            >
              + NEW CHAT
            </Button>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-purple/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search players, sellers..."
            className="w-full bg-gradient-to-r from-bg-dark-primary/70 to-bg-dark-secondary/70 border border-gray-600/30 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-neon-purple gaming-glow transition-all duration-300 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Gaming Error state */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-900/30 to-red-600/20 border-b border-red-400/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-red-400 text-lg animate-pulse">⚠️</div>
            <div className="text-red-200 text-sm font-gaming font-semibold">{error}</div>
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-red/30 via-neon-purple/30 to-brand-blue/30 rounded-full flex items-center justify-center mx-auto mb-6 gaming-glow border border-white/10 backdrop-blur-sm">
                <div className="text-4xl animate-pulse">💬</div>
              </div>
              <h3 className="text-white font-gaming font-bold mb-3 text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {searchQuery ? 'No Matches Found' : 'Ready to Connect'}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {searchQuery ? 'Try different keywords or browse all conversations' : 'Start chatting with sellers and players worldwide. Your gaming conversations will appear here.'}
              </p>
              {onNewChat && !searchQuery && (
                <Button
                  onClick={onNewChat}
                  className="bg-gradient-to-r from-brand-red via-neon-purple to-brand-blue text-white px-8 py-3 rounded-xl text-sm font-gaming font-semibold gaming-glow hover:shadow-lg hover:shadow-brand-red/40 transition-all duration-300 transform hover:scale-105 border border-white/20"
                >
                  🚀 Start Gaming Chat
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/30">
            {filteredChats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat)
              const isSelected = selectedChatId === chat.id
              
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    // Reset unread count when user opens this chat
                    if (chat.unread_count > 0) {
                      setChats(prevChats => 
                        prevChats.map(c => 
                          c.id === chat.id ? { ...c, unread_count: 0 } : c
                        )
                      )
                    }
                    onChatSelect(chat.id, chat)
                  }}
                  className={`
                    p-4 cursor-pointer transition-all duration-300 border-l-4 border-transparent relative overflow-hidden
                    ${isSelected 
                      ? 'bg-gradient-to-r from-brand-red/20 via-neon-purple/15 to-brand-blue/20 border-l-brand-red gaming-glow backdrop-blur-sm' 
                      : 'hover:bg-gradient-to-r hover:from-bg-dark-primary/60 hover:to-bg-dark-secondary/60 hover:border-l-neon-purple/60 hover:backdrop-blur-sm'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-red/5 via-neon-purple/5 to-brand-blue/5 animate-pulse" />
                  )}
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={isValidAvatarUrl(otherParticipant?.avatar) ? otherParticipant?.avatar : undefined}
                      fallback={otherParticipant?.name?.charAt(0).toUpperCase() || '🎮'}
                      size="md"
                    />
                    
                    <div className="flex-1 min-w-0 relative">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white truncate font-gaming text-base bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          {otherParticipant?.name || 'Unknown Player'}
                        </h3>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-300 font-medium">
                            {chat.last_message?.timestamp 
                              ? formatLastMessageTime(chat.last_message.timestamp)
                              : formatLastMessageTime(chat.updated_at || chat.created_at)
                            }
                          </span>
                          
                          {chat.unread_count > 0 && (
                            <div className="bg-gradient-to-r from-brand-red via-neon-purple to-brand-blue text-white text-xs min-w-[22px] h-6 flex items-center justify-center rounded-full font-bold gaming-glow shadow-lg animate-pulse">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300 truncate flex-1">
                          {chat.last_message && chat.last_message.content ? (
                            <>
                              {chat.last_message.type === 'offer' && '💰 '}
                              {chat.last_message.type === 'image' && '📷 '}
                              {truncateMessage(chat.last_message.content)}
                            </>
                          ) : (
                            '💭 Ready to chat'
                          )}
                        </p>
                        
                        {otherParticipant && (
                          <Badge
                            className={`text-xs ml-3 flex-shrink-0 font-bold px-3 py-1 rounded-lg border backdrop-blur-sm ${
                              otherParticipant.role === 'admin' 
                                ? 'bg-gradient-to-r from-red-600/80 to-red-700/80 text-white border-red-400/50 shadow-lg shadow-red-500/20' 
                                : otherParticipant.role === 'seller'
                                ? 'bg-gradient-to-r from-neon-green/30 to-green-500/30 text-neon-green border-neon-green/50 shadow-lg shadow-neon-green/20'
                                : 'bg-gradient-to-r from-brand-blue/30 to-blue-500/30 text-brand-blue-light border-brand-blue/50 shadow-lg shadow-brand-blue/20'
                            }`}
                          >
                            {otherParticipant.role.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      {chat.product_id && (
                        <div className="mt-2">
                          <span className="text-xs bg-gradient-to-r from-neon-purple/20 to-purple-600/20 text-neon-purple border border-neon-purple/30 px-2 py-1 rounded-lg font-gaming">
                            🎮 Product Chat
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}