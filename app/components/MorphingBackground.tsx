"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface MorphingBackgroundProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
  blur?: number
}

export function MorphingBackground({
  children,
  className = "",
  colors = ["#a855f7", "#6366f1", "#06b6d4", "#10b981"],
  speed = 8,
  blur = 120
}: MorphingBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: colors[0], filter: `blur(${blur}px)` }}
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary blob */}
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 600,
            height: 600,
            background: colors[0],
            filter: `blur(${blur}px)`,
          }}
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary blob */}
        <motion.div
          className="absolute rounded-full opacity-15"
          style={{
            width: 500,
            height: 500,
            background: colors[1],
            filter: `blur(${blur}px)`,
            top: "20%",
            right: "10%",
          }}
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: speed * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Tertiary blob */}
        <motion.div
          className="absolute rounded-full opacity-10"
          style={{
            width: 400,
            height: 400,
            background: colors[2],
            filter: `blur(${blur}px)`,
            bottom: "10%",
            left: "20%",
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: speed * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
