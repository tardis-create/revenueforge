"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ShinyTextProps {
  text: string
  className?: string
  shimmerWidth?: number
  speed?: number
}

export function ShinyText({ 
  text, 
  className = "", 
  shimmerWidth = 100,
  speed = 2 
}: ShinyTextProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 z-20 overflow-hidden"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)`,
          backgroundSize: `${shimmerWidth}px 100%`,
        }}
        animate={{
          backgroundPosition: [`-${shimmerWidth}px 0`, `${text.length * 10}px 0`],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
        }}
        aria-hidden="true"
      >
        <span className="opacity-0">{text}</span>
      </motion.span>
    </motion.span>
  )
}
