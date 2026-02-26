import Link from "next/link"
import { BlurText, AnimatedContent, SpringButton } from "@/app/components"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      {/* Decorative elements */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </Link>
        </nav>

        {/* Error Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <AnimatedContent>
            <div className="text-center max-w-lg mx-auto">
              {/* 404 Number */}
              <div className="relative mb-8">
                <div className="text-[120px] lg:text-[160px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900 select-none">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                    <svg 
                      className="w-10 h-10 text-zinc-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-4">
                <BlurText text="Page Not Found" />
              </h1>
              <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/">
                  <SpringButton variant="primary">Go Home</SpringButton>
                </Link>
                <Link href="/catalog">
                  <SpringButton variant="secondary">Browse Catalog</SpringButton>
                </Link>
              </div>

              {/* Helpful Links */}
              <div className="mt-12 pt-8 border-t border-zinc-800/50">
                <p className="text-sm text-zinc-500 mb-4">Looking for something else?</p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <Link 
                    href="/rfq" 
                    className="text-zinc-400 hover:text-purple-400 transition-colors"
                  >
                    Request a Quote
                  </Link>
                  <span className="text-zinc-700">•</span>
                  <Link 
                    href="/catalog" 
                    className="text-zinc-400 hover:text-purple-400 transition-colors"
                  >
                    Product Catalog
                  </Link>
                  <span className="text-zinc-700">•</span>
                  <a 
                    href="mailto:support@revenueforge.com" 
                    className="text-zinc-400 hover:text-purple-400 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} RevenueForge. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
              <Link href="/catalog" className="hover:text-zinc-300 transition-colors">Catalog</Link>
              <Link href="/rfq" className="hover:text-zinc-300 transition-colors">RFQ</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
