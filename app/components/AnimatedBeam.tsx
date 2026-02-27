"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBeamProps {
  children?: React.ReactNode
  className?: string
  color?: string
  speed?: number
  size?: number
}

export function AnimatedBeam({
  children,
  className = "",
  color = "#a855f7",
  speed = 2,
  size = 200
}: AnimatedBeamProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className={`relative overflow-hidden ${className}`}>{children}</div>
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main beam */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}40 50%, transparent 100%)`,
          width: size,
        }}
        animate={{
          x: [-size, typeof window !== "undefined" ? window.innerWidth : 1000],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
        }}
      />
      
      {/* Secondary beam (delayed) */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`,
          width: size * 0.6,
        }}
        animate={{
          x: [-size * 0.6, typeof window !== "undefined" ? window.innerWidth : 1000],
        }}
        transition={{
          duration: speed * 1.5,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
          delay: 1,
        }}
      />
      
      {children}
    </div>
  )
}
