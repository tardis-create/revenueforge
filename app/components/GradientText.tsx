"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  animate?: boolean
  speed?: number
}

export function GradientText({
  children,
  className = "",
  colors = ["#a855f7", "#6366f1", "#06b6d4", "#10b981"],
  animate = true,
  speed = 4
}: GradientTextProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const gradientStyle = {
    background: `linear-gradient(135deg, ${colors.join(", ")})`,
    backgroundSize: animate ? "300% 300%" : "100% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }

  if (!isMounted || !animate) {
    return (
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    )
  }

  return (
    <motion.span
      className={className}
      style={gradientStyle}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{
        opacity: { duration: 0.5 },
        backgroundPosition: {
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    >
      {children}
    </motion.span>
  )
}
