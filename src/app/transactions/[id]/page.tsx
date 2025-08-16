'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Badge, LoadingSpinner, Button, Card, CardContent } from '@/components/ui'

interface Transaction {
  id: string
  product_id: string
  seller_id: string
  buyer_id: string
  status: 'payment_pending' | 'payment_processing' | 'credentials_delivered' | 'completed' | 'disputed' | 'refunded' | 'cancelled'
  delivery_method: 'instant' | 'middleman'
  amount: number
  fee: number
  total_amount: number
  payment_status: string
  midtrans_order_id: string
  midtrans_token: string
  midtrans_redirect_url: string
  created_at: string
  updated_at: string
  product?: {
    id: string
    title: string
    images: Array<{ url: string }>
    type: string
  }
  seller?: {
    username: string
    verification_status: string
  }
  buyer?: {
    username: string
  }
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (params.id && isAuthenticated) {
      loadTransaction()
    } else if (!isAuthenticated) {
      router.push('/login')
    }
  }, [params.id, isAuthenticated])

  const loadTransaction = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/transactions/${params.id}`)
      
      if (response.success && response.data) {
        setTransaction(response.data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading transaction:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!transaction) return

    try {
      setActionLoading(true)
      const response = await apiClient.post(`/transactions/${transaction.id}/confirm`)
      
      if (response.success) {
        await loadTransaction() // Reload to get updated status
        alert('Transaction confirmed successfully!')
      } else {
        alert('Failed to confirm transaction: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Confirm error:', error)
      alert('Failed to confirm transaction: ' + (error.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!transaction) return

    const reason = prompt('Please provide a reason for the dispute:')
    if (!reason) return

    try {
      setActionLoading(true)
      const response = await apiClient.post(`/transactions/${transaction.id}/dispute`, {
        reason: reason
      })
      
      if (response.success) {
        await loadTransaction()
        alert('Dispute created successfully. Our support team will review it.')
      } else {
        alert('Failed to create dispute: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Dispute error:', error)
      alert('Failed to create dispute: ' + (error.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!transaction) return

    if (!confirm('Are you sure you want to cancel this transaction?')) {
      return
    }

    try {
      setActionLoading(true)
      const response = await apiClient.post(`/transactions/${transaction.id}/cancel`)
      
      if (response.success) {
        await loadTransaction()
        alert('Transaction cancelled successfully.')
      } else {
        alert('Failed to cancel transaction: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Cancel error:', error)
      alert('Failed to cancel transaction: ' + (error.message || 'Unknown error'))
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'bg-yellow-500'
      case 'payment_processing': return 'bg-blue-500'
      case 'credentials_delivered': return 'bg-purple-500'
      case 'completed': return 'bg-green-500'
      case 'disputed': return 'bg-red-500'
      case 'refunded': return 'bg-gray-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'Payment Pending'
      case 'payment_processing': return 'Payment Processing'
      case 'credentials_delivered': return 'Credentials Delivered'
      case 'completed': return 'Completed'
      case 'disputed': return 'Disputed'
      case 'refunded': return 'Refunded'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const canConfirm = () => {
    return transaction?.status === 'credentials_delivered' && transaction.buyer_id === user?.id
  }

  const canDispute = () => {
    return ['credentials_delivered', 'completed'].includes(transaction?.status || '') && 
           (transaction?.buyer_id === user?.id || transaction?.seller_id === user?.id)
  }

  const canCancel = () => {
    return ['payment_pending', 'payment_processing'].includes(transaction?.status || '') &&
           (transaction?.buyer_id === user?.id || transaction?.seller_id === user?.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Transaction Not Found</h1>
          <Link href="/dashboard" className="text-brand-blue hover:text-white">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">Transaction #{transaction.id.slice(-8)}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Transaction Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Transaction Details</h1>
            <Badge className={`${getStatusColor(transaction.status)} text-white`}>
              {getStatusText(transaction.status)}
            </Badge>
          </div>
          <p className="text-gray-400">ID: {transaction.id}</p>
          <p className="text-gray-400">Created: {new Date(transaction.created_at).toLocaleString()}</p>
        </div>

        {/* Product Info */}
        {transaction.product && (
          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Product</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                  {transaction.product.images?.[0]?.url ? (
                    <Image
                      src={transaction.product.images[0].url}
                      alt={transaction.product.title}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <span className="text-gray-400">🎮</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{transaction.product.title}</h3>
                  <Badge className="mt-1 text-xs bg-purple-500">
                    {transaction.product.type?.toUpperCase()}
                  </Badge>
                </div>
                <Link
                  href={`/products/${transaction.product.id}`}
                  className="text-brand-blue hover:text-white text-sm"
                >
                  View Product →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Payment Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium" suppressHydrationWarning>
                    ${transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee:</span>
                  <span className="text-white font-medium" suppressHydrationWarning>
                    ${transaction.fee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-3">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-brand-red font-bold" suppressHydrationWarning>
                    ${transaction.total_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className="text-white font-medium">{transaction.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Method:</span>
                  <span className="text-white font-medium capitalize">{transaction.delivery_method}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Participants</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Seller</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {transaction.seller?.username || 'Unknown'}
                    </span>
                    {transaction.seller?.verification_status === 'verified' && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Buyer</div>
                  <span className="text-white font-medium">
                    {transaction.buyer?.username || 'Unknown'}
                  </span>
                </div>
                {transaction.midtrans_order_id && (
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Payment ID</div>
                    <span className="text-white font-mono text-sm">
                      {transaction.midtrans_order_id}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="flex gap-4 flex-wrap">
              {canConfirm() && (
                <Button
                  onClick={handleConfirmDelivery}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Confirm Delivery'}
                </Button>
              )}

              {canDispute() && (
                <Button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Create Dispute'}
                </Button>
              )}

              {canCancel() && (
                <Button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Cancel Transaction'}
                </Button>
              )}

              {/* Contact Seller/Buyer */}
              {user?.id !== transaction.seller_id && (
                <Button
                  onClick={() => router.push(`/messages?user=${transaction.seller_id}`)}
                  variant="outline"
                >
                  Contact Seller
                </Button>
              )}

              {user?.id !== transaction.buyer_id && transaction.buyer_id && (
                <Button
                  onClick={() => router.push(`/messages?user=${transaction.buyer_id}`)}
                  variant="outline"
                >
                  Contact Buyer
                </Button>
              )}
            </div>

            {/* Status Guide */}
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-white font-medium mb-2">Transaction Status Guide</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Payment Pending:</strong> Waiting for payment confirmation</p>
                <p><strong>Payment Processing:</strong> Payment is being processed</p>
                <p><strong>Credentials Delivered:</strong> Seller has provided account details</p>
                <p><strong>Completed:</strong> Transaction completed successfully</p>
                <p><strong>Disputed:</strong> Dispute created, under review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}