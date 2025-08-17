'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent, LoadingSpinner } from '@/components/ui'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface GameTitle {
  id: string
  name: string
  slug: string
}

interface ProductFormData {
  game_title_id: string
  title: string
  description: string
  price: number
  type: 'account' | 'topup' | 'boosting' | 'item'
  stock: number
  delivery_method: 'instant' | 'middleman' | 'both'
  attributes: Record<string, any>
}

export default function CreateProductPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    game_title_id: '',
    title: '',
    description: '',
    price: 0,
    type: 'account',
    stock: 1,
    delivery_method: 'instant',
    attributes: {}
  })

  // Load game titles
  useEffect(() => {
    const loadGameTitles = async () => {
      try {
        const response = await apiClient.getGameTitles()
        if (response.success && response.data) {
          const data = response.data as any
          if (Array.isArray(data)) {
            setGameTitles(data)
          } else if (data.items && Array.isArray(data.items)) {
            setGameTitles(data.items)
          }
        }
      } catch (error) {
        console.error('Error loading game titles:', error)
      }
    }
    loadGameTitles()
  }, [])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login first')
      return
    }

    setLoading(true)
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      }

      console.log('Creating product:', productData)
      const response = await apiClient.createProduct(productData)
      
      if (response.success) {
        alert('Product created successfully!')
        router.push('/products')
      } else {
        alert(`Error: ${response.error?.message || 'Failed to create product'}`)
      }
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(`Error: ${error.message || 'Failed to create product'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center\">
        <LoadingSpinner size=\"lg\" className=\"text-brand-red\" />
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800\">
      <div className=\"container mx-auto px-4 py-8\">
        <div className=\"max-w-2xl mx-auto\">
          <div className=\"text-center mb-8\">
            <h1 className=\"text-4xl font-bold text-white font-gaming mb-4\">
              Create <span className=\"text-brand-red\">Product</span>
            </h1>
            <p className=\"text-gray-400\">Add your gaming product to the marketplace</p>
          </div>

          <Card className=\"bg-gray-800/50 border-gray-700 backdrop-blur-sm\">
            <CardContent className=\"p-6\">
              <form onSubmit={handleSubmit} className=\"space-y-6\">
                {/* Game Title Selection */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Game Title *</label>
                  <select
                    value={formData.game_title_id}
                    onChange={(e) => handleInputChange('game_title_id', e.target.value)}
                    className=\"w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none\"
                    required
                  >
                    <option value=\"\">Select a game</option>
                    {gameTitles.map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </select>
                </div>

                {/* Product Type */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Product Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as ProductFormData['type'])}
                    className=\"w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none\"
                    required
                  >
                    <option value=\"account\">Account</option>
                    <option value=\"topup\">Top-up</option>
                    <option value=\"boosting\">Boosting Service</option>
                    <option value=\"item\">Items</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Product Title *</label>
                  <Input
                    type=\"text\"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder=\"Enter product title\"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder=\"Describe your product in detail\"
                    rows={4}
                    className=\"w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none resize-none\"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Price (IDR) *</label>
                  <Input
                    type=\"number\"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder=\"Enter price in IDR\"
                    min=\"1000\"
                    step=\"1000\"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Stock *</label>
                  <Input
                    type=\"number\"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder=\"Available stock\"
                    min=\"1\"
                    required
                  />
                </div>

                {/* Delivery Method */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Delivery Method *</label>
                  <select
                    value={formData.delivery_method}
                    onChange={(e) => handleInputChange('delivery_method', e.target.value as ProductFormData['delivery_method'])}
                    className=\"w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none\"
                    required
                  >
                    <option value=\"instant\">Instant Delivery</option>
                    <option value=\"middleman\">Middleman Service</option>
                    <option value=\"both\">Both Available</option>
                  </select>
                </div>

                {/* Attributes (Simple JSON for now) */}
                <div>
                  <label className=\"block text-white font-medium mb-2\">Additional Attributes (JSON)</label>
                  <textarea
                    value={JSON.stringify(formData.attributes, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        handleInputChange('attributes', parsed)
                      } catch (error) {
                        // Invalid JSON, ignore for now
                      }
                    }}
                    placeholder='{\"level\": 50, \"server\": \"Asia\"}'
                    rows={3}
                    className=\"w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-brand-red focus:outline-none resize-none font-mono text-sm\"
                  />
                  <p className=\"text-gray-500 text-sm mt-1\">Optional: Game-specific attributes in JSON format</p>
                </div>

                {/* Submit Button */}
                <div className=\"flex gap-4\">
                  <Button
                    type=\"button\"
                    variant=\"outline\"
                    onClick={() => router.back()}
                    className=\"flex-1\"
                  >
                    Cancel
                  </Button>
                  <Button
                    type=\"submit\"
                    disabled={loading}
                    className=\"flex-1\"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size=\"sm\" className=\"mr-2\" />
                        Creating...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}