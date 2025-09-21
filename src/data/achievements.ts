import { Achievement, UserTitle } from '@/types/gamification'

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'founding_father',
    title: 'The Founding Father',
    description: 'One of the first 1000 verified users of PasargameX',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    points: 500,
    requirement: 'Be among the first 1000 verified users',
    unlocked: false,
    isSecret: false
  },
  {
    id: 'first_purchase',
    title: 'First Steps',
    description: 'Made your first purchase on PasargameX',
    icon: '🎯',
    category: 'trading',
    rarity: 'common',
    points: 50,
    requirement: 'Complete your first purchase',
    unlocked: false,
    isSecret: false
  },
  {
    id: 'first_sale',
    title: 'Entrepreneur',
    description: 'Made your first successful sale',
    icon: '💰',
    category: 'trading',
    rarity: 'common',
    points: 100,
    requirement: 'Complete your first sale',
    unlocked: false,
    isSecret: false
  },

  // Secret Achievements
  {
    id: 'no_one_text_you_yet',
    title: 'No One Text You Yet',
    description: 'Switched between Chat and Dashboard 10 times in a row',
    icon: '💬',
    category: 'secret',
    rarity: 'rare',
    points: 150,
    requirement: 'Switch between Chat and Dashboard repeatedly',
    unlocked: false,
    isSecret: true,
    hint: 'Sometimes the silence speaks volumes...'
  },
  {
    id: 'click_master',
    title: 'Click Master',
    description: 'Clicked the floating action button 50 times',
    icon: '🖱️',
    category: 'secret',
    rarity: 'rare',
    points: 150, // Same as other rare achievements
    requirement: 'Click floating button 50 times',
    unlocked: false,
    isSecret: true,
    hint: 'Some buttons are meant to be clicked... a lot'
  },
  {
    id: 'midnight_gamer',
    title: 'Midnight Gamer',
    description: 'Browsed products at exactly 3:33 AM',
    icon: '🌙',
    category: 'secret',
    rarity: 'epic',
    points: 300, // Same as other epic achievements
    requirement: 'Browse products at 3:33 AM',
    unlocked: false,
    isSecret: true,
    hint: 'When the clock strikes a mystical time...'
  },
  {
    id: 'konami_master',
    title: 'Konami Master',
    description: 'Entered the legendary code on the homepage',
    icon: '🎮',
    category: 'secret',
    rarity: 'mythic',
    points: 1000,
    requirement: 'Enter the Konami code',
    unlocked: false,
    isSecret: true,
    hint: 'Up, Up, Down, Down, Left, Right, Left, Right...'
  },
  {
    id: 'logo_lover',
    title: 'Logo Lover',
    description: 'Clicked the PasargameX logo 25 times',
    icon: '❤️',
    category: 'secret',
    rarity: 'rare',
    points: 150, // Same as other rare achievements
    requirement: 'Click logo 25 times',
    unlocked: false,
    isSecret: true,
    hint: 'Show some love to our brand!'
  },
  {
    id: 'search_enthusiast',
    title: 'Search Enthusiast',
    description: 'Performed 100 searches without finding anything',
    icon: '🔍',
    category: 'secret',
    rarity: 'epic',
    points: 300, // Same as other epic achievements
    requirement: 'Search 100 times with no results',
    unlocked: false,
    isSecret: true,
    hint: 'Sometimes the journey is more important than the destination'
  },

  // Trading Achievements
  {
    id: 'big_spender',
    title: 'Big Spender',
    description: 'Spent over 50 million rupiah in total',
    icon: '💎',
    category: 'trading',
    rarity: 'epic',
    points: 300,
    requirement: 'Spend 50,000,000 IDR total',
    unlocked: false,
    isSecret: false
  },
  {
    id: 'sales_champion',
    title: 'Sales Champion',
    description: 'Earned over 100 million rupiah from sales',
    icon: '🏆',
    category: 'trading',
    rarity: 'legendary',
    points: 500,
    requirement: 'Earn 100,000,000 IDR from sales',
    unlocked: false,
    isSecret: false
  },

  // Social Achievements
  {
    id: 'trusted_seller',
    title: 'Trusted Seller',
    description: 'Achieved 100 positive reviews',
    icon: '⭐',
    category: 'social',
    rarity: 'rare',
    points: 200,
    requirement: 'Get 100 positive reviews',
    unlocked: false,
    isSecret: false
  },
  {
    id: 'community_helper',
    title: 'Community Helper',
    description: 'Helped 50 users through support tickets',
    icon: '🤝',
    category: 'social',
    rarity: 'rare',
    points: 150,
    requirement: 'Help 50 users',
    unlocked: false,
    isSecret: false
  }
]

export const USER_TITLES: UserTitle[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'A new member of the PasargameX community',
    icon: '👤',
    level: 1,
    requirement: { type: 'exp', value: 0 },
    color: 'text-gray-400',
    gradient: 'from-gray-500 to-gray-600',
    isUnlocked: true
  },
  {
    id: 'demi_god',
    name: 'Demi God',
    description: 'Rising above mortal limitations',
    icon: '⚡',
    level: 2,
    requirement: { type: 'exp', value: 500 }, // Achievable with 5-10 achievements
    color: 'text-yellow-400',
    gradient: 'from-yellow-400 to-orange-500',
    isUnlocked: false
  },
  {
    id: 'god',
    name: 'God',
    description: 'Master of the gaming realm',
    icon: '🔥',
    level: 3,
    requirement: { type: 'exp', value: 1200 }, // Mix of achievements and some sales
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-500',
    isUnlocked: false
  },
  {
    id: 'all_father',
    name: 'All Father',
    description: 'Ruler of all gaming domains',
    icon: '👑',
    level: 4,
    requirement: { type: 'exp', value: 2500 }, // Requires dedication but achievable
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-600',
    isUnlocked: false
  },
  {
    id: 'one_above_all',
    name: 'One Above All',
    description: 'The ultimate gaming marketplace legend',
    icon: '✨',
    level: 5,
    requirement: { type: 'exp', value: 5000 }, // Ultimate goal but fair
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300',
    gradient: 'from-pink-300 via-purple-300 to-cyan-300',
    isUnlocked: false
  }
]

export const ACHIEVEMENT_RARITIES = {
  common: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/50',
    glow: 'shadow-gray-500/20'
  },
  rare: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20'
  },
  epic: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/20'
  },
  legendary: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/20'
  },
  mythic: {
    color: 'text-pink-400',
    bg: 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20',
    border: 'border-pink-500/50',
    glow: 'shadow-pink-500/30'
  }
}