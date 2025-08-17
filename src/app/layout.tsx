import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-gaming',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'PasargameX - Gaming Marketplace',
  description: 'The ultimate marketplace for gaming accounts, items, and services',
  keywords: 'gaming, marketplace, accounts, items, services, buy, sell',
  authors: [{ name: 'PasargameX Team' }],
  creator: 'PasargameX',
  publisher: 'PasargameX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pasargamex.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PasargameX - Gaming Marketplace',
    description: 'The ultimate marketplace for gaming accounts, items, and services',
    url: 'https://pasargamex.com',
    siteName: 'PasargameX',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PasargameX - Gaming Marketplace',
    description: 'The ultimate marketplace for gaming accounts, items, and services',
    creator: '@pasargamex',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${orbitron.variable} antialiased`}>
        <AuthProvider>
          <CurrencyProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}