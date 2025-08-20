'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'

interface QuickNavItem {
  title: string
  description: string
  href: string
  icon: string
  gradient: string
  stats?: string
}

export default function QuickNavigationSection() {
  const quickNavItems: QuickNavItem[] = [
    {
      title: 'Browse Products',
      description: 'Explore thousands of gaming accounts and items',
      href: '/products',
      icon: '🎮',
      gradient: 'from-blue-600 to-purple-600',
      stats: '5,000+ products'
    },
    {
      title: 'Categories',
      description: 'Find products by game and category',
      href: '/categories',
      icon: '📂',
      gradient: 'from-purple-600 to-pink-600',
      stats: '50+ games'
    },
    {
      title: 'Compare Products',
      description: 'Compare features and prices side by side',
      href: '/compare',
      icon: '⚖️',
      gradient: 'from-orange-600 to-red-600',
      stats: 'Smart comparison'
    },
    {
      title: 'My Dashboard',
      description: 'Track your purchases and activity',
      href: '/dashboard',
      icon: '📊',
      gradient: 'from-green-600 to-teal-600',
      stats: 'Personal hub'
    },
    {
      title: 'Seller Hub',
      description: 'Manage your products and sales',
      href: '/seller/dashboard',
      icon: '🚀',
      gradient: 'from-emerald-600 to-cyan-600',
      stats: 'Business tools'
    },
    {
      title: 'My Orders',
      description: 'View your purchase history',
      href: '/transactions',
      icon: '📋',
      gradient: 'from-indigo-600 to-blue-600',
      stats: 'Order tracking'
    }
  ]

  return (
    <section className="py-16 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">Quick</span> <span className="text-brand-blue">Access</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Navigate to your most-used features with a single click
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickNavItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="group bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gray-900/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    {item.stats && (
                      <div className="bg-gray-700/50 px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-600/50">
                        {item.stats}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-red group-hover:to-brand-blue transition-all duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                    <span>Quick access</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-3xl p-8 border border-gray-700/30">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4 font-gaming">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-400 mb-6">
                Our support team is here to help you navigate PasargameX and make the most of our platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/support">
                  <button className="bg-gradient-to-r from-brand-red to-brand-blue px-6 py-3 rounded-2xl font-semibold text-white hover:shadow-lg hover:shadow-brand-red/30 transition-all duration-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v18m9-9H3" />
                    </svg>
                    Get Support
                  </button>
                </Link>
                <Link href="/products">
                  <button className="border-2 border-gray-600 px-6 py-3 rounded-2xl font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300">
                    Start Browsing
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}