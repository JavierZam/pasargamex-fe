import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pasargamex-api-244929333106.asia-southeast2.run.app'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error: any) {
      // In development, log the error but don't throw for connection refused
      if (IS_DEVELOPMENT && (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED'))) {
        console.warn(`🔌 Backend not available for ${endpoint} - this is normal in frontend-only development mode`)
      }
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const url = `${this.baseURL}/v1/auth/login`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Login API response:', data) // Debug log
      
      // Backend returns direct data, wrap it in ApiResponse format
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Login API error:', error) // Debug log
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error.message || 'Login failed'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  async register(data: { email: string; password: string; username: string; phone?: string }) {
    const url = `${this.baseURL}/v1/auth/register`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Backend returns direct data, wrap it in ApiResponse format
      return {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'REGISTER_ERROR',
          message: error.message || 'Registration failed'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  async logout() {
    return this.request('/v1/auth/logout', {
      method: 'POST',
    })
  }

  async refreshToken() {
    return this.request('/v1/auth/refresh', {
      method: 'POST',
    })
  }

  // Generic GET method
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`${endpoint}${query ? `?${query}` : ''}`)
  }

  // Game Title endpoints
  async getGameTitles(params?: { status?: string; limit?: number; page?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/game-titles${query ? `?${query}` : ''}`)
  }

  async getGameTitle(id: string) {
    return this.request(`/v1/game-titles/${id}`)
  }

  async getGameTitleBySlug(slug: string) {
    return this.request(`/v1/games/${slug}`)
  }

  // Product endpoints
  async searchProducts(params: {
    q: string
    game_title_id?: string
    type?: string
    status?: string
    min_price?: number
    max_price?: number
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    return this.request(`/v1/products/search?${searchParams.toString()}`)
  }

  async getProducts(params?: {
    game_title_id?: string
    type?: string
    page?: number
    limit?: number
    category?: string
    game_title?: string
    min_price?: number
    max_price?: number
    search?: string
    status?: string
    sort?: string
    sort_by?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/products${query ? `?${query}` : ''}`)
  }

  async getProductCount(gameTitleId: string) {
    try {
      const response = await this.getProducts({ 
        game_title_id: gameTitleId, 
        limit: 1, 
        status: 'active' 
      })
      if (response.success && response.data && (response.data as any).total !== undefined) {
        console.log(`📊 Product count for ${gameTitleId}: ${(response.data as any).total}`)
        return (response.data as any).total
      }
      return 0
    } catch (error) {
      console.log(`❌ Error getting product count for ${gameTitleId}:`, error)
      return 0
    }
  }

  // User endpoints
  async getProfile() {
    const url = `${this.baseURL}/v1/users/me`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Backend returns direct data, wrap it in ApiResponse format
      return {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: error.message || 'Failed to get profile'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  async updateProfile(data: { username?: string; phone?: string; bio?: string }) {
    return this.request('/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getPublicSellerProfile(sellerId: string) {
    return this.request(`/v1/sellers/${sellerId}/profile`)
  }

  async getProduct(id: string) {
    return this.request(`/v1/products/${id}`)
  }

  async getProductReviews(id: string, params?: { rating?: number; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/products/${id}/reviews${query ? `?${query}` : ''}`)
  }

  async createProduct(data: any) {
    return this.request('/v1/my-products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMyProducts(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/my-products${query ? `?${query}` : ''}`)
  }

  // Transaction endpoints
  async createTransaction(data: {
    product_id: string
    delivery_method: 'instant' | 'middleman'
    notes?: string
  }) {
    return this.request('/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTransactions(params?: {
    role?: 'buyer' | 'seller'
    status?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/transactions${query ? `?${query}` : ''}`)
  }

  async getTransaction(id: string) {
    return this.request(`/v1/transactions/${id}`)
  }

  async getTransactionStatus(id: string) {
    return this.request(`/v1/transactions/${id}/status`)
  }

  // Chat endpoints
  async getChats(params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/chats${query ? `?${query}` : ''}`)
  }

  async getChatMessages(chatId: string, params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/chats/${chatId}/messages${query ? `?${query}` : ''}`)
  }

  // File endpoints
  async uploadFile(file: File, options?: {
    folder?: string
    entityType?: string
    entityId?: string
    public?: boolean
  }) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString())
        }
      })
    }

    const url = `${this.baseURL}/v1/files/upload`
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    return response.json()
  }

  async getPublicFile(fileId: string) {
    return `${this.baseURL}/v1/public/files/${fileId}`
  }

  // Wishlist endpoints
  async addToWishlist(productId: string) {
    return this.request(`/v1/wishlist/${productId}`, {
      method: 'POST'
    })
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/v1/wishlist/${productId}`, {
      method: 'DELETE'
    })
  }

  async getUserWishlist(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/wishlist${query ? `?${query}` : ''}`)
  }

  async checkWishlistStatus(productId: string) {
    return this.request(`/v1/wishlist/${productId}/status`)
  }

  async getWishlistCount() {
    return this.request('/v1/wishlist/count')
  }

  // Reviews & Ratings endpoints
  async getReviews(params?: {
    userId?: string
    type?: 'seller_review' | 'buyer_review'
    rating?: number
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/reviews${query ? `?${query}` : ''}`)
  }

  async createReview(transactionId: string, data: {
    rating: number
    content: string
    images?: File[]
  }) {
    const formData = new FormData()
    formData.append('rating', data.rating.toString())
    formData.append('content', data.content)
    
    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images`, image)
      })
    }

    const url = `${this.baseURL}/v1/transactions/${transactionId}/review`
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: { message: 'Network error', details: error },
        timestamp: new Date().toISOString()
      }
    }
  }

  async reportReview(reviewId: string, data: {
    reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'other'
    description: string
  }) {
    return this.request(`/v1/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Admin endpoints for reviews
  async getReviewReports(params?: {
    status?: 'pending' | 'resolved' | 'rejected'
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/v1/admin/reviews/reports${query ? `?${query}` : ''}`)
  }

  async updateReviewStatus(reviewId: string, data: {
    status: 'active' | 'hidden' | 'deleted'
    reason?: string
  }) {
    return this.request(`/v1/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient