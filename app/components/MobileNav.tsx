"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Public navigation items
const publicNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/catalog", label: "Catalog", icon: "catalog" },
  { href: "/rfq", label: "RFQ", icon: "rfq" },
  { href: "/login", label: "Login", icon: "login" },
]

// Admin navigation items
const adminNavItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/products", label: "Products", icon: "products" },
  { href: "/rfqs", label: "RFQs", icon: "rfq" },
  { href: "/settings", label: "Settings", icon: "settings" },
]

// Dealer navigation items
const dealerNavItems = [
  { href: "/dealer", label: "Home", icon: "home" },
  { href: "/dealer/products", label: "Products", icon: "products" },
  { href: "/dealer/orders", label: "Orders", icon: "orders" },
  { href: "/dealer/commissions", label: "Earn", icon: "money" },
]

const iconMap: Record<string, React.ReactNode> = {
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  catalog: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  rfq: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  login: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  products: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  money: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function MobileNav() {
  const pathname = usePathname()
  
  // Determine which nav items to show based on current path
  const getNavItems = () => {
    if (pathname.startsWith('/dealer')) {
      return dealerNavItems
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/products') || 
        pathname.startsWith('/rfqs') || pathname.startsWith('/quotes') ||
        pathname.startsWith('/users') || pathname.startsWith('/settings') ||
        pathname.startsWith('/templates') || pathname.startsWith('/leads') ||
        pathname.startsWith('/analytics') || pathname.startsWith('/notifications') ||
        pathname.startsWith('/dealers')) {
      return adminNavItems
    }
    return publicNavItems
  }
  
  const navItems = getNavItems()

  // Don't show on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || 
      pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) {
    return null
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="mx-3 mb-3 px-1 py-2 bg-zinc-900/95 backdrop-blur-lg border border-zinc-800/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && item.href !== "/dealer" && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl
                    transition-colors min-h-[52px]
                    ${isActive 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "text-zinc-400 active:bg-zinc-800/50"}
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  {iconMap[item.icon]}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.button>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

// Hamburger menu for tablets
export function HamburgerMenu() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
    </div>
  )
}
