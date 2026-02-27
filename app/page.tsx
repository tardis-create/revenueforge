"use client"

import Link from "next/link"
import { 
  LiquidCard, 
  SplitText,
  GradientText,
  RotatingText,
  DecryptedText,
  AnimatedContent, 
  FadeContent,
  StaggerContainer, 
  StaggerItem,
  MorphingBackground,
  ScrollReveal,
  TiltCard,
  Ripple,
  AnimatedBeam,
  CountUp, 
  SpringButton, 
  HamburgerMenu
} from "./components"

export default function Home() {
  return (
    <MorphingBackground className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" aria-hidden="true" />
      
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px"
        }}
        aria-hidden="true"
      />
      
      {/* Animated beam across top */}
      <div className="fixed top-0 left-0 right-0 h-1 overflow-hidden">
        <AnimatedBeam 
          className="absolute inset-0" 
          color="#a855f7"
          speed={4}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 lg:px-12 relative" role="navigation" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <Ripple className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </Ripple>
            <DecryptedText 
              text="RevenueForge" 
              className="font-semibold text-lg text-zinc-100"
              speed={40}
            />
          </div>
          
          <div className="hidden md:flex items-center gap-8" role="menubar">
            <Link 
              href="/catalog" 
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded px-2 py-1"
              role="menuitem"
            >
              Catalog
            </Link>
            <Link 
              href="/rfq" 
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded px-2 py-1"
              role="menuitem"
            >
              Request Quote
            </Link>
            <Link 
              href="/admin/products" 
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded px-2 py-1"
              role="menuitem"
            >
              Admin
            </Link>
          </div>
          
          <HamburgerMenu />
        </nav>

        {/* Hero Section - Enhanced */}
        <main id="main-content" className="px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left column - Main content */}
            <div className="lg:col-span-7 space-y-8">
              <AnimatedContent>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  B2B Industrial Marketplace
                </div>
              </AnimatedContent>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  <SplitText 
                    text="Industrial procurement," 
                    className="block text-zinc-100"
                    animation="fadeUp"
                    staggerDuration={0.02}
                  />
                  <span className="block">
                    <GradientText colors={["#a855f7", "#6366f1", "#06b6d4"]} speed={3}>
                      <RotatingText 
                        words={["reimagined.", "streamlined.", "automated.", "simplified."]}
                        animation="slide"
                        interval={2500}
                      />
                    </GradientText>
                  </span>
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
                  <Link href="/catalog" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-lg">
                    <Ripple className="rounded-lg">
                      <SpringButton variant="primary">
                        Browse Catalog
                      </SpringButton>
                    </Ripple>
                  </Link>
                  <Link href="/rfq" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-lg">
                    <SpringButton variant="primary">
                      Request Quotation
                    </SpringButton>
                  </Link>
                </div>
              </AnimatedContent>

              {/* Stats */}
              <AnimatedContent delay={0.5}>
                <dl className="flex gap-8 pt-4" aria-label="Platform statistics">
                  <div className="group">
                    <dt className="sr-only">Products available</dt>
                    <dd className="text-2xl font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">
                      <CountUp to={2400} duration={2} />+
                    </dd>
                    <dd className="text-sm text-zinc-500">Products</dd>
                  </div>
                  <div className="group">
                    <dt className="sr-only">Suppliers</dt>
                    <dd className="text-2xl font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors">
                      <CountUp to={150} duration={2} />+
                    </dd>
                    <dd className="text-sm text-zinc-500">Suppliers</dd>
                  </div>
                  <div className="group">
                    <dt className="sr-only">Customer satisfaction rate</dt>
                    <dd className="text-2xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">98%</dd>
                    <dd className="text-sm text-zinc-500">Satisfaction</dd>
                  </div>
                </dl>
              </AnimatedContent>
            </div>

            {/* Right column - Feature cards with tilt */}
            <div className="lg:col-span-5 space-y-4" aria-label="Platform features">
              <StaggerContainer staggerDelay={0.1}>
                <StaggerItem>
                  <TiltCard tiltMaxAngle={8} scale={1.02}>
                    <LiquidCard spotlightColor="rgba(168, 85, 247, 0.2)">
                      <article className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="font-semibold text-zinc-100 mb-1">Smart Discovery</h2>
                            <p className="text-sm text-zinc-400">AI-powered search finds the right products across thousands of SKUs</p>
                          </div>
                        </div>
                      </article>
                    </LiquidCard>
                  </TiltCard>
                </StaggerItem>

                <StaggerItem>
                  <TiltCard tiltMaxAngle={8} scale={1.02}>
                    <LiquidCard spotlightColor="rgba(6, 182, 212, 0.2)">
                      <article className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="font-semibold text-zinc-100 mb-1">Instant Quotes</h2>
                            <p className="text-sm text-zinc-400">Get competitive quotations from multiple vendors in minutes</p>
                          </div>
                        </div>
                      </article>
                    </LiquidCard>
                  </TiltCard>
                </StaggerItem>

                <StaggerItem>
                  <TiltCard tiltMaxAngle={8} scale={1.02}>
                    <LiquidCard spotlightColor="rgba(34, 197, 94, 0.2)">
                      <article className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="font-semibold text-zinc-100 mb-1">Verified Suppliers</h2>
                            <p className="text-sm text-zinc-400">All vendors undergo rigorous quality and compliance checks</p>
                          </div>
                        </div>
                      </article>
                    </LiquidCard>
                  </TiltCard>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </main>

        {/* Categories Section with Scroll Reveal */}
        <section className="px-6 lg:px-12 py-16 border-t border-zinc-800/50" aria-labelledby="categories-heading">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <h2 id="categories-heading" className="text-xl font-semibold text-zinc-100 mb-8">
                Browse by Category
              </h2>
            </ScrollReveal>
            
            <nav aria-label="Product categories">
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, index) => (
                  <StaggerItem key={cat.name}>
                    <Link href={`/catalog?category=${cat.name.toLowerCase()}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-xl block">
                      <Ripple className="rounded-xl" color="rgba(168, 85, 247, 0.2)">
                        <LiquidCard spotlightColor="rgba(168, 85, 247, 0.15)" glassIntensity="low">
                          <div className="p-5 cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`} aria-hidden="true">
                                <span className="text-lg font-bold text-zinc-300">{cat.icon}</span>
                              </div>
                              <div>
                                <div className="font-medium text-zinc-100 group-hover:text-purple-400 transition-colors">{cat.name}</div>
                                <div className="text-xs text-zinc-500">{cat.count} products</div>
                              </div>
                            </div>
                          </div>
                        </LiquidCard>
                      </Ripple>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </nav>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-12 py-16 border-t border-zinc-800/50" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <h2 id="features-heading" className="text-2xl font-semibold text-zinc-100 mb-4 text-center">
                Why Choose <GradientText colors={["#a855f7", "#06b6d4"]}>RevenueForge</GradientText>?
              </h2>
              <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
                Built for modern procurement teams who demand efficiency, transparency, and reliability.
              </p>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} animation="fadeUp" delay={index * 0.1}>
                  <TiltCard tiltMaxAngle={6}>
                    <LiquidCard className="h-full">
                      <div className="p-6">
                        <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                          <span className="text-2xl">{feature.icon}</span>
                        </div>
                        <h3 className="font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                        <p className="text-sm text-zinc-400">{feature.description}</p>
                      </div>
                    </LiquidCard>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-12 py-16 border-t border-zinc-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="scale">
              <h2 className="text-3xl font-bold text-zinc-100 mb-4">
                Ready to Transform Your Procurement?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join hundreds of companies already streamlining their B2B purchasing with RevenueForge.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/catalog">
                  <SpringButton variant="primary" size="lg">
                    Get Started Free
                  </SpringButton>
                </Link>
                <Link href="/rfq">
                  <SpringButton variant="secondary" size="lg">
                    Request Demo
                  </SpringButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-8 pb-24 md:pb-8 border-t border-zinc-800/50" role="contentinfo">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div>Built for industrial procurement teams</div>
            <nav aria-label="Footer navigation">
              <ul className="flex gap-6">
                <li>
                  <Link href="/catalog" className="hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded">Catalog</Link>
                </li>
                <li>
                  <Link href="/rfq" className="hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded">RFQ</Link>
                </li>
                <li>
                  <Link href="/admin/products" className="hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded">Admin</Link>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </MorphingBackground>
  )
}

const categories = [
  { name: "Pumps", icon: "P", count: 340, bgColor: "bg-blue-500/10" },
  { name: "Valves", icon: "V", count: 280, bgColor: "bg-purple-500/10" },
  { name: "Motors", icon: "M", count: 195, bgColor: "bg-amber-500/10" },
  { name: "Sensors", icon: "S", count: 420, bgColor: "bg-cyan-500/10" },
]

const features = [
  { 
    title: "Lightning Fast", 
    description: "Get quotes from multiple suppliers within hours, not days. Our AI matches your requirements instantly.",
    icon: "⚡",
    iconBg: "bg-amber-500/10"
  },
  { 
    title: "Verified Network", 
    description: "Every supplier in our network is vetted for quality, reliability, and compliance standards.",
    icon: "✓",
    iconBg: "bg-emerald-500/10"
  },
  { 
    title: "Smart Analytics", 
    description: "Track spending, identify savings opportunities, and optimize your procurement strategy with data insights.",
    icon: "📊",
    iconBg: "bg-purple-500/10"
  },
]
