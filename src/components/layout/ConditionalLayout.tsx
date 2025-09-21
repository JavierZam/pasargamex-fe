'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/header'
import FloatingNav from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Pages that should not show footer
  const hideFooterOnPages = ['/chat']
  const shouldHideFooter = hideFooterOnPages.includes(pathname)
  
  // Pages that should be full screen (no header/footer)
  const fullScreenPages = ['/chat']
  const isFullScreen = fullScreenPages.includes(pathname)
  
  if (isFullScreen) {
    return (
      <div className="relative min-h-screen">
        {children}
      </div>
    )
  }
  
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
      <FloatingNav />
    </div>
  )
}