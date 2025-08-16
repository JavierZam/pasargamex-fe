'use client'

import { useState, useEffect } from 'react'

interface SecurityFeature {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'verified' | 'protected'
  color: string
}

interface PaymentMethod {
  name: string
  logo: string
  supported: boolean
  popular: boolean
}

interface Certification {
  name: string
  badge: string
  description: string
  verified: boolean
}

const SECURITY_FEATURES: SecurityFeature[] = [
  {
    id: '1',
    title: 'Escrow Protection',
    description: 'Your money is held securely until delivery is confirmed',
    icon: '🔒',
    status: 'protected',
    color: 'text-green-400'
  },
  {
    id: '2',
    title: 'Identity Verification',
    description: 'All sellers undergo thorough identity verification',
    icon: '✅',
    status: 'verified',
    color: 'text-blue-400'
  },
  {
    id: '3',
    title: '24/7 Security Monitoring',
    description: 'Advanced fraud detection and real-time monitoring',
    icon: '🛡️',
    status: 'active',
    color: 'text-red-400'
  },
  {
    id: '4',
    title: 'Data Encryption',
    description: 'Bank-level SSL encryption protects your information',
    icon: '🔐',
    status: 'protected',
    color: 'text-yellow-400'
  },
  {
    id: '5',
    title: 'Dispute Resolution',
    description: 'Professional mediation for any transaction issues',
    icon: '⚖️',
    status: 'active',
    color: 'text-purple-400'
  },
  {
    id: '6',
    title: 'Account Recovery',
    description: 'Full support if you lose access to purchased accounts',
    icon: '🔄',
    status: 'protected',
    color: 'text-cyan-400'
  }
]

const PAYMENT_METHODS: PaymentMethod[] = [
  { name: 'PayPal', logo: '💳', supported: true, popular: true },
  { name: 'Visa', logo: '💳', supported: true, popular: true },
  { name: 'Mastercard', logo: '💳', supported: true, popular: true },
  { name: 'American Express', logo: '💳', supported: true, popular: false },
  { name: 'Bitcoin', logo: '₿', supported: true, popular: false },
  { name: 'Ethereum', logo: '⟠', supported: true, popular: false },
  { name: 'Google Pay', logo: '📱', supported: true, popular: true },
  { name: 'Apple Pay', logo: '🍎', supported: true, popular: true }
]

const CERTIFICATIONS: Certification[] = [
  {
    name: 'SSL Secured',
    badge: '🔒',
    description: 'SSL Certificate from trusted authority',
    verified: true
  },
  {
    name: 'PCI Compliant',
    badge: '🏛️',
    description: 'Payment Card Industry compliant',
    verified: true
  },
  {
    name: 'ISO Certified',
    badge: '📋',
    description: 'ISO 27001 Information Security',
    verified: true
  },
  {
    name: 'GDPR Compliant',
    badge: '🛡️',
    description: 'Full GDPR compliance for EU users',
    verified: true
  }
]

export default function TrustElementsSection() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % SECURITY_FEATURES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'verified': return 'bg-blue-500'
      case 'protected': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'verified': return 'Verified'
      case 'protected': return 'Protected'
      default: return 'Status'
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white font-gaming mb-4">
            <span className="text-brand-red">SECURITY </span>
            <span className="text-brand-blue">& TRUST</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Your safety is our priority. We employ industry-leading security measures and support 
            multiple trusted payment methods to ensure your transactions are always protected.
          </p>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Security Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY_FEATURES.map((feature, index) => (
              <div 
                key={feature.id}
                className={`bg-gray-800/30 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                  index === activeFeature 
                    ? 'border-brand-red shadow-2xl shadow-brand-red/20 transform scale-105' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)} animate-pulse`} />
                    <span className={`text-xs font-medium ${feature.color}`}>
                      {getStatusText(feature.status)}
                    </span>
                  </div>
                </div>

                {/* Feature Info */}
                <h4 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Active Indicator */}
                {index === activeFeature && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-brand-red text-sm font-medium">
                      <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                      Currently Highlighted
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Supported Payment Methods
          </h3>
          
          <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              {PAYMENT_METHODS.map((method, index) => (
                <div 
                  key={method.name}
                  className={`relative bg-gray-700/50 rounded-lg p-4 text-center transition-all hover:bg-gray-600/50 hover:transform hover:scale-105 ${
                    method.popular ? 'ring-2 ring-brand-blue/30' : ''
                  }`}
                >
                  {method.popular && (
                    <div className="absolute -top-2 -right-2 bg-brand-blue text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="text-3xl mb-2">{method.logo}</div>
                  <div className="text-white text-xs font-medium">{method.name}</div>
                  <div className="mt-2">
                    <div className={`w-3 h-3 mx-auto rounded-full ${
                      method.supported ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                All payments are processed through secure, encrypted channels with industry-standard protocols.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Popular</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Badges */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Certifications & Compliance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, index) => (
              <div 
                key={cert.name}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-all hover:shadow-xl"
              >
                <div className="text-4xl mb-3">{cert.badge}</div>
                <h4 className="text-white font-semibold mb-2">{cert.name}</h4>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                  {cert.description}
                </p>
                {cert.verified && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Verified
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Stats */}
        <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">256-bit</div>
              <div className="text-gray-400 text-sm">SSL Encryption</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Security Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400 mb-2">0%</div>
              <div className="text-gray-400 text-sm">Fraud Rate</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-300 text-sm max-w-2xl mx-auto">
              Our commitment to security means you can focus on what matters most - your gaming experience. 
              Every transaction is protected by our comprehensive security infrastructure.
            </p>
          </div>
        </div>

        {/* Contact Security Team */}
        <div className="text-center mt-12">
          <div className="max-w-md mx-auto">
            <h4 className="text-white font-semibold mb-4">Security Concerns?</h4>
            <p className="text-gray-400 text-sm mb-6">
              Our security team is available 24/7 to address any concerns or questions.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all gaming-glow">
              Contact Security Team
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}