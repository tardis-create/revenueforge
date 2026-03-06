"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

// Mock user type - in production this would come from auth context
interface User {
  name: string
  email: string
  role: "admin" | "dealer" | "viewer"
  avatar?: string
}

interface AdminHeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

const mockUser: User = {
  name: "Admin User",
  email: "admin@revenueforge.com",
  role: "admin",
}

const roleColors = {
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  dealer: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  viewer: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

const roleLabels = {
  admin: "Admin",
  dealer: "Dealer",
  viewer: "Viewer",
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    // In production, this would call logout API and clear auth state
    setUserMenuOpen(false)
    router.push("/")
  }

  // Get current page title from pathname
  const getPageTitle = () => {
    const path = pathname.replace("/admin", "").split("/")[1] || "dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side: Mobile menu button + Page title */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-zinc-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Page title (mobile only) */}
          <h2 className="text-lg font-semibold text-zinc-100 lg:hidden">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right side: User menu */}
        <div className="flex items-center gap-4" ref={menuRef}>
          {/* Notifications bell */}
          <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg
              className="w-5 h-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {mockUser.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name and role (hidden on mobile) */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-zinc-200">
                  {mockUser.name}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    roleColors[mockUser.role]
                  }`}
                >
                  {roleLabels[mockUser.role]}
                </span>
              </div>

              {/* Chevron */}
              <motion.svg
                animate={{ rotate: userMenuOpen ? 180 : 0 }}
                className="w-4 h-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-800/95 backdrop-blur-lg border border-zinc-700/50 shadow-xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-zinc-700/50">
                    <p className="text-sm font-medium text-zinc-200">
                      {mockUser.name}
                    </p>
                    <p className="text-xs text-zinc-500">{mockUser.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </Link>

                    <Link
                      href="/admin/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-zinc-700/50 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
