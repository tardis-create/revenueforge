"use client"

import { ReactNode, useState } from "react"

interface GlareHoverProps {
  children: ReactNode
  className?: string
  glareColor?: string
  glareSize?: number
}

export function GlareHover({ 
  children, 
  className = "", 
  glareColor = "rgba(255, 255, 255, 0.3)",
  glareSize = 100
}: GlareHoverProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${glareColor} 50%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.6s ease-in-out, opacity 0.3s ease-in-out',
          width: `${glareSize}px`
        }}
      />
    </div>
  )
}
