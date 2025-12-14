'use client'

import { useState } from 'react'
import { ChatMessage } from '@/services/websocket'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { isValidAvatarUrl } from '@/lib/chat-utils'
import { useRole } from '@/contexts/AuthContext'

interface ChatMessageProps {
  message: ChatMessage
  isCurrentUser: boolean
  onPaymentAction?: (messageId: string, action: 'accept' | 'reject') => void
}

export function ChatMessageComponent({ message, isCurrentUser, onPaymentAction }: ChatMessageProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const { isBuyer, isSeller, role } = useRole()
  
  const formatTime = (timestamp: string) => {
    try {
      return formatRelativeTime(timestamp)
    } catch {
      return 'Just now'
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="m-0 whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )
        
      case 'image':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
            {message.attachment_urls?.map((url, index) => (
              <div key={index} className="relative max-w-xs">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
                    <div className="text-gray-400 text-sm">Loading...</div>
                  </div>
                )}
                <img
                  src={url}
                  alt="Attachment"
                  className="rounded-lg max-w-full h-auto"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>
            ))}
          </div>
        )
        
      case 'offer':
        const offerData = message.metadata
        return (
          <div className="bg-gradient-to-br from-neon-yellow/10 to-yellow-600/10 border border-neon-yellow/30 rounded-xl p-4 space-y-3 gaming-glow">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-neon-yellow to-yellow-600 text-black px-3 py-1 rounded-lg text-xs font-gaming font-semibold">
                💰 PAYMENT OFFER
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium text-white">{message.content}</p>
              {offerData && (
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-neon-yellow">
                      {offerData.currency || 'IDR'} {offerData.amount?.toLocaleString()}
                    </span>
                  </div>
                  {offerData.product_id && (
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-medium text-neon-green">{offerData.product_id}</span>
                    </div>
                  )}
                  {offerData.product_name && (
                    <div className="bg-bg-dark-primary/50 rounded-lg p-2 mt-2">
                      <div className="text-xs text-gray-400">Product Details</div>
                      <div className="text-white font-semibold">{offerData.product_name}</div>
                      {offerData.product_price && (
                        <div className="text-neon-green">Price: IDR {offerData.product_price.toLocaleString()}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!isCurrentUser && onPaymentAction && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onPaymentAction(message.id, 'accept')}
                  className="bg-gradient-to-r from-neon-green to-green-600 text-white font-gaming font-semibold gaming-glow hover:shadow-neon-green/30"
                >
                  💳 ACCEPT
                </Button>
                <Button
                  size="sm"
                  onClick={() => onPaymentAction(message.id, 'reject')}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white font-gaming font-semibold hover:bg-red-600"
                >
                  ❌ DECLINE
                </Button>
              </div>
            )}
          </div>
        )
        
      case 'product':
        // Enhanced product message type with purchase functionality like test file
        const productData = message.metadata
        return (
          <div className="bg-gradient-to-br from-brand-blue/10 to-blue-600/10 border border-brand-blue/30 rounded-xl p-4 space-y-3 gaming-glow">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-gaming font-semibold">
                🎮 PRODUCT SHOWCASE
              </div>
            </div>
            
            {productData && (
              <div className="bg-bg-dark-primary/30 rounded-lg p-3">
                <div className="flex gap-3">
                  {productData.image_url && (
                    <img 
                      src={productData.image_url} 
                      alt={productData.name} 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-600/30"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-gaming font-bold text-white text-base">{productData.name || 'Gaming Product'}</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">{productData.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-neon-green font-bold text-lg">
                        Rp {productData.price?.toLocaleString('id-ID') || '0'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Delivery: {productData.delivery || 'instant'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Purchase section - only show if user is a buyer and this is seller's product */}
                {!isCurrentUser && productData.price && isBuyer && (
                  <div className="mt-4 pt-3 border-t border-gray-600/30">
                    <div className="text-xs text-center text-gray-400 mb-2">
                      📋 Available for purchase by verified buyers • Your role: {role?.toUpperCase()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Trigger purchase flow - only buyers can purchase
                          if (onPaymentAction) {
                            onPaymentAction(message.id, 'accept')
                          }
                        }}
                        className="bg-gradient-to-r from-neon-green to-green-600 text-white font-gaming font-semibold px-6 py-2 flex-1 gaming-glow hover:shadow-neon-green/30 transition-all duration-300"
                      >
                        💳 Purchase This Item
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-neon-yellow to-yellow-600 text-black font-gaming font-semibold px-4 py-2 hover:shadow-neon-yellow/30"
                      >
                        📱 Ask Question
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      🔒 Secure transaction • 🛡️ Buyer protection • 👨‍💼 Middleman escrow
                    </div>
                  </div>
                )}

                {/* Show role restriction message for non-buyers */}
                {!isCurrentUser && productData.price && !isBuyer && (
                  <div className="mt-4 pt-3 border-t border-gray-600/30">
                    <div className="p-3 bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-red-400 font-gaming font-semibold text-sm mb-2">
                          🚫 PURCHASE RESTRICTED
                        </div>
                        <div className="text-xs text-red-300">
                          Only verified BUYERS can purchase items. Your current role: <span className="font-bold text-white">{role?.toUpperCase() || 'UNKNOWN'}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Contact admin to upgrade your account to buyer status
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credentials display for purchased items */}
                {productData.credentials && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-neon-green/15 to-green-600/10 border border-neon-green/40 rounded-xl gaming-glow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gradient-to-r from-neon-green to-green-600 text-black px-3 py-1 rounded-lg text-xs font-gaming font-bold">
                        🎮 ACCOUNT DELIVERED
                      </div>
                    </div>
                    
                    <div className="bg-bg-dark-primary/90 rounded-lg p-4 border border-gray-600/30">
                      <div className="grid grid-cols-1 gap-3 font-mono text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-semibold">Username:</span>
                          <span className="text-white font-bold bg-gray-800/50 px-3 py-1 rounded border">{productData.credentials.username}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-semibold">Password:</span>
                          <span className="text-white font-bold bg-gray-800/50 px-3 py-1 rounded border">{productData.credentials.password}</span>
                        </div>
                        {productData.credentials.email && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-semibold">Email:</span>
                            <span className="text-white font-bold bg-gray-800/50 px-3 py-1 rounded border">{productData.credentials.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-neon-green/10 rounded-lg border border-neon-green/30">
                      <div className="text-xs text-neon-green font-semibold text-center">
                        ✅ Transaction completed successfully - Please change password immediately for security
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
        
      case 'system':
        return (
          <div className="text-center">
            <Badge variant="info" className="bg-gray-100 text-gray-600">
              {message.content}
            </Badge>
          </div>
        )
        
      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
      case 'sent':
        return <div className="w-4 h-4 text-gray-400">✓</div>
      case 'delivered':
        return <div className="w-4 h-4 text-blue-500">✓✓</div>
      case 'read':
        return <div className="w-4 h-4 text-green-500">✓✓</div>
      case 'failed':
        return <div className="w-4 h-4 text-red-500" title="Message failed to send">❌</div>
      default:
        return null
    }
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        {renderMessageContent()}
      </div>
    )
  }

  return (
    <div className={`flex gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isCurrentUser && (
        <Avatar
          src={(message as any).sender_avatar && isValidAvatarUrl((message as any).sender_avatar) ? (message as any).sender_avatar : undefined}
          fallback={message.sender_name?.charAt(0)?.toUpperCase() || '?'}
          alt={message.sender_name}
          size="sm"
        />
      )}
      
      <div className={`flex-1 max-w-xs sm:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isCurrentUser && (
          <div className="text-sm font-medium text-gray-700 mb-1">
            {message.sender_name}
          </div>
        )}
        
        <div className={`
          rounded-lg px-4 py-2 relative
          ${isCurrentUser 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }
        `}>
          {renderMessageContent()}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{formatTime(message.timestamp)}</span>
          {isCurrentUser && getStatusIcon()}
        </div>
      </div>
    </div>
  )
}