import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8 xl:col-span-1">
            <div className="font-gaming text-2xl font-bold">
              <span className="text-brand-red">PASAR</span>
              <span className="text-brand-blue">GAMEX</span>
            </div>
            <p className="text-gray-400 text-base max-w-xs">
              The ultimate marketplace for gaming accounts, items, and services. 
              Secure, fast, and trusted by gamers worldwide.
            </p>
            <div className="flex space-x-6">
              {/* Social Media Links */}
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C8.396 0 7.932.013 6.706.072 5.481.131 4.666.333 3.97.63a5.992 5.992 0 0 0-2.188 1.425A5.992 5.992 0 0 0 .356 4.242C.06 4.939-.142 5.754-.083 6.979c.06 1.226.074 1.69.074 5.311 0 3.621-.014 4.085-.074 5.311-.059 1.225.123 2.04.419 2.737.292.708.681 1.31 1.425 2.054a5.992 5.992 0 0 0 2.054 1.425c.696.296 1.512.478 2.737.419 1.225-.06 1.69-.074 5.311-.074 3.621 0 4.085.014 5.311.074 1.225.059 2.04-.123 2.737-.419a5.992 5.992 0 0 0 2.054-1.425 5.992 5.992 0 0 0 1.425-2.054c.296-.696.478-1.512.419-2.737-.06-1.225-.074-1.69-.074-5.311 0-3.621.014-4.085.074-5.311.059-1.225-.123-2.04-.419-2.737a5.992 5.992 0 0 0-1.425-2.054A5.992 5.992 0 0 0 16.788.419C16.092.123 15.277-.059 14.052.002 12.827.061 12.363.075 12.017.075zM12.017 2.154c3.555 0 3.979.014 5.38.072 1.297.059 2.004.275 2.475.457.622.242 1.065.53 1.531.995.465.466.753.91.995 1.531.182.471.398 1.178.457 2.475.058 1.402.072 1.825.072 5.38 0 3.555-.014 3.979-.072 5.38-.059 1.297-.275 2.004-.457 2.475a4.133 4.133 0 0 1-.995 1.531 4.133 4.133 0 0 1-1.531.995c-.471.182-1.178.398-2.475.457-1.4.058-1.825.072-5.38.072-3.555 0-3.979-.014-5.38-.072-1.297-.059-2.004-.275-2.475-.457a4.133 4.133 0 0 1-1.531-.995 4.133 4.133 0 0 1-.995-1.531c-.182-.471-.398-1.178-.457-2.475-.058-1.401-.072-1.825-.072-5.38 0-3.555.014-3.979.072-5.38.059-1.297.275-2.004.457-2.475.242-.622.53-1.065.995-1.531a4.133 4.133 0 0 1 1.531-.995c.471-.182 1.178-.398 2.475-.457 1.401-.058 1.825-.072 5.38-.072z" clipRule="evenodd"/>
                  <path fillRule="evenodd" d="M12.017 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12.017 15.846a3.684 3.684 0 1 1 0-7.368 3.684 3.684 0 0 1 0 7.368z" clipRule="evenodd"/>
                  <circle cx="18.406" cy="5.594" r="1.44"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Marketplace
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/browse" className="text-base text-gray-400 hover:text-white transition-colors">
                      Browse Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="text-base text-gray-400 hover:text-white transition-colors">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="/sell" className="text-base text-gray-400 hover:text-white transition-colors">
                      Start Selling
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-base text-gray-400 hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/help" className="text-base text-gray-400 hover:text-white transition-colors">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/safety" className="text-base text-gray-400 hover:text-white transition-colors">
                      Safety Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-400 hover:text-white transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/dispute" className="text-base text-gray-400 hover:text-white transition-colors">
                      Dispute Resolution
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about" className="text-base text-gray-400 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-base text-gray-400 hover:text-white transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/press" className="text-base text-gray-400 hover:text-white transition-colors">
                      Press
                    </Link>
                  </li>
                  <li>
                    <Link href="/partners" className="text-base text-gray-400 hover:text-white transition-colors">
                      Partners
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-base text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-base text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-base text-gray-400 hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/dmca" className="text-base text-gray-400 hover:text-white transition-colors">
                      DMCA
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-center text-base text-gray-400">
                Trusted by 100,000+ gamers worldwide
              </p>
            </div>
            <p className="mt-8 text-center text-base text-gray-400 md:order-1 md:mt-0">
              &copy; 2024 PasargameX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}