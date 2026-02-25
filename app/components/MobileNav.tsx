"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/catalog", label: "Catalog", icon: "📦" },
  { href: "/rfq", label: "RFQ", icon: "📝" },
  { href: "/admin/products", label: "Admin", icon: "⚙️" },
]

export function MobileNav() {
  const pathname = usePathname()

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
    >
      <div className="mx-4 mb-4 px-2 py-3 bg-zinc-900/90 backdrop-blur-lg border border-zinc-800/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                    transition-colors min-h-[44px] min-w-[44px]
                    ${isActive 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "text-zinc-400 hover:text-zinc-100"}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
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
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute top-full right-0 mt-2 w-48 bg-zinc-900/95 backdrop-blur-lg border border-zinc-800/50 rounded-xl shadow-2xl overflow-hidden"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-colors border-b border-zinc-800/30 last:border-0
                      ${isActive 
                        ? "bg-purple-500/10 text-purple-400" 
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"}
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
