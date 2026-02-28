"use client"

import { motion } from "framer-motion"
import { ReactNode, useState } from "react"

interface ClickSparkProps {
  children: ReactNode
  className?: string
  sparkColor?: string
  sparkCount?: number
}

export function ClickSpark({ 
  children, 
  className = "", 
  sparkColor = "rgba(168, 85, 247, 0.6)",
  sparkCount = 8
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Create multiple sparks around click point
    for (let i = 0; i < sparkCount; i++) {
      const id = Date.now() + i
      const angle = (2 * Math.PI * i) / sparkCount
      const distance = 20 + Math.random() * 20
      const sparkX = x + Math.cos(angle) * distance
      const sparkY = y + Math.sin(angle) * distance
      
      setSparks(prev => [...prev, { id, x: sparkX, y: sparkY }])
      
      setTimeout(() => {
        setSparks(prev => prev.filter(spark => spark.id !== id))
      }, 600)
    }
  }

  return (
    <div className={`relative ${className}`} onClick={handleClick}>
      {children}
      {sparks.map(spark => (
        <motion.div
          key={spark.id}
          className="absolute pointer-events-none"
          style={{ left: spark.x, top: spark.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: `radial-gradient(circle, ${sparkColor} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
