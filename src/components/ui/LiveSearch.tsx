'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui'

interface SearchSuggestion {
  id: string
  type: 'game' | 'product' | 'seller' | 'category'
  title: string
  subtitle: string
  icon: string
  url: string
  count?: number
}

interface LiveSearchProps {
  placeholder?: string
  className?: string
  showRecentSearches?: boolean
}

export default function LiveSearch({ 
  placeholder = "Search games, products, sellers...", 
  className = "",
  showRecentSearches = true 
}: LiveSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent and popular searches on mount
  useEffect(() => {
    const recent = localStorage.getItem('pasargamex_recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5))
    }
    
    // Mock popular searches - in real app this would come from API
    setPopularSearches([
      'Genshin Impact',
      'Valorant',
      'Mobile Legends',
      'PUBG Mobile',
      'Free Fire'
    ])
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const suggestions = await fetchSearchSuggestions(searchQuery)
        setSuggestions(suggestions)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      setIsLoading(true)
      debouncedSearch(value.trim())
    } else {
      setSuggestions([])
      setIsLoading(false)
    }
  }

  // Fetch search suggestions
  const fetchSearchSuggestions = async (searchQuery: string): Promise<SearchSuggestion[]> => {
    const suggestions: SearchSuggestion[] = []
    
    try {
      // Search game titles
      const gamesResponse = await apiClient.getGameTitles()
      if (gamesResponse.success && gamesResponse.data) {
        const games = Array.isArray(gamesResponse.data) 
          ? gamesResponse.data 
          : gamesResponse.data.items || []
        
        const matchingGames = games
          .filter((game: any) => 
            game.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .map((game: any) => ({
            id: `game-${game.id}`,
            type: 'game' as const,
            title: game.name,
            subtitle: 'Game Title',
            icon: '🎮',
            url: `/products?gameTitle=${game.id}`,
            count: Math.floor(Math.random() * 500) + 50 // Mock count
          }))
        
        suggestions.push(...matchingGames)
      }
    } catch (error) {
      console.error('Error fetching game titles:', error)
    }

    // Mock product suggestions
    const productSuggestions: SearchSuggestion[] = [
      {
        id: `product-${searchQuery}`,
        type: 'product',
        title: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Account`,
        subtitle: 'Product Search',
        icon: '🔍',
        url: `/products?search=${encodeURIComponent(searchQuery)}`,
        count: Math.floor(Math.random() * 200) + 20
      },
      {
        id: `product-${searchQuery}-item`,
        type: 'product', 
        title: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Items`,
        subtitle: 'Product Search',
        icon: '⚡',
        url: `/products?search=${encodeURIComponent(searchQuery + ' items')}`,
        count: Math.floor(Math.random() * 150) + 10
      }
    ]
    
    suggestions.push(...productSuggestions.slice(0, 2))

    // Mock seller suggestions
    if (searchQuery.length >= 3) {
      const sellerSuggestions: SearchSuggestion[] = [
        {
          id: `seller-${searchQuery}`,
          type: 'seller',
          title: `@${searchQuery}master`,
          subtitle: 'Trusted Seller',
          icon: '👤',
          url: `/seller/mock-seller-id`,
          count: Math.floor(Math.random() * 50) + 5
        }
      ]
      
      suggestions.push(...sellerSuggestions)
    }

    // Mock category suggestions  
    const categories = ['Account', 'Top-up', 'Boosting', 'Items']
    const matchingCategories = categories
      .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(cat => ({
        id: `category-${cat}`,
        type: 'category' as const,
        title: `${cat} - ${searchQuery}`,
        subtitle: 'Category',
        icon: '📂',
        url: `/products?category=${cat}&search=${encodeURIComponent(searchQuery)}`,
        count: Math.floor(Math.random() * 100) + 10
      }))
    
    suggestions.push(...matchingCategories.slice(0, 1))

    return suggestions.slice(0, 6) // Limit to 6 suggestions
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (query.trim()) {
          handleSearch(query.trim())
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    saveToRecentSearches(suggestion.title)
    setQuery('')
    setIsOpen(false)
    router.push(suggestion.url)
  }

  // Handle direct search
  const handleSearch = (searchQuery: string) => {
    saveToRecentSearches(searchQuery)
    setQuery('')
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // Save to recent searches
  const saveToRecentSearches = (searchTerm: string) => {
    const recent = JSON.parse(localStorage.getItem('pasargamex_recent_searches') || '[]')
    const updated = [searchTerm, ...recent.filter((item: string) => item !== searchTerm)].slice(0, 10)
    localStorage.setItem('pasargamex_recent_searches', JSON.stringify(updated))
    setRecentSearches(updated.slice(0, 5))
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string, icon: string) => {
    return icon || {
      'game': '🎮',
      'product': '🔍', 
      'seller': '👤',
      'category': '📂'
    }[type] || '🔍'
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-700/50">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <span className="text-lg">{getSuggestionIcon(suggestion.type, suggestion.icon)}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{suggestion.title}</div>
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                      <span>{suggestion.subtitle}</span>
                      {suggestion.count && (
                        <span className="text-brand-blue">• {suggestion.count} items</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-gray-400 text-sm">No suggestions found for "{query}"</div>
              <button
                onClick={() => handleSearch(query)}
                className="mt-3 text-brand-red hover:text-brand-blue text-sm font-medium"
              >
                Search anyway →
              </button>
            </div>
          )}

          {/* Recent & Popular searches when no query */}
          {!query && showRecentSearches && (recentSearches.length > 0 || popularSearches.length > 0) && (
            <div className="py-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-700/50">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div className={recentSearches.length > 0 ? 'border-t border-gray-700/50 mt-2 pt-2' : ''}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-700/50">
                    Popular Searches
                  </div>
                  {popularSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={`popular-${index}`}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoading && query.length >= 2 && (
            <div className="py-8 text-center">
              <LoadingSpinner size="sm" />
              <div className="text-gray-400 text-sm mt-2">Searching...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}