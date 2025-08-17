// Exchange rate management
export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

// Static rates for MVP (could be database or API later)
export const EXCHANGE_RATES: Record<string, ExchangeRate> = {
  'USD_IDR': {
    from: 'USD',
    to: 'IDR', 
    rate: 15800, // 1 USD = 15,800 IDR
    lastUpdated: new Date().toISOString()
  },
  'IDR_USD': {
    from: 'IDR',
    to: 'USD',
    rate: 1 / 15800, // 1 IDR = 0.0000633 USD
    lastUpdated: new Date().toISOString()
  }
}

// Get current exchange rate
export const getExchangeRate = (from: string, to: string): number => {
  const key = `${from}_${to}`
  return EXCHANGE_RATES[key]?.rate || 1
}

// For production: fetch live rates from API
export const fetchLiveRates = async (): Promise<Record<string, ExchangeRate>> => {
  try {
    // Example: CurrencyAPI, Fixer.io, or Bank Indonesia API
    // const response = await fetch('https://api.currencyapi.com/v3/latest?apikey=YOUR_KEY&currencies=USD,IDR')
    // const data = await response.json()
    // return processApiResponse(data)
    
    // For now, return static rates
    return EXCHANGE_RATES
  } catch (error) {
    console.error('Failed to fetch live exchange rates:', error)
    return EXCHANGE_RATES
  }
}

// Update rates periodically (could be cron job)
export const updateExchangeRates = async (): Promise<void> => {
  const newRates = await fetchLiveRates()
  Object.assign(EXCHANGE_RATES, newRates)
}