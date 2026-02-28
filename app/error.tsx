'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="relative min-h-screen overflow-hidden">
          {/* Background */}
          <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
          
          {/* Decorative elements */}
          <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
          
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-lg mx-auto"
              >
                {/* Error Icon */}
                <div className="mb-8">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                    <svg 
                      className="w-12 h-12 text-red-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Text Content */}
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-4">
                  Something went wrong
                </h1>
                <p className="text-lg text-zinc-400 mb-6 max-w-md mx-auto">
                  We encountered an unexpected error. Our team has been notified and we&apos;re working to fix it.
                </p>

                {/* Error Details (collapsible in production) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-left">
                    <p className="text-xs text-zinc-500 mb-2 font-mono">Error details:</p>
                    <p className="text-sm text-red-400 font-mono break-all">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-zinc-600 mt-2 font-mono">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/20"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-zinc-800/50 text-zinc-300 font-semibold rounded-lg border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                  >
                    Go Home
                  </Link>
                </div>

                {/* Help Links */}
                <div className="mt-12 pt-8 border-t border-zinc-800/50">
                  <p className="text-sm text-zinc-500 mb-4">Need help?</p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <a 
                      href="mailto:support@revenueforge.com" 
                      className="text-zinc-400 hover:text-purple-400 transition-colors"
                    >
                      Contact Support
                    </a>
                    <span className="text-zinc-700">•</span>
                    <Link 
                      href="/" 
                      className="text-zinc-400 hover:text-purple-400 transition-colors"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              </motion.div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-zinc-800/50">
              <div className="max-w-7xl mx-auto text-center text-sm text-zinc-500">
                <p>&copy; {new Date().getFullYear()} RevenueForge. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
