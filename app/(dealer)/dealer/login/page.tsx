'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  ClickSpark,
  GlareHover
} from '@/app/components'

export default function DealerLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user, isLoading: authLoading, error: authError, clearError } = useAuth()
  
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated as dealer
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'dealer') {
      const redirect = searchParams.get('redirect') || '/dealer'
      router.push(redirect)
    }
  }, [isAuthenticated, authLoading, user, router, searchParams])

  // Clear errors when inputs change
  useEffect(() => {
    if (authError || localError) {
      clearError()
      setLocalError('')
    }
  }, [credentials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLocalError('')

    try {
      await login(credentials.email, credentials.password)
      // Auth context will handle redirect based on role
    } catch (error) {
      setLocalError('Invalid credentials. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isLoading = authLoading || isSubmitting

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glows */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px"
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <AnimatedContent>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">
              <BlurText text="Dealer Portal" />
            </h1>
            <p className="text-zinc-400 mt-2">Sign in to access your dashboard</p>
          </div>
        </AnimatedContent>

        {/* Login Form */}
        <AnimatedContent delay={0.1}>
          <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={400}>
            <div className="p-8 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    disabled={isLoading}
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="dealer@revenueforge.io"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    disabled={isLoading}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>

                {(authError || localError) && (
                  <FadeContent>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {localError || authError}
                    </div>
                  </FadeContent>
                )}

                <ClickSpark sparkColor="#a855f7" sparkCount={10}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-400'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white hover:border-purple-400/50'
                    }`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </ClickSpark>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <p className="text-xs text-zinc-400 font-medium mb-2">Demo Credentials:</p>
                <p className="text-xs text-zinc-500">
                  Email: dealer@revenueforge.io<br />
                  Password: dealer123
                </p>
              </div>
            </div>
          </GlareHover>
        </AnimatedContent>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Back to RevenueForge
          </a>
        </div>
      </div>
    </div>
  )
}
