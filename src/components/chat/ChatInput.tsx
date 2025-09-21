'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface ChatInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'offer', attachments?: string[]) => void
  onSendPaymentOffer: (amount: number, productId: string, description: string) => void
  onTyping: (typing: boolean) => void
  disabled?: boolean
  placeholder?: string
  chatId?: string
}

export function ChatInput({ 
  onSendMessage, 
  onSendPaymentOffer, 
  onTyping, 
  disabled = false,
  placeholder = "Type your message...",
  chatId
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    productId: '',
    description: ''
  })
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { userToken: token } = useFirebaseAuth()

  const handleTyping = useCallback((isTyping: boolean) => {
    // Prevent spam by debouncing typing events
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Only send typing event if state actually changes
    if (isTyping && !isTypingRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        onTyping(true)
        isTypingRef.current = true
        console.log('✍️ Started typing')
      }, 300) // 300ms debounce
    }
    
    if (isTyping) {
      // Clear existing stop timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      
      // Set new timer to stop typing after 2 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          onTyping(false)
          isTypingRef.current = false
          console.log('✋ Stopped typing (timeout)')
        }
      }, 2000)
    } else {
      // Explicitly stop typing
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = null
      }
      if (isTypingRef.current) {
        onTyping(false)
        isTypingRef.current = false
        console.log('✋ Stopped typing (manual)')
      }
    }
  }, [onTyping])

  const handleInputChange = (value: string) => {
    setMessage(value)
    
    // Only trigger typing if there's actual content
    if (value.trim().length > 0) {
      handleTyping(true)
    } else {
      handleTyping(false)
    }
  }

  const handleSend = async () => {
    if (message.trim() && !disabled && chatId) {
      // Only use WebSocket for real-time messaging to avoid conflicts
      onSendMessage(message.trim())
      setMessage('')
      handleTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // In a real app, you'd upload to your file storage service here
    // For now, we'll simulate with placeholder URLs
    const attachments: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        // Create temporary URL for preview
        const url = URL.createObjectURL(file)
        attachments.push(url)
      }
    }

    if (attachments.length > 0) {
      onSendMessage('Image uploaded', 'image', attachments)
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendPaymentOffer = () => {
    const amount = parseFloat(paymentData.amount)
    if (amount > 0 && paymentData.description.trim()) {
      onSendPaymentOffer(amount, paymentData.productId, paymentData.description)
      setPaymentData({ amount: '', productId: '', description: '' })
      setShowPaymentModal(false)
    }
  }

  return (
    <>
      <div className="border-t border-gray-700/50 bg-gradient-to-r from-bg-dark-secondary to-bg-dark-accent p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none min-h-[48px] max-h-[120px] rounded-xl border border-gray-600/50 bg-bg-dark-primary/50 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red disabled:opacity-50 disabled:cursor-not-allowed gaming-glow-white transition-all duration-300"
              rows={1}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="bg-bg-dark-primary/50 border-gray-600/50 text-gray-300 hover:bg-brand-blue/20 hover:border-brand-blue/50 hover:text-white p-3 rounded-xl transition-all duration-300 gaming-glow-white"
              title="Upload image"
            >
              📎
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              disabled={disabled}
              className="bg-bg-dark-primary/50 border-gray-600/50 text-gray-300 hover:bg-neon-yellow/20 hover:border-neon-yellow/50 hover:text-neon-yellow p-3 rounded-xl transition-all duration-300 gaming-glow-white"
              title="Send payment offer"
            >
              💰
            </Button>
            
            <Button
              type="button"
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              size="sm"
              className="bg-gradient-to-r from-brand-red to-brand-blue hover:shadow-xl hover:shadow-brand-red/30 text-white px-6 py-3 rounded-xl font-gaming font-semibold transition-all duration-300 transform hover:scale-105 gaming-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              SEND
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Gaming Payment offer modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="💰 SEND PAYMENT OFFER"
      >
        <div className="space-y-6 bg-gradient-to-br from-bg-dark-secondary to-bg-dark-accent p-6 rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-yellow to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 gaming-glow">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-gaming font-bold text-white">GAMING TRANSACTION</h3>
          </div>
          
          <div>
            <label className="block text-sm font-gaming font-semibold text-white mb-2">
              💵 AMOUNT (IDR)
            </label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 bg-bg-dark-primary/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-yellow focus:border-neon-yellow gaming-glow-white transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-gaming font-semibold text-white mb-2">
              🎮 PRODUCT ID (optional)
            </label>
            <input
              type="text"
              value={paymentData.productId}
              onChange={(e) => setPaymentData(prev => ({ ...prev, productId: e.target.value }))}
              placeholder="Enter product ID"
              className="w-full px-4 py-3 bg-bg-dark-primary/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue gaming-glow-white transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-gaming font-semibold text-white mb-2">
              📝 DESCRIPTION
            </label>
            <input
              type="text"
              value={paymentData.description}
              onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Payment for gaming item..."
              className="w-full px-4 py-3 bg-bg-dark-primary/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red gaming-glow-white transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSendPaymentOffer}
              disabled={!paymentData.amount || !paymentData.description.trim()}
              className="bg-gradient-to-r from-neon-green to-green-600 hover:shadow-xl hover:shadow-neon-green/30 text-white flex-1 py-3 rounded-xl font-gaming font-semibold transition-all duration-300 transform hover:scale-105 gaming-glow"
            >
              🚀 SEND OFFER
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="bg-bg-dark-primary/50 border-gray-600/50 text-gray-300 hover:bg-red-600/20 hover:border-red-500/50 hover:text-white py-3 px-6 rounded-xl font-gaming transition-all duration-300"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}