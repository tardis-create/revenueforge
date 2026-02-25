"use client"

import React from "react"
import { cn } from "@/lib/cn"

interface LiquidGlassProps {
  children: React.ReactNode
  className?: string
  blur?: "sm" | "md" | "lg" | "xl"
  opacity?: number
}

export function LiquidGlass({
  children,
  className,
  blur = "lg",
  opacity = 0.1,
}: LiquidGlassProps) {
  const blurValues = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
        "border border-white/[0.1]",
        "shadow-xl shadow-black/5",
        blurValues[blur],
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
