'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useRole } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Badge, LoadingSpinner, Button, Card, CardContent, PriceDisplay } from '@/components/ui'

interface Transaction {
  id: string
  product_id: string
  status: string
  amount: number
  total_amount: number
  created_at: string
  product?: {
    title: string
    type: string
  }
  seller?: {
    username: string
  }
  buyer?: {
    username: string
  }
}

interface DashboardStats {
  total_transactions: number
  total_spent: number
  total_earned: number
  active_transactions: number
}

interface ActivityItem {
  id: string
  type: 'purchase' | 'sale' | 'wishlist' | 'review' | 'login'
  title: string
  description: string
  timestamp: string
  metadata?: {
    product_title?: string
    amount?: number
    status?: string
  }
}

interface MonthlyData {
  month: string
  spent: number
  earned: number
  transactions: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isSeller, isAdmin } = useRole()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all')
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'activity' | 'analytics'>('overview')
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [favoriteCategories, setFavoriteCategories] = useState<{name: string, count: number, percentage: number}[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, isLoading])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load transactions
      const transactionsResponse = await apiClient.get('/transactions')
      if (transactionsResponse.success && transactionsResponse.data) {
        const transactionData = Array.isArray(transactionsResponse.data) 
          ? transactionsResponse.data 
          : transactionsResponse.data.items || []
        setTransactions(transactionData)
        
        // Calculate stats from transactions
        const totalTransactions = transactionData.length
        const totalSpent = transactionData
          .filter((t: Transaction) => t.buyer?.username === user?.username)
          .reduce((sum: number, t: Transaction) => sum + t.total_amount, 0)
        const totalEarned = transactionData
          .filter((t: Transaction) => t.seller?.username === user?.username)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        const activeTransactions = transactionData
          .filter((t: Transaction) => ['payment_pending', 'payment_processing', 'credentials_delivered'].includes(t.status))
          .length

        setStats({
          total_transactions: totalTransactions,
          total_spent: totalSpent,
          total_earned: totalEarned,
          active_transactions: activeTransactions
        })

        // Generate analytics data
        generateAnalyticsData(transactionData)
        generateRecentActivity(transactionData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set empty data on error
      setTransactions([])
      setStats({
        total_transactions: 0,
        total_spent: 0,
        total_earned: 0,
        active_transactions: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAnalyticsData = (transactionData: Transaction[]) => {
    // Generate monthly spending/earning data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const monthlyStats: MonthlyData[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = months[date.getMonth()]
      
      const monthTransactions = transactionData.filter(t => {
        const transactionDate = new Date(t.created_at)
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear()
      })

      const spent = monthTransactions
        .filter(t => t.buyer?.username === user?.username)
        .reduce((sum, t) => sum + t.total_amount, 0)
      
      const earned = monthTransactions
        .filter(t => t.seller?.username === user?.username)
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyStats.push({
        month: monthName,
        spent,
        earned,
        transactions: monthTransactions.length
      })
    }

    setMonthlyData(monthlyStats)

    // Generate favorite categories
    const categoryCount = transactionData.reduce((acc: Record<string, number>, transaction) => {
      const category = transaction.product?.type || 'other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    const totalTransactions = transactionData.length
    const categoriesWithPercentage = Object.entries(categoryCount)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage: totalTransactions > 0 ? Math.round((count / totalTransactions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setFavoriteCategories(categoriesWithPercentage)
  }

  const generateRecentActivity = (transactionData: Transaction[]) => {
    const activities: ActivityItem[] = []

    // Add transaction activities
    transactionData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .forEach(transaction => {
        const isBuying = transaction.buyer?.username === user?.username
        activities.push({
          id: `tx-${transaction.id}`,
          type: isBuying ? 'purchase' : 'sale',
          title: isBuying ? 'Purchase Completed' : 'Sale Completed',
          description: transaction.product?.title || 'Unknown Product',
          timestamp: transaction.created_at,
          metadata: {
            product_title: transaction.product?.title,
            amount: transaction.total_amount,
            status: transaction.status
          }
        })
      })

    // Add mock activities for better UX (in real app, this would come from actual activity logs)
    const mockActivities: ActivityItem[] = [
      {
        id: 'activity-1',
        type: 'login',
        title: 'Account Login',
        description: 'Logged in from new device',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'activity-2',
        type: 'wishlist',
        title: 'Added to Wishlist',
        description: 'Genshin Impact Account - AR 55',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ]

    setRecentActivity([...activities, ...mockActivities].slice(0, 15))
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

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'buying') {
      return transaction.buyer?.username === user?.username
    } else if (activeTab === 'selling') {
      return transaction.seller?.username === user?.username
    }
    return true // 'all'
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '🛒'
      case 'sale': return '💰'
      case 'wishlist': return '❤️'
      case 'review': return '⭐'
      case 'login': return '🔐'
      default: return '📝'
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return time.toLocaleDateString()
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex gap-3">
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
              {isSeller && (
                <Link href="/seller/products">
                  <Button>Manage Products</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-brand-red mb-2">
                  {stats.total_transactions}
                </div>
                <div className="text-gray-400">Total Transactions</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-brand-blue mb-2" suppressHydrationWarning>
                  ${stats.total_spent.toLocaleString()}
                </div>
                <div className="text-gray-400">Total Spent</div>
              </CardContent>
            </Card>

            {isSeller && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2" suppressHydrationWarning>
                    ${stats.total_earned.toLocaleString()}
                  </div>
                  <div className="text-gray-400">Total Earned</div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {stats.active_transactions}
                </div>
                <div className="text-gray-400">Active Transactions</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tabs */}
        <div className="mb-8">
          <div className="flex bg-gray-700 rounded-lg p-1 max-w-md">
            <button
              onClick={() => setAnalyticsTab('overview')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analyticsTab === 'overview' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setAnalyticsTab('activity')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analyticsTab === 'activity' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setAnalyticsTab('analytics')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analyticsTab === 'analytics' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Analytics Content */}
        {analyticsTab === 'activity' && (
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">{activity.title}</h4>
                          <span className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                        {activity.metadata?.amount && (
                          <div className="mt-2">
                            <PriceDisplay basePrice={activity.metadata.amount} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {analyticsTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trends */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">6-Month Trends</h3>
                <div className="space-y-3">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{month.month}</span>
                        <span className="text-gray-400 text-sm">{month.transactions} transactions</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {month.spent > 0 && (
                          <div>
                            <span className="text-red-400">Spent: </span>
                            <PriceDisplay basePrice={month.spent} size="sm" />
                          </div>
                        )}
                        {month.earned > 0 && (
                          <div>
                            <span className="text-green-400">Earned: </span>
                            <PriceDisplay basePrice={month.earned} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Categories */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Favorite Categories</h3>
                <div className="space-y-3">
                  {favoriteCategories.length > 0 ? (
                    favoriteCategories.map((category) => (
                      <div key={category.name} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{category.name}</span>
                          <span className="text-brand-blue font-bold">{category.percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{category.count} transactions</span>
                          <div className="w-20 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-brand-red to-brand-blue h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-400">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Section */}
        {analyticsTab === 'overview' && (
          <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Recent Transactions</h2>
              
              {/* Tabs */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'all' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('buying')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'buying' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Buying
                </button>
                {isSeller && (
                  <button
                    onClick={() => setActiveTab('selling')}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'selling' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Selling
                  </button>
                )}
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium">
                            {transaction.product?.title || 'Unknown Product'}
                          </h3>
                          <Badge className={`${getStatusColor(transaction.status)} text-white text-xs`}>
                            {getStatusText(transaction.status)}
                          </Badge>
                          {transaction.product?.type && (
                            <Badge className="bg-purple-500 text-white text-xs">
                              {transaction.product.type.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>ID: {transaction.id.slice(-8)}</span>
                          <span>•</span>
                          <span suppressHydrationWarning>
                            ${transaction.total_amount.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </span>
                          {activeTab === 'all' && (
                            <>
                              <span>•</span>
                              <span>
                                {transaction.buyer?.username === user?.username ? 'Buying' : 'Selling'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Link href={`/transactions/${transaction.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 'buying' 
                    ? "You haven't made any purchases yet. Start browsing products!"
                    : activeTab === 'selling'
                    ? "You haven't made any sales yet. Create your first product!"
                    : "You haven't made any transactions yet. Start browsing products!"
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                  {isSeller && activeTab === 'selling' && (
                    <Link href="/seller/products">
                      <Button variant="outline">Create Product</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-white font-semibold mb-2">Shop Products</h3>
              <p className="text-gray-400 text-sm mb-4">
                Browse thousands of gaming accounts and items
              </p>
              <Link href="/products">
                <Button className="w-full">Browse Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-white font-semibold mb-2">Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Manage your balance and payment methods
              </p>
              <Link href="/wallet">
                <Button className="w-full" variant="outline">View Wallet</Button>
              </Link>
            </CardContent>
          </Card>

          {isSeller && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-white font-semibold mb-2">Sell Products</h3>
                <p className="text-gray-400 text-sm mb-4">
                  List your gaming accounts and earn money
                </p>
                <Link href="/seller/products">
                  <Button className="w-full" variant="outline">Manage Products</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}