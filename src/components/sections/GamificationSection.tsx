'use client'

import dynamic from 'next/dynamic'

const GamificationSectionClient = dynamic(
  () => import('./GamificationSectionClient'),
  {
    ssr: false,
    loading: () => (
      <section className="py-16 bg-gradient-to-br from-gray-900/50 to-black/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-white">Loading Gaming Achievements...</h3>
          </div>
        </div>
      </section>
    )
  }
)

export default function GamificationSection() {
  return <GamificationSectionClient />
}