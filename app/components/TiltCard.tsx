"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useState, useRef } from "react"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  glareEnable?: boolean
  tiltMaxAngle?: number
  scale?: number
}

export function TiltCard({
  children,
  className = "",
  glareEnable = true,
  tiltMaxAngle = 15,
  scale = 1.02
}: TiltCardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]), {
    stiffness: 300,
    damping: 30
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]), {
    stiffness: 300,
    damping: 30
  })
  
  const glareX = useTransform(x, [-0.5, 0.5], ["-100%", "200%"])
  const glareY = useTransform(y, [-0.5, 0.5], ["-100%", "200%"])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const xPos = (e.clientX - rect.left) / rect.width - 0.5
    const yPos = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xPos)
    y.set(yPos)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (!isMounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
        
        {/* Glare effect */}
        {glareEnable && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%)",
              backgroundSize: "200% 200%",
              x: glareX,
              y: glareY,
              opacity: 0.5,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}
