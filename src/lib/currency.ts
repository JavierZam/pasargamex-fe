// Currency configuration and utilities
import { getExchangeRate } from './exchange-rate'

export type Currency = 'IDR' | 'USD'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    locale: 'id-ID'
  },
  USD: {
    code: 'USD', 
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US'
  }
}

export const DEFAULT_CURRENCY: Currency = 'IDR'

// Get user's preferred currency from localStorage or default
export const getUserCurrency = (): Currency => {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  
  const saved = localStorage.getItem('user_currency') as Currency
  return saved && CURRENCIES[saved] ? saved : DEFAULT_CURRENCY
}

// Save user's currency preference
export const setUserCurrency = (currency: Currency): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user_currency', currency)
}

// Convert price from base currency (IDR) to target currency
export const convertPrice = (priceInIDR: number, toCurrency: Currency): number => {
  if (toCurrency === 'IDR') return priceInIDR
  
  // Use dynamic exchange rate
  const rate = getExchangeRate('IDR', toCurrency)
  return Math.round(priceInIDR * rate)
}

// Format price with proper currency symbol and locale
export const formatPrice = (price: number, currency: Currency = DEFAULT_CURRENCY): string => {
  const config = CURRENCIES[currency]
  
  if (currency === 'IDR') {
    // Format IDR without decimals: Rp 150.000
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  } else {
    // Format USD with decimals: $150.00
    return new Intl.NumberFormat(config.locale, {
      style: 'currency', 
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }
}

// Get display price in user's preferred currency
export const getDisplayPrice = (basePrice: number, userCurrency?: Currency): {
  price: number
  formatted: string
  currency: Currency
} => {
  const currency = userCurrency || getUserCurrency()
  const convertedPrice = convertPrice(basePrice, currency)
  
  return {
    price: convertedPrice,
    formatted: formatPrice(convertedPrice, currency),
    currency
  }
}