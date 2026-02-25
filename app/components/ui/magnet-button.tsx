"use client"

import React, { useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/cn"

interface MagnetButtonProps {
  children: React.ReactNode
  className?: string
  magnetStrength?: number
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export const MagnetButton = React.forwardRef<HTMLButtonElement, MagnetButtonProps>(
  ({ children, className, magnetStrength = 0.3, onClick, type = "button", disabled }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { stiffness: 150, damping: 15 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * magnetStrength
      const deltaY = (e.clientY - centerY) * magnetStrength
      x.set(deltaX)
      y.set(deltaY)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      x.set(0)
      y.set(0)
    }

    return (
      <motion.button
        ref={buttonRef}
        style={{ x: xSpring, y: ySpring }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={cn(
          "relative px-6 py-3 font-medium transition-colors",
          "bg-gradient-to-b from-zinc-800 to-zinc-900",
          "border border-zinc-700/50 rounded-lg",
          "text-zinc-100 hover:text-white",
          "hover:border-zinc-600",
          "shadow-lg shadow-black/20",
          "hover:shadow-xl hover:shadow-black/30",
          className
        )}
      >
        {children}
      </motion.button>
    )
  }
)

MagnetButton.displayName = "MagnetButton"
