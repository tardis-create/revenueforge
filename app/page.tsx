"use client"

import Link from "next/link"
import { 
  SpotlightCard, 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  GlareHover,
  ClickSpark,
  CountUp
} from '@appletosolutions/reactbits'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px"
        }}
      />
      
      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">RevenueForge</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">
              Catalog
            </Link>
            <Link href="/rfq" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">
              Request Quote
            </Link>
            <Link href="/admin/products" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">
              Admin
            </Link>
          </div>
        </nav>

        {/* Hero Section - Asymmetric Layout */}
        <section className="px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left column - Main content */}
            <div className="lg:col-span-7 space-y-8">
              <AnimatedContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  B2B Industrial Marketplace
                </div>
              </AnimatedContent>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  <BlurText className="block text-zinc-100" text="Industrial procurement," delay={0} />
                  <BlurText className="block gradient-text" text="reimagined." delay={0.2} />
                </h1>
                
                <FadeContent>
                  <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                    Connect with verified suppliers, compare quotations, and streamline your 
                    procurement workflow with intelligent automation.
                  </p>
                </FadeContent>
              </div>

              <AnimatedContent delay={0.4}>
                <div className="flex flex-wrap gap-4">
                  <Link href="/catalog">
                    <ClickSpark
                      sparkColor="#a855f7"
                      sparkCount={8}
                    >
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all">
                        Browse Catalog
                      </button>
                    </ClickSpark>
                  </Link>
                  <Link href="/rfq">
                    <Magnet padding={50} magnetStrength={2}>
                      <button className="px-6 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-medium hover:border-zinc-600 transition-all">
                        Request Quotation
                      </button>
                    </Magnet>
                  </Link>
                </div>
              </AnimatedContent>

              {/* Stats */}
              <AnimatedContent delay={0.5}>
                <div className="flex gap-8 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">
                      <CountUp to={2400} duration={2} />+
                    </div>
                    <div className="text-sm text-zinc-500">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">
                      <CountUp to={150} duration={2} />+
                    </div>
                    <div className="text-sm text-zinc-500">Suppliers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">98%</div>
                    <div className="text-sm text-zinc-500">Satisfaction</div>
                  </div>
                </div>
              </AnimatedContent>
            </div>

            {/* Right column - Feature cards */}
            <div className="lg:col-span-5 space-y-4">
              <AnimatedContent delay={0.3}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.3)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 mb-1">Smart Discovery</h3>
                        <p className="text-sm text-zinc-400">AI-powered search finds the right products across thousands of SKUs</p>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>

              <AnimatedContent delay={0.4}>
                <GlareHover glareColor="rgba(6, 182, 212, 0.3)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 mb-1">Instant Quotes</h3>
                        <p className="text-sm text-zinc-400">Get competitive quotations from multiple vendors in minutes</p>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>

              <AnimatedContent delay={0.5}>
                <GlareHover glareColor="rgba(34, 197, 94, 0.3)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 mb-1">Verified Suppliers</h3>
                        <p className="text-sm text-zinc-400">All vendors undergo rigorous quality and compliance checks</p>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="px-6 lg:px-12 py-16 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <AnimatedContent>
              <h2 className="text-xl font-semibold text-zinc-100 mb-8">Browse by Category</h2>
            </AnimatedContent>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <AnimatedContent key={cat.name} delay={0.1 * i}>
                  <Link href={`/catalog?category=${cat.name.toLowerCase()}`}>
                    <GlareHover glareColor="rgba(168, 85, 247, 0.2)" glareSize={200}>
                      <div className="p-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm hover:border-zinc-600/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <span className="text-lg font-bold text-zinc-300">{cat.icon}</span>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-100">{cat.name}</div>
                            <div className="text-xs text-zinc-500">{cat.count} products</div>
                          </div>
                        </div>
                      </div>
                    </GlareHover>
                  </Link>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-8 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div>Built for industrial procurement teams</div>
            <div className="flex gap-6">
              <Link href="/catalog" className="hover:text-zinc-300 transition-colors">Catalog</Link>
              <Link href="/rfq" className="hover:text-zinc-300 transition-colors">RFQ</Link>
              <Link href="/admin/products" className="hover:text-zinc-300 transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

const categories = [
  { name: "Pumps", icon: "P", count: 340, bgColor: "bg-blue-500/10" },
  { name: "Valves", icon: "V", count: 280, bgColor: "bg-purple-500/10" },
  { name: "Motors", icon: "M", count: 195, bgColor: "bg-amber-500/10" },
  { name: "Sensors", icon: "S", count: 420, bgColor: "bg-cyan-500/10" },
]
