'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface GameTitle {
  id: string
  name: string
  slug: string
  description: string
  icon_url?: string
}

interface SearchFilters {
  query: string
  game_title_id: string
  type: string
  status: string
  min_price: number
  max_price: number
  sort: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

const PRODUCT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'account', label: 'Accounts' },
  { value: 'topup', label: 'Top-Up' },
  { value: 'boosting', label: 'Boosting' },
  { value: 'item', label: 'Items' }
]

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'views_desc', label: 'Most Viewed' },
  { value: 'sold_desc', label: 'Best Selling' }
]

export default function AdvancedSearch({ onSearch, isLoading = false }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    game_title_id: '',
    type: '',
    status: 'active',
    min_price: 0,
    max_price: 0,
    sort: ''
  })
  
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    loadGameTitles()
  }, [])

  const loadGameTitles = async () => {
    try {
      const response = await apiClient.getGameTitles({ limit: 50, status: 'active' })
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as any).items || []
        setGameTitles(items)
      }
    } catch (error) {
      console.error('Error loading game titles:', error)
    }
  }

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }))
    
    const numValue = parseFloat(value) || 0
    if (type === 'min') {
      handleInputChange('min_price', numValue)
    } else {
      handleInputChange('max_price', numValue)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const resetFilters = () => {
    const resetFilters = {
      query: '',
      game_title_id: '',
      type: '',
      status: 'active',
      min_price: 0,
      max_price: 0,
      sort: ''
    }
    setFilters(resetFilters)
    setPriceRange({ min: '', max: '' })
    onSearch(resetFilters)
  }

  const hasActiveFilters = filters.query || filters.game_title_id || filters.type || 
                          filters.min_price > 0 || filters.max_price > 0 || filters.sort

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
      <form onSubmit={handleSearch}>
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            placeholder="Search for gaming accounts, items, or services..."
            className="block w-full pl-10 pr-24 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="mr-2 px-6 py-2 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filters.game_title_id}
            onChange={(e) => handleInputChange('game_title_id', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
          >
            <option value="">All Games</option>
            {gameTitles.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
          >
            {PRODUCT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleInputChange('sort', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            Advanced
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                    />
                  </div>
                  <span className="text-gray-400">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                >
                  <option value="active">Active Only</option>
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Collapse
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            
            {filters.query && (
              <span className="px-2 py-1 bg-brand-red/20 text-brand-red text-xs rounded-full border border-brand-red/30">
                Search: "{filters.query}"
              </span>
            )}
            
            {filters.game_title_id && (
              <span className="px-2 py-1 bg-brand-blue/20 text-brand-blue text-xs rounded-full border border-brand-blue/30">
                Game: {gameTitles.find(g => g.id === filters.game_title_id)?.name}
              </span>
            )}
            
            {filters.type && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                Type: {PRODUCT_TYPES.find(t => t.value === filters.type)?.label}
              </span>
            )}
            
            {(filters.min_price > 0 || filters.max_price > 0) && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                Price: {filters.min_price > 0 ? `${filters.min_price.toLocaleString()}` : '0'} - {filters.max_price > 0 ? `${filters.max_price.toLocaleString()}` : '∞'}
              </span>
            )}
            
            {filters.sort && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                Sort: {SORT_OPTIONS.find(s => s.value === filters.sort)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}