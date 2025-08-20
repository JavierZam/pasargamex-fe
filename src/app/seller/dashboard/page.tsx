'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useRole } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Badge, LoadingSpinner, Button, Card, CardContent, PriceDisplay } from '@/components/ui'

interface Product {
  id: string
  title: string
  description: string
  price: number
  type: string
  status: 'draft' | 'active' | 'sold' | 'suspended'
  stock: number
  sold_count: number
  views: number
  images: { url: string }[]
  created_at: string
  updated_at: string
  bumped_at?: string
}

interface SellerStats {
  total_products: number
  active_products: number
  total_sales: number
  total_revenue: number
  total_views: number
  avg_rating: number
  pending_orders: number
}

interface SalesData {
  date: string
  sales: number
  revenue: number
  views: number
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isSeller } = useRole()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics' | 'tools'>('overview')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && !isSeller) {
      router.push('/dashboard')
    } else if (isAuthenticated && isSeller) {
      loadSellerData()
    }
  }, [isAuthenticated, isLoading, isSeller])

  const loadSellerData = async () => {
    try {
      setLoading(true)
      
      // Load seller products
      const productsResponse = await apiClient.get('/seller/products')
      if (productsResponse.success && productsResponse.data) {
        const productsData = Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : productsResponse.data.items || []
        setProducts(productsData)
        
        // Calculate stats from products
        const totalProducts = productsData.length
        const activeProducts = productsData.filter((p: Product) => p.status === 'active').length
        const totalSales = productsData.reduce((sum: number, p: Product) => sum + p.sold_count, 0)
        const totalRevenue = productsData.reduce((sum: number, p: Product) => sum + (p.price * p.sold_count), 0)
        const totalViews = productsData.reduce((sum: number, p: Product) => sum + p.views, 0)

        setStats({
          total_products: totalProducts,
          active_products: activeProducts,
          total_sales: totalSales,
          total_revenue: totalRevenue,
          total_views: totalViews,
          avg_rating: 4.5, // Mock data
          pending_orders: 3 // Mock data
        })

        // Generate mock sales data for last 7 days
        generateSalesData(productsData)
      }
    } catch (error) {
      console.error('Error loading seller data:', error)
      // Set default empty data
      setProducts([])
      setStats({
        total_products: 0,
        active_products: 0,
        total_sales: 0,
        total_revenue: 0,
        total_views: 0,
        avg_rating: 0,
        pending_orders: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSalesData = (productsData: Product[]) => {
    const data: SalesData[] = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Mock data generation
      const sales = Math.floor(Math.random() * 10)
      const revenue = sales * (Math.random() * 2000000 + 500000)
      const views = Math.floor(Math.random() * 100) + 20
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales,
        revenue,
        views
      })
    }
    
    setSalesData(data)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'sold': return 'bg-blue-500'
      case 'suspended': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleBumpProduct = async (productId: string) => {
    try {
      // Mock API call - in real app this would bump the product
      console.log('Bumping product:', productId)
      // Refresh products after bump
      loadSellerData()
    } catch (error) {
      console.error('Error bumping product:', error)
    }
  }

  const handleToggleProductStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active'
      // Mock API call
      console.log('Toggling product status:', productId, newStatus)
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: newStatus as any } : p
      ))
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
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
              <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your products and track your performance</p>
            </div>
            <div className="flex gap-3">
              <Link href="/products">
                <Button variant="outline">View Marketplace</Button>
              </Link>
              <Link href="/seller/create-product">
                <Button>Create Product</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-brand-red mb-1">
                  {stats.total_products}
                </div>
                <div className="text-gray-400 text-sm">Products</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {stats.active_products}
                </div>
                <div className="text-gray-400 text-sm">Active</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-brand-blue mb-1">
                  {stats.total_sales}
                </div>
                <div className="text-gray-400 text-sm">Sales</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1" suppressHydrationWarning>
                  <PriceDisplay basePrice={stats.total_revenue} size="sm" />
                </div>
                <div className="text-gray-400 text-sm">Revenue</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {stats.total_views}
                </div>
                <div className="text-gray-400 text-sm">Views</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {stats.avg_rating.toFixed(1)}
                </div>
                <div className="text-gray-400 text-sm">Rating</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {stats.pending_orders}
                </div>
                <div className="text-gray-400 text-sm">Pending</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex bg-gray-700 rounded-lg p-1 max-w-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'products' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tools' ? 'bg-brand-red text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Tools
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Products */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Products</h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{product.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStatusColor(product.status)} text-white text-xs`}>
                            {getStatusText(product.status)}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            {product.views} views • {product.sold_count} sales
                          </span>
                        </div>
                      </div>
                      <PriceDisplay basePrice={product.price} size="sm" />
                    </div>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-gray-400">No products yet</p>
                    <Link href="/seller/create-product">
                      <Button className="mt-4">Create Your First Product</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-green-400 font-semibold">12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg. Product Price</span>
                    <PriceDisplay 
                      basePrice={products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0} 
                      size="sm" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-blue-400 font-semibold">2.3 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Customer Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-white font-semibold">4.8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'products' && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Product Management</h2>
                <Link href="/seller/create-product">
                  <Button>Add New Product</Button>
                </Link>
              </div>

              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">{product.title}</h3>
                            <Badge className={`${getStatusColor(product.status)} text-white text-xs`}>
                              {getStatusText(product.status)}
                            </Badge>
                            <Badge className="bg-purple-500 text-white text-xs">
                              {product.type.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Price: </span>
                              <PriceDisplay basePrice={product.price} size="sm" />
                            </div>
                            <div>
                              <span className="text-gray-400">Stock: </span>
                              <span className={`font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {product.stock}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Views: </span>
                              <span className="text-blue-400 font-medium">{product.views}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Sales: </span>
                              <span className="text-green-400 font-medium">{product.sold_count}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBumpProduct(product.id)}
                          >
                            Bump
                          </Button>
                          <Button
                            size="sm"
                            variant={product.status === 'active' ? 'danger' : 'primary'}
                            onClick={() => handleToggleProductStatus(product.id, product.status)}
                          >
                            {product.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Link href={`/products/${product.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No Products Yet</h3>
                  <p className="text-gray-400 mb-6">Create your first product to start selling</p>
                  <Link href="/seller/create-product">
                    <Button>Create Product</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trend */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">7-Day Sales Trend</h3>
                <div className="space-y-3">
                  {salesData.map((day) => (
                    <div key={day.date} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{day.date}</span>
                        <span className="text-gray-400 text-sm">{day.sales} sales</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-400">Revenue: </span>
                          <PriceDisplay basePrice={day.revenue} size="sm" />
                        </div>
                        <div>
                          <span className="text-blue-400">Views: </span>
                          <span className="text-white">{day.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Products */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {products
                    .sort((a, b) => (b.sold_count + b.views * 0.01) - (a.sold_count + a.views * 0.01))
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{product.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{product.sold_count} sales</span>
                            <span>{product.views} views</span>
                          </div>
                        </div>
                        <PriceDisplay basePrice={product.price * product.sold_count} size="sm" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Tools */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-white font-semibold mb-2">Bulk Bump Products</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Boost visibility by bumping all your active products
                </p>
                <Button className="w-full">Bump All Products</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-white font-semibold mb-2">Analytics Export</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Download your sales and performance data
                </p>
                <Button className="w-full" variant="outline">Export Data</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-white font-semibold mb-2">Bulk Edit</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Update multiple products at once
                </p>
                <Button className="w-full" variant="outline">Bulk Edit</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-white font-semibold mb-2">Promotion Tools</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Create discounts and special offers
                </p>
                <Button className="w-full" variant="outline">Create Promotion</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-white font-semibold mb-2">Customer Messages</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Respond to customer inquiries quickly
                </p>
                <Link href="/messages">
                  <Button className="w-full" variant="outline">View Messages</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-white font-semibold mb-2">Seller Settings</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Configure your seller preferences
                </p>
                <Button className="w-full" variant="outline">Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}