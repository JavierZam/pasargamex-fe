'use client'

import { useEffect, useState, useRef } from 'react'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { buildApiUrl, API_CONFIG } from '@/lib/config'

// Hook for managing active chat
export function useActiveChat(chatId: string | null) {
  const webSocket = useWebSocketContext()
  const [previousChatId, setPreviousChatId] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const { user, userToken: token } = useFirebaseAuth()

  // Load messages from backend when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId || !token) return
      
      try {
        setLoadingMessages(true)
        
        // Load messages from backend API (from test file)
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.CHATS}/${chatId}/messages`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.success && data.data.items) {
            // Transform backend messages to frontend format
            const transformedMessages = data.data.items.map(msg => ({
              id: msg.id,
              chat_id: chatId,
              sender_id: msg.sender_id,
              sender_name: msg.sender_name || 'Unknown',
              content: msg.content,
              type: msg.type || 'text',
              timestamp: msg.created_at || msg.timestamp,
              status: msg.status || 'delivered', // Default to delivered since message exists in backend
              attachment_urls: msg.attachment_urls || [],
              metadata: msg.metadata || {}
            })).sort((a, b) => 
              // Sort ascending: oldest first, newest last (like WhatsApp)
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
            
            // Update messages state properly to trigger re-render
            console.log(`📥 [useActiveChat] Loaded ${transformedMessages.length} messages for chat ${chatId}`)
            webSocket.setMessages(prev => ({
              ...prev,
              [chatId]: transformedMessages
            }))
            
            // Send read receipts for unread messages from other users (not our own messages)
            const unreadMessagesFromOthers = transformedMessages.filter(msg => 
              msg.sender_id !== user?.uid && // Not sent by current user
              msg.status !== 'read' // Not already read
            )
            
            if (unreadMessagesFromOthers.length > 0) {
              console.log(`📖 [useActiveChat] Sending read receipts for ${unreadMessagesFromOthers.length} unread messages from others in chat ${chatId}`)
              
              // Send read receipts for each unread message from other users
              // Use setTimeout to avoid race conditions with WebSocket connection
              setTimeout(() => {
                unreadMessagesFromOthers.forEach(msg => {
                  webSocket.markMessageAsRead(chatId, msg.id)
                })
              }, 500)
            } else {
              console.log(`📋 [useActiveChat] Chat ${chatId} loaded with ${transformedMessages.length} messages, no unread messages from others`)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setLoadingMessages(false)
      }
    }

    if (chatId && chatId !== previousChatId) {
      loadMessages()
    }
  }, [chatId, token, previousChatId])

  // Track the currently joined room with a ref to avoid stale closures
  const joinedRoomRef = useRef<string | null>(null)

  useEffect(() => {
    console.log('🔄 [useActiveChat] Join room effect:', {
      connected: webSocket.connected,
      chatId: chatId?.substring(0, 8),
      currentlyJoined: joinedRoomRef.current?.substring(0, 8),
      hasJoinFunction: !!webSocket.joinChatRoom,
    })
    
    // If not connected or no chatId, ensure we're marked as not joined
    if (!webSocket.connected || !chatId) {
      console.log('⏸️ [useActiveChat] Skipping join - not connected or no chatId')
      // Clear the ref but don't send leave (not connected)
      joinedRoomRef.current = null
      return
    }

    // If we need to join a different room, leave the old one first
    if (joinedRoomRef.current && joinedRoomRef.current !== chatId) {
      console.log('🚪 [useActiveChat] Leaving previous chat room:', joinedRoomRef.current.substring(0, 8) + '...')
      webSocket.leaveChatRoom(joinedRoomRef.current)
      joinedRoomRef.current = null
    }

    // Join the new room if not already joined
    if (joinedRoomRef.current !== chatId) {
      console.log('🏠 [useActiveChat] Joining chat room:', chatId.substring(0, 8) + '...')
      webSocket.joinChatRoom(chatId)
      joinedRoomRef.current = chatId
      console.log('✅ [useActiveChat] Joined room:', chatId.substring(0, 8) + '...')
      
      // Also update previousChatId for the load messages effect
      setPreviousChatId(chatId)
    } else {
      console.log('⏭️ [useActiveChat] Already in this chat room:', chatId.substring(0, 8) + '...')
    }

    // Cleanup function - leave room on unmount or when dependencies change
    return () => {
      if (joinedRoomRef.current) {
        console.log('🧹 [useActiveChat] Cleanup - leaving chat room:', joinedRoomRef.current.substring(0, 8) + '...')
        webSocket.leaveChatRoom(joinedRoomRef.current)
        joinedRoomRef.current = null
      }
    }
  }, [chatId, webSocket.connected, webSocket.joinChatRoom, webSocket.leaveChatRoom])

  return {
    ...webSocket,
    messages: chatId ? webSocket.messages[chatId] || [] : [],
    typingUsers: chatId ? webSocket.typingUsers[chatId] || [] : [],
    loadingMessages
  }
}