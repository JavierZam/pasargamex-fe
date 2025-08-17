'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import { getDisplayPrice } from '@/lib/currency'

interface PriceDisplayProps {
  /** Base price in IDR */
  basePrice: number
  /** Additional CSS classes */
  className?: string
  /** Show currency code alongside symbol */
  showCurrencyCode?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function PriceDisplay({ 
  basePrice, 
  className = '', 
  showCurrencyCode = false,
  size = 'md'
}: PriceDisplayProps) {
  const { currency } = useCurrency()
  const { formatted, currency: displayCurrency } = getDisplayPrice(basePrice, currency)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }

  return (
    <span className={`font-bold ${sizeClasses[size]} ${className}`} suppressHydrationWarning>
      {formatted}
      {showCurrencyCode && (
        <span className="text-sm font-normal ml-1 opacity-70">
          {displayCurrency}
        </span>
      )}
    </span>
  )
}