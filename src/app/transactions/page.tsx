'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner, PriceDisplay, Badge } from '@/components/ui'

interface Transaction {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: 'pending' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled'
  delivery_method: 'instant' | 'middleman' | 'both'
  midtrans_order_id?: string
  midtrans_redirect_url?: string
  payment_deadline?: string
  created_at: string
  updated_at: string
  product?: {
    id: string
    title: string
    description: string
    images: Array<{ id: string; url: string; display_order: number }>
    type: string
    game_title_id: string
  }
  buyer?: {
    id: string
    username: string
    email: string
  }
  seller?: {
    id: string
    username: string
    email: string
  }
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  disputed: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const STATUS_LABELS = {
  pending: 'Pending Payment',
  paid: 'Paid',
  delivered: 'Delivered',
  completed: 'Completed',
  disputed: 'Disputed',
  cancelled: 'Cancelled'
}

export default function TransactionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      loadTransactions()
    }
  }, [authLoading, isAuthenticated, activeTab, statusFilter, currentPage])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      // Mock transaction loading since backend endpoint might not be fully implemented
      // In real scenario, this would be: await apiClient.getTransactions({...})
      
      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          product_id: 'prod_001',
          buyer_id: user?.uid === 'buyer123' ? 'buyer123' : 'other_buyer',
          seller_id: user?.uid === 'seller456' ? 'seller456' : 'other_seller',
          amount: 150000,
          status: 'completed',
          delivery_method: 'middleman',
          midtrans_order_id: 'order_123',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          product: {
            id: 'prod_001',
            title: 'Genshin Impact AR 60 Account',
            description: 'Premium account with all 5-star characters',
            images: [{ id: 'img1', url: '/api/placeholder-image?text=Genshin&width=300&height=200', display_order: 0 }],
            type: 'account',
            game_title_id: 'game_001'
          },
          buyer: {
            id: 'buyer123',
            username: 'GamerBoy99',
            email: 'gamer@example.com'
          },
          seller: {
            id: 'seller456',
            username: 'ProGameSeller',
            email: 'seller@example.com'
          }
        },
        {
          id: 'txn_002',
          product_id: 'prod_002',
          buyer_id: user?.uid === 'buyer123' ? 'buyer123' : 'other_buyer',
          seller_id: user?.uid === 'seller456' ? 'seller456' : 'other_seller',
          amount: 75000,
          status: 'pending',
          delivery_method: 'instant',
          payment_deadline: '2024-02-01T23:59:59Z',
          created_at: '2024-01-20T15:45:00Z',
          updated_at: '2024-01-20T15:45:00Z',
          product: {
            id: 'prod_002',
            title: 'Mobile Legends 10000 Diamonds',
            description: 'Top-up service for Mobile Legends diamonds',
            images: [{ id: 'img2', url: '/api/placeholder-image?text=ML&width=300&height=200', display_order: 0 }],
            type: 'topup',
            game_title_id: 'game_002'
          },
          buyer: {
            id: 'buyer123',
            username: 'GamerBoy99',
            email: 'gamer@example.com'
          },
          seller: {
            id: 'seller456',
            username: 'TopUpKing',
            email: 'topup@example.com'
          }
        }
      ]

      // Filter based on active tab and status
      let filteredTransactions = mockTransactions
      
      if (activeTab === 'buying') {
        filteredTransactions = filteredTransactions.filter(t => t.buyer_id === user?.uid)
      } else if (activeTab === 'selling') {
        filteredTransactions = filteredTransactions.filter(t => t.seller_id === user?.uid)
      }
      
      if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter)
      }

      setTransactions(filteredTransactions)
      setTotalItems(filteredTransactions.length)
      setTotalPages(Math.ceil(filteredTransactions.length / 10))
      
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getValidImageUrl = (imageUrl?: string, fallbackText?: string) => {
    if (!imageUrl || 
        imageUrl.includes('example.com') || 
        imageUrl.includes('.claude/') ||
        imageUrl.startsWith('./') ||
        imageUrl.startsWith('../')) {
      return `/api/placeholder-image?text=${encodeURIComponent(fallbackText || 'Product')}&width=300&height=200`
    }
    return imageUrl
  }

  const handleTransactionAction = async (transactionId: string, action: string) => {
    try {
      // Mock action handling - in real app would call API
      console.log(`Action ${action} on transaction ${transactionId}`)
      alert(`${action} action performed on transaction ${transactionId}`)
      // Reload transactions after action
      loadTransactions()
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-gray-400">
              {totalItems > 0 ? `${totalItems} transaction${totalItems !== 1 ? 's' : ''} found` : 'No transactions yet'}
            </p>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-red text-white gaming-glow'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'buying'
                  ? 'bg-brand-blue text-white gaming-glow'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              Buying
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'selling'
                  ? 'bg-green-500 text-white gaming-glow'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              Selling
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">No transactions found</h2>
            <p className="text-gray-400 mb-6">
              {activeTab === 'all' 
                ? 'You haven\'t made any transactions yet.' 
                : activeTab === 'buying' 
                  ? 'You haven\'t purchased anything yet.'
                  : 'You haven\'t sold anything yet.'
              }
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-8 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white font-medium rounded-lg hover:shadow-lg transition-all gaming-glow"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getValidImageUrl(transaction.product?.images?.[0]?.url, transaction.product?.title)}
                          alt={transaction.product?.title || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <Link 
                            href={`/products/${transaction.product_id}`}
                            className="text-lg font-semibold text-white hover:text-brand-red transition-colors line-clamp-1"
                          >
                            {transaction.product?.title}
                          </Link>
                          <Badge 
                            className={`ml-4 ${STATUS_COLORS[transaction.status]} text-xs font-medium px-2 py-1 rounded-full border whitespace-nowrap`}
                          >
                            {STATUS_LABELS[transaction.status]}
                          </Badge>
                        </div>

                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {transaction.product?.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <span>ID:</span>
                            <code className="text-white bg-gray-700 px-2 py-1 rounded text-xs">
                              {transaction.id}
                            </code>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span>{activeTab === 'selling' ? 'Buyer:' : 'Seller:'}</span>
                            <span className="text-white">
                              @{activeTab === 'selling' ? transaction.buyer?.username : transaction.seller?.username}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span>Method:</span>
                            <span className="text-white capitalize">{transaction.delivery_method}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span>Date:</span>
                            <span className="text-white">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="lg:w-64 flex flex-col justify-between">
                    <div className="text-right mb-4">
                      <PriceDisplay 
                        basePrice={transaction.amount} 
                        size="lg" 
                        className="text-brand-red" 
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/transactions/${transaction.id}`}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>

                      {/* Status-specific actions */}
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleTransactionAction(transaction.id, 'pay')}
                          className="w-full bg-gradient-to-r from-brand-red to-brand-blue text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        >
                          Pay Now
                        </button>
                      )}

                      {transaction.status === 'paid' && activeTab === 'selling' && (
                        <button
                          onClick={() => handleTransactionAction(transaction.id, 'deliver')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {transaction.status === 'delivered' && activeTab === 'buying' && (
                        <button
                          onClick={() => handleTransactionAction(transaction.id, 'complete')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Confirm Receipt
                        </button>
                      )}

                      {(transaction.status === 'paid' || transaction.status === 'delivered') && (
                        <button
                          onClick={() => handleTransactionAction(transaction.id, 'dispute')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Report Issue
                        </button>
                      )}

                      {transaction.status === 'completed' && activeTab === 'buying' && (
                        <Link
                          href={`/products/${transaction.product_id}?review=true`}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Leave Review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                if (page > totalPages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      page === currentPage
                        ? 'bg-brand-red text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}