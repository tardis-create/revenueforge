"use client"

import { motion } from "framer-motion"
import { forwardRef } from "react"

interface SpringButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-disabled"?: boolean
}

export const SpringButton = forwardRef<HTMLButtonElement, SpringButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    children, 
    className = "", 
    onClick, 
    disabled, 
    type = "button",
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-disabled": ariaDisabled
  }, ref) => {
    const baseStyles = "font-medium transition-colors relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"

    const variants = {
      primary: "bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white hover:border-purple-400/50",
      secondary: "bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 hover:border-zinc-600",
      ghost: "bg-transparent border border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-lg",
      lg: "px-8 py-4 text-lg rounded-xl",
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={ariaDisabled ?? disabled}
        whileHover={disabled ? {} : { 
          scale: 1.02,
          transition: { 
            type: "spring",
            stiffness: 400,
            damping: 17 
          }
        }}
        whileTap={disabled ? {} : { 
          scale: 0.98,
          transition: { 
            type: "spring",
            stiffness: 400,
            damping: 17 
          }
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: variant === "primary" 
              ? "radial-gradient(circle at center, rgba(168, 85, 247, 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    )
  }
)

SpringButton.displayName = "SpringButton"
