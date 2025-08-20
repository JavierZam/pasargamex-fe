// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  phone?: string
  bio?: string
  role: 'user' | 'admin' | 'seller' | 'buyer'
  status: 'active' | 'suspended' | 'banned'
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  seller_rating: number
  seller_review_count: number
  buyer_rating: number
  buyer_review_count: number
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  game_title: string
  seller_id: string
  seller_username?: string
  images: ProductImage[]
  status: 'active' | 'sold' | 'inactive'
  credentials?: Record<string, any>
  specifications: Record<string, any>
  created_at: string
  updated_at: string
  bumped_at?: string
}

export interface ProductImage {
  id: string
  url: string
  display_order: number
}

// Transaction Types
export interface Transaction {
  id: string
  product_id: string
  seller_id: string
  buyer_id: string
  status: 'pending' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
  delivery_method: 'instant' | 'middleman'
  amount: number
  fee: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  notes?: string
  credentials_delivered: boolean
  created_at: string
  updated_at: string
}

// Review Types
export interface Review {
  id: string
  transaction_id: string
  product_id: string
  reviewer_id: string
  target_id: string
  type: 'seller_review' | 'buyer_review'
  rating: number
  content: string
  images?: string[]
  status: 'active' | 'hidden' | 'reported'
  created_at: string
}

// Chat Types
export interface Chat {
  id: string
  participants: string[]
  product_id?: string
  transaction_id?: string
  type: 'direct' | 'group' | 'transaction'
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'system' | 'offer'
  attachment_urls?: string[]
  metadata?: Record<string, any>
  created_at: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  refresh_token: string
}

// Review & Rating Types
export interface Review {
  id: string
  transactionId: string
  productId: string
  reviewerId: string
  targetId: string
  type: 'seller_review' | 'buyer_review'
  rating: number
  content: string
  images?: string[]
  status: 'active' | 'hidden' | 'reported' | 'deleted'
  reportCount: number
  createdAt: string
  updatedAt: string
  // Additional fields for display
  reviewer?: {
    id: string
    username: string
    avatar?: string
  }
  product?: {
    id: string
    title: string
    image?: string
  }
}

export interface ReviewReport {
  id: string
  reviewId: string
  reporterId: string
  reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'other'
  description: string
  status: 'pending' | 'resolved' | 'rejected'
  createdAt: string
  resolvedAt?: string
}

export interface SellerRating {
  sellerId: string
  totalReviews: number
  averageRating: number
  ratingBreakdown: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  lastUpdated: string
}

export interface CreateReviewRequest {
  rating: number
  content: string
  images?: File[]
}

// Wishlist Types
export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product: {
    id: string
    title: string
    description: string
    price: number
    type: string
    images: ProductImage[]
    status: string
    seller_id: string
    game_title_id: string
    delivery_method: string
    views: number
    sold_count: number
  }
  created_at: string
}

export interface ReviewFilters {
  userId?: string
  type?: 'seller_review' | 'buyer_review'
  rating?: number
  page?: number
  limit?: number
}