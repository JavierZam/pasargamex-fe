// Level & EXP System for PasargameX Gamification

export interface TitleInfo {
  currentTitle: {
    id: string
    name: string
    salesRequired: number
    unlocks: string[]
  }
  nextTitle?: {
    id: string  
    name: string
    salesRequired: number
    unlocks: string[]
  }
  currentSales: number
  salesToNext: number
  progress: number
}

export interface ExpSource {
  action: string
  baseExp: number
  description: string
  icon: string
  category: 'trading' | 'social' | 'discovery' | 'achievement'
}

// EXP Sources - ONLY TRADING gives EXP (achievements are just rewards, no EXP)
export const EXP_SOURCES: ExpSource[] = [
  // Trading Actions - ONLY SOURCE OF EXP
  { action: 'first_purchase', baseExp: 100, description: 'Complete your first purchase', icon: '🛒', category: 'trading' },
  { action: 'purchase', baseExp: 10, description: 'Make a purchase (10 EXP per transaction)', icon: '💳', category: 'trading' },
  { action: 'first_sale', baseExp: 150, description: 'Complete your first sale', icon: '💰', category: 'trading' },
  { action: 'sale', baseExp: 25, description: 'Complete a sale (25 EXP per transaction)', icon: '🏪', category: 'trading' },
  { action: 'big_transaction', baseExp: 100, description: 'Transaction above 1M IDR', icon: '💎', category: 'trading' },
  
  // Social Actions - NO EXP (just achievements)
  { action: 'positive_review', baseExp: 0, description: 'Receive a positive review (achievement only)', icon: '⭐', category: 'social' },
  { action: 'give_review', baseExp: 0, description: 'Give a helpful review (achievement only)', icon: '📝', category: 'social' },
  { action: 'help_user', baseExp: 0, description: 'Help another user (achievement only)', icon: '🤝', category: 'social' },
  { action: 'chat_activity', baseExp: 0, description: 'Active participation (achievement only)', icon: '💬', category: 'social' },
  
  // Discovery Actions - NO EXP (just achievements)  
  { action: 'daily_login', baseExp: 0, description: 'Login daily (achievement only)', icon: '📅', category: 'discovery' },
  { action: 'profile_complete', baseExp: 0, description: 'Complete profile (achievement only)', icon: '👤', category: 'discovery' },
  { action: 'browse_products', baseExp: 0, description: 'Browse products (achievement only)', icon: '🔍', category: 'discovery' },
  { action: 'use_search', baseExp: 0, description: 'Use search (achievement only)', icon: '🔎', category: 'discovery' },
  { action: 'visit_game_page', baseExp: 0, description: 'Visit game page (achievement only)', icon: '🎮', category: 'discovery' },
]

// Title progression based on sales amount (IDR) - NO LEVELS, ONLY TITLES
export const TITLE_REQUIREMENTS = [
  { 
    id: 'human', 
    name: 'Human', 
    salesRequired: 0, 
    unlocks: ['Basic marketplace access', 'Profile creation'] 
  },
  { 
    id: 'demi_god', 
    name: 'Demi God', 
    salesRequired: 10000000, // 10M IDR
    unlocks: ['Advanced search filters', 'Price alerts', 'Wishlist'] 
  }, 
  { 
    id: 'god', 
    name: 'God', 
    salesRequired: 50000000, // 50M IDR
    unlocks: ['Priority support', 'Custom themes', 'Beta features'] 
  },
  { 
    id: 'all_father', 
    name: 'All Father', 
    salesRequired: 100000000, // 100M IDR
    unlocks: ['VIP status', 'Exclusive events', 'Advanced analytics'] 
  },
  { 
    id: 'one_above_all', 
    name: 'One Above All', 
    salesRequired: 500000000, // 500M IDR
    unlocks: ['Ultimate status', 'Hall of Fame', 'All features'] 
  }
]

// Calculate title info from total sales amount
export function calculateTitle(totalSales: number): TitleInfo {
  let currentTitle = TITLE_REQUIREMENTS[0] // Default to Human
  let nextTitle = TITLE_REQUIREMENTS[1] // Default to Demi God
  
  // Find current title based on sales
  for (let i = TITLE_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (totalSales >= TITLE_REQUIREMENTS[i].salesRequired) {
      currentTitle = TITLE_REQUIREMENTS[i]
      nextTitle = TITLE_REQUIREMENTS[i + 1] || null // Next title or null if max
      break
    }
  }
  
  const salesToNext = nextTitle ? nextTitle.salesRequired - totalSales : 0
  const progress = nextTitle ? (totalSales / nextTitle.salesRequired) * 100 : 100
  
  return {
    currentTitle,
    nextTitle,
    currentSales: totalSales,
    salesToNext: Math.max(0, salesToNext),
    progress: Math.min(100, Math.max(0, progress))
  }
}

// Get EXP for specific action
export function getExpForAction(action: string, multiplier: number = 1): number {
  const source = EXP_SOURCES.find(s => s.action === action)
  if (!source) return 0
  
  return Math.floor(source.baseExp * multiplier)
}

// Format sales amount with abbreviations  
export function formatSales(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B IDR`
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M IDR`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K IDR`
  }
  return `${amount.toLocaleString()} IDR`
}

// Get next title milestone
export function getNextTitleMilestone(currentTitleId: string): { title: any } | null {
  const currentIndex = TITLE_REQUIREMENTS.findIndex(t => t.id === currentTitleId)
  const nextTitle = TITLE_REQUIREMENTS[currentIndex + 1]
  
  if (!nextTitle) return null
  
  return { title: nextTitle }
}