'use client'

// Refactored ChatList using new ChatContext
import { useState } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface NewChatListProps {
  selectedChatId?: string | null
  onChatSelect: (chatId: string, chatData?: any) => void
  onNewChat?: () => void
}

export function NewChatList({ selectedChatId, onChatSelect, onNewChat }: NewChatListProps) {
  const { user } = useFirebaseAuth()
  const { chats, connected, connecting, error, userPresence } = useChat()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      chat.display_name?.toLowerCase().includes(query) ||
      chat.last_message?.content?.toLowerCase().includes(query) ||
      chat.participants.some(p => p.name.toLowerCase().includes(query))
    )
  })

  const formatLastMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const truncateMessage = (message: string | undefined, maxLength: number = 50) => {
    if (!message || message.trim() === '') return '💭 Ready to chat!'
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }

  const getPresenceStatus = (userId: string) => {
    const presence = userPresence[userId]
    return presence?.is_online ? 'online' : 'offline'
  }

  const getLastSeen = (userId: string) => {
    const presence = userPresence[userId]
    if (presence?.is_online) return 'online'
    if (presence?.last_seen) {
      return formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })
    }
    return 'long time ago'
  }

  if (connecting) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-dark-secondary/80">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin mx-auto mb-6 gaming-glow"></div>
          <p className="text-white font-gaming font-semibold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Loading Gaming Hub...</p>
          <div className="text-sm text-gray-300 mt-3 animate-pulse">🎮 Connecting to chat service</div>
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
            MESSAGES {!connected && '(OFFLINE)'}
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

      {/* Connection Status */}
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
                {searchQuery ? 'No Matches Found' : connected ? 'Ready to Connect' : 'Connecting...'}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {searchQuery 
                  ? 'Try different keywords or browse all conversations' 
                  : connected
                  ? 'Start chatting with sellers and players worldwide. Your gaming conversations will appear here.'
                  : 'Establishing connection to chat servers...'
                }
              </p>
              {onNewChat && !searchQuery && connected && (
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
              const isSelected = selectedChatId === chat.id
              const otherParticipant = chat.other_participant
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id, chat)}
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
                    <div className="relative">
                      <Avatar
                        src={otherParticipant?.avatar}
                        fallback={otherParticipant?.name?.charAt(0).toUpperCase() || '🎮'}
                        size="md"
                      />
                      {/* Online status indicator */}
                      {otherParticipant && (
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-bg-dark-secondary rounded-full ${
                          getPresenceStatus(otherParticipant.user_id) === 'online' 
                            ? 'bg-neon-green animate-pulse' 
                            : 'bg-gray-500'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 relative">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white truncate font-gaming text-base bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          {chat.display_name || 'Unknown Player'}
                        </h3>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Timestamp */}
                          <span className="text-xs text-gray-300 font-medium">
                            {chat.last_message?.timestamp 
                              ? formatLastMessageTime(chat.last_message.timestamp)
                              : formatLastMessageTime(chat.updated_at)
                            }
                          </span>
                          
                          {/* Unread count */}
                          {chat.unread_count > 0 && (
                            <div className="bg-gradient-to-r from-brand-red via-neon-purple to-brand-blue text-white text-xs min-w-[22px] h-6 flex items-center justify-center rounded-full font-bold gaming-glow shadow-lg animate-pulse">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Last message or status */}
                        <p className="text-sm text-gray-300 truncate flex-1">
                          {chat.last_message ? (
                            <>
                              {chat.last_message.type === 'offer' && '💰 '}
                              {chat.last_message.type === 'image' && '📷 '}
                              {chat.last_message.status === 'sending' && '📤 '}
                              {truncateMessage(chat.last_message.content)}
                              {/* Message status indicators */}
                              {chat.last_message.sender_id === user?.uid && (
                                <span className="ml-2">
                                  {chat.last_message.status === 'sending' && '⏳'}
                                  {chat.last_message.status === 'sent' && '✓'}
                                  {chat.last_message.status === 'delivered' && '✓✓'}
                                  {chat.last_message.status === 'read' && <span className="text-neon-green">✓✓</span>}
                                </span>
                              )}
                            </>
                          ) : (
                            '💭 Ready to chat'
                          )}
                        </p>
                        
                        {/* User role badge */}
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
                      
                      {/* Product chat indicator */}
                      {chat.product_id && (
                        <div className="mt-2">
                          <span className="text-xs bg-gradient-to-r from-neon-purple/20 to-purple-600/20 text-neon-purple border border-neon-purple/30 px-2 py-1 rounded-lg font-gaming">
                            🎮 Product Chat
                          </span>
                        </div>
                      )}
                      
                      {/* Debug info in development */}
                      {process.env.NODE_ENV === 'development' && otherParticipant && (
                        <div className="mt-1 text-xs text-gray-500 font-mono">
                          🐛 user_id={otherParticipant.user_id?.substring(0, 8)} | status={getPresenceStatus(otherParticipant.user_id)} | last_seen={getLastSeen(otherParticipant.user_id)}
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