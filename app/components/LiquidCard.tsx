"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface LiquidCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  glassIntensity?: "low" | "medium" | "high"
}

export function LiquidCard({
  children,
  className = "",
  spotlightColor = "rgba(168, 85, 247, 0.15)",
  glassIntensity = "medium",
}: LiquidCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const glassStyles = {
    low: "backdrop-blur-sm bg-zinc-900/30",
    medium: "backdrop-blur-md bg-zinc-900/50",
    high: "backdrop-blur-lg bg-zinc-900/70",
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 20 
        }
      }}
      className={`
        relative overflow-hidden rounded-xl border border-zinc-800/50
        ${glassStyles[glassIntensity]}
        transition-colors duration-300
        hover:border-purple-500/30
        ${className}
      `}
      style={{
        boxShadow: isHovered 
          ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.1)"
          : "0 4px 16px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient border effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(6, 182, 212, 0.1) 100%)",
        }}
      />

      {/* Spotlight that follows cursor */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none"
          animate={{
            x: mousePosition.x - 150,
            y: mousePosition.y - 150,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
          style={{
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
