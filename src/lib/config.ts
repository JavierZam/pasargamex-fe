// API Configuration
export const API_CONFIG = {
  // Always use localhost for development - override production URL
  BASE_URL: 'http://localhost:8080',
  
  // Always use localhost WebSocket
  WS_URL: 'ws://localhost:8080/ws',
    
  // API endpoints
  ENDPOINTS: {
    USERS: '/v1/users',
    CHATS: '/v1/chats',
    MESSAGES: '/v1/messages',
    PRODUCTS: '/v1/products',
    AUTH: '/v1/auth'
  }
}

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to build WebSocket URL
export const buildWsUrl = (token?: string): string => {
  const baseUrl = API_CONFIG.WS_URL
  return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl
}