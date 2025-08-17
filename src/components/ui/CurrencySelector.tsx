'use client'

import { useState } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Currency } from '@/lib/currency'

export default function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
      >
        <span className="font-medium">{currencies[currency].symbol}</span>
        <span className="text-xs">{currency}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
          {Object.entries(currencies).map(([code, config]) => (
            <button
              key={code}
              onClick={() => {
                setCurrency(code as Currency)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                currency === code ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{config.symbol} {code}</span>
                {currency === code && (
                  <svg className="w-4 h-4 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-gray-400">{config.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}