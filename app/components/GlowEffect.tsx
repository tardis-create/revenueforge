"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"

interface GlowEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  intensity?: "low" | "medium" | "high"
  hover?: boolean
}

export function GlowEffect({
  children,
  className = "",
  color = "#a855f7",
  intensity = "medium",
  hover = true
}: GlowEffectProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const intensityValues = {
    low: 0.1,
    medium: 0.2,
    high: 0.35
  }

  const glowOpacity = intensityValues[intensity]

  if (!isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        filter: isHovered || !hover ? `drop-shadow(0 0 20px ${color}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")})` : "none",
      }}
      animate={{
        filter: isHovered || !hover 
          ? `drop-shadow(0 0 20px ${color}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")})` 
          : "none"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Inner glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-inherit"
        style={{
          background: `radial-gradient(circle at center, ${color}${Math.round(glowOpacity * 0.5 * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          opacity: isHovered || !hover ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.div>
  )
}
