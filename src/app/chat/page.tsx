'use client'

import Header from '@/components/layout/header'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default function ChatPage() {
  return (
    <div className="h-screen bg-bg-dark-primary flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Full Screen Chat Interface - Fixed height, only chat room scrollable */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface className="h-full" />
      </div>
    </div>
  )
}