"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Get user from localStorage (set by login)
  const getUser = () => {
    if (typeof window === 'undefined') return null
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }
  
  const user = getUser()
  const userName = user?.name || user?.email?.split('@')[0] || "User"
  const userRole = user?.role || "user"

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_data')
    document.cookie = 'token=; path=/; max-age=0'
    window.location.href = '/login'
  }

  const roleBadgeColor = {
    admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dealer: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    user: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  }

  return (
    <header className="h-16 bg-zinc-900/50 backdrop-blur border-b border-zinc-800/50 flex items-center justify-between px-4 lg:px-6">
      {/* Page title */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Name and role (hidden on small screens) */}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-zinc-200">{userName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${roleBadgeColor[userRole as keyof typeof roleBadgeColor] || roleBadgeColor.user}`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>

          {/* Chevron */}
          <svg 
            className={`w-4 h-4 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50"
            >
              {/* User info (mobile) */}
              <div className="sm:hidden px-3 py-2 border-b border-zinc-800">
                <p className="text-sm font-medium text-zinc-200">{userName}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${roleBadgeColor[userRole as keyof typeof roleBadgeColor] || roleBadgeColor.user}`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
