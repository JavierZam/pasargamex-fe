'use client'

import { useState } from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import Link from 'next/link'

interface ChatInterfaceProps {
  className?: string
  initialChatId?: string | null
}

export function ChatInterface({ className = '', initialChatId = null }: ChatInterfaceProps) {
  const { user, loading: isLoading } = useFirebaseAuth()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId)
  const [selectedChatData, setSelectedChatData] = useState<any>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-gaming font-semibold text-white mb-2">Loading Chat System...</h3>
          <p className="text-gray-400">Initializing secure connection</p>
        </div>
      </div>
    )
  }

  // Show gaming login banner if not authenticated
  if (!user) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center p-8 max-w-md">
          <div className="bg-gradient-to-r from-brand-red/20 to-brand-blue/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 gaming-glow">
            <div className="text-4xl">🎮</div>
          </div>
          <h3 className="text-2xl font-gaming font-bold text-white mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue">
              JOIN THE GAME
            </span>
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Login to unlock real-time chat with sellers, negotiate epic deals, and complete secure transactions
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-2xl hover:shadow-xl hover:shadow-brand-red/30 transition-all duration-300 font-gaming font-semibold gaming-glow transform hover:scale-105"
          >
            🚀 LOGIN TO CHAT
          </Link>
          <div className="mt-4 text-sm text-gray-400">
            💬 Chat • 💰 Trade • 🏆 Win
          </div>
        </div>
      </div>
    )
  }

  const handleChatSelect = (chatId: string, chatData?: any) => {
    setSelectedChatId(chatId)
    setSelectedChatData(chatData)
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleCloseChat = () => {
    setSelectedChatId(null)
  }

  return (
    <div className={`h-full flex ${className}`}>
      {/* Gaming Chat List Sidebar */}
      <div className={`
        w-full sm:w-80 flex-shrink-0 
        ${selectedChatId ? 'hidden sm:block' : 'block'}
      `}>
        <ChatList
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Gaming Chat Window */}
      <div className={`
        flex-1 
        ${selectedChatId ? 'block' : 'hidden sm:block'}
      `}>
        <ChatWindow
          chatId={selectedChatId}
          chatTitle={selectedChatData?.participants?.find(p => p.user_id !== user?.uid)?.name || 'Gaming Chat'}
          participants={selectedChatData?.participants || []}
          productId={selectedChatData?.product_id}
          onClose={handleCloseChat}
          chatData={selectedChatData}
        />
      </div>

      {/* Gaming New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-bg-dark-secondary to-bg-dark-accent border border-gray-700/50 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-red to-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 gaming-glow">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-gaming font-bold text-white mb-2">Start New Conversation</h3>
            </div>
            <p className="text-gray-300 mb-6 text-center leading-relaxed">
              New chat functionality will be implemented when needed. 
              For now, chats are created automatically when you interact with products or sellers.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-8 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-xl font-gaming font-semibold hover:shadow-xl hover:shadow-brand-red/30 transition-all duration-300 transform hover:scale-105"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}