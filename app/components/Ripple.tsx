"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface RippleProps {
  children: React.ReactNode
  className?: string
  color?: string
  duration?: number
}

interface RippleEffect {
  id: number
  x: number
  y: number
}

export function Ripple({
  children,
  className = "",
  color = "rgba(168, 85, 247, 0.3)",
  duration = 0.8
}: RippleProps) {
  const [ripples, setRipples] = useState<RippleEffect[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, duration * 1000)
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
