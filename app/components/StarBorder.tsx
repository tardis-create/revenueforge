"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface StarBorderProps {
  children: React.ReactNode
  className?: string
  color?: string
  speed?: number
  borderWidth?: number
  borderRadius?: string
}

export function StarBorder({
  children,
  className = "",
  color = "#a855f7",
  speed = 3,
  borderWidth = 1,
  borderRadius = "12px"
}: StarBorderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={`relative ${className}`} style={{ borderRadius }}>
        <div className="relative z-10 h-full">{children}</div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${color}, transparent 30%)`,
          padding: borderWidth,
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div 
          className="w-full h-full bg-zinc-900" 
          style={{ borderRadius: `calc(${borderRadius} - ${borderWidth}px)` }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}
