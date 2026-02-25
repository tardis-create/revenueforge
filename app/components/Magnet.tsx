"use client"

import { motion } from "framer-motion"
import { ReactNode, useState, useRef } from "react"

interface MagnetProps {
  children: ReactNode
  className?: string
  strength?: number
  magnetStrength?: number
  padding?: number
}

export function Magnet({ 
  children, 
  className = "", 
  strength = 0.3,
  magnetStrength,
  padding = 0 
}: MagnetProps) {
  // Use magnetStrength if provided, otherwise use strength
  const actualStrength = magnetStrength !== undefined ? magnetStrength : strength
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = (e.clientX - centerX) * actualStrength * 0.1
    const y = (e.clientY - centerY) * actualStrength * 0.1
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      style={{ padding }}
    >
      {children}
    </motion.div>
  )
}
