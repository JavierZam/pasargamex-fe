'use client'

import { useState } from 'react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'security' | 'payments' | 'products' | 'support'
}

const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    question: 'How does PasargameX ensure secure transactions?',
    answer: 'We use a secure escrow system that holds your payment until you confirm receipt of your purchase. All transactions are encrypted with bank-level SSL security, and our platform is monitored 24/7 for fraud prevention.',
    category: 'security'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, digital wallets (Apple Pay, Google Pay), and select cryptocurrencies (Bitcoin, Ethereum). All payments are processed securely.',
    category: 'payments'
  },
  {
    id: '3',
    question: 'How quickly will I receive my gaming account or items?',
    answer: 'Most digital products are delivered instantly after payment confirmation. Physical items or services may take 24-48 hours depending on the seller. You\'ll receive notifications at each step of the process.',
    category: 'products'
  },
  {
    id: '4',
    question: 'What if I have issues with my purchase?',
    answer: 'Our 24/7 support team is here to help! We offer dispute resolution services and will work with you and the seller to resolve any issues. If resolution isn\'t possible, you\'re protected by our money-back guarantee.',
    category: 'support'
  },
  {
    id: '5',
    question: 'Can I sell my gaming accounts on PasargameX?',
    answer: 'Yes! Create a seller account, verify your identity, and list your products. We charge a small commission only when you make a sale. Our platform helps you reach thousands of potential buyers safely.',
    category: 'general'
  },
  {
    id: '6',
    question: 'Are the gaming accounts safe to use?',
    answer: 'All sellers undergo identity verification, and we have strict policies against fraudulent accounts. However, please be aware of the terms of service of the respective games and use purchased accounts responsibly.',
    category: 'products'
  },
  {
    id: '7',
    question: 'What happens if I get banned on a purchased account?',
    answer: 'While rare with our verified sellers, we offer account replacement or refund policies depending on the seller\'s terms. We recommend reviewing each listing\'s warranty before purchasing.',
    category: 'products'
  },
  {
    id: '8',
    question: 'How do I contact customer support?',
    answer: 'You can reach our support team through live chat (24/7), email, or our support ticket system. We typically respond within 15 minutes during peak hours and maintain a 98% satisfaction rate.',
    category: 'support'
  },
  {
    id: '9',
    question: 'Is my personal information secure?',
    answer: 'Absolutely. We use industry-standard encryption, comply with GDPR regulations, and never share your personal information with third parties without your consent. Your privacy is our priority.',
    category: 'security'
  },
  {
    id: '10',
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer refunds through our dispute resolution system if the product doesn\'t match the description or if there are issues with delivery. Digital products have a 48-hour dispute window.',
    category: 'payments'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Questions', icon: '❓' },
  { id: 'general', name: 'General', icon: '🔧' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'payments', name: 'Payments', icon: '💳' },
  { id: 'products', name: 'Products', icon: '🎮' },
  { id: 'support', name: 'Support', icon: '🆘' }
]

export default function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return FAQ_DATA.length
    return FAQ_DATA.filter(faq => faq.category === categoryId).length
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">FREQUENTLY </span>
            <span className="text-brand-blue">ASKED QUESTIONS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
            Got questions? We've got answers! Find everything you need to know about 
            buying, selling, and staying safe on PasargameX.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-brand-red text-white gaming-glow'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-xs opacity-75">({getCategoryCount(category.id)})</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="text-white font-semibold mb-2">No questions found</h3>
              <p className="text-gray-400">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div 
                key={faq.id}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-brand-red font-bold text-sm">
                      Q{index + 1}
                    </div>
                    <h3 className="text-white font-medium text-lg">
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`transform transition-transform duration-200 ${
                    openFAQ === faq.id ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-200 ${
                  openFAQ === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4">
                    <div className="pl-8 border-l-2 border-brand-blue/30">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is available 24/7 to help. 
            We typically respond within 15 minutes and maintain a 98% satisfaction rate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all gaming-glow">
              Start Live Chat
            </button>
            <button className="px-8 py-4 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all rounded-lg font-semibold">
              Email Support
            </button>
          </div>

          {/* Contact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">15 min</div>
              <div className="text-gray-400 text-sm">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Support Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Popular Guides */}
        <div className="mt-16 text-center">
          <h4 className="text-xl font-bold text-white mb-6">Popular Guides</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left group">
              <div className="text-brand-red text-2xl mb-2 group-hover:scale-110 transition-transform">📖</div>
              <div className="text-white font-medium mb-1">How to Buy Safely</div>
              <div className="text-gray-400 text-sm">Complete guide to secure purchasing</div>
            </button>
            <button className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left group">
              <div className="text-brand-blue text-2xl mb-2 group-hover:scale-110 transition-transform">💼</div>
              <div className="text-white font-medium mb-1">Seller Guidelines</div>
              <div className="text-gray-400 text-sm">Everything about selling on our platform</div>
            </button>
            <button className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left group">
              <div className="text-yellow-400 text-2xl mb-2 group-hover:scale-110 transition-transform">🛡️</div>
              <div className="text-white font-medium mb-1">Security Best Practices</div>
              <div className="text-gray-400 text-sm">Tips to keep your accounts secure</div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}