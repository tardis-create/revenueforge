"use client"

import { motion } from "framer-motion"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  as?: "div" | "section" | "main" | "article"
}

export function ResponsiveContainer({ 
  children, 
  className = "",
  as: Component = "div"
}: ResponsiveContainerProps) {
  return (
    <Component className={`w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto ${className}`}>
      {children}
    </Component>
  )
}

// Responsive grid with mobile-first approach
export function ResponsiveGrid({ 
  children, 
  className = "",
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }
}: {
  children: React.ReactNode
  className?: string
  cols?: { sm?: number; md?: number; lg?: number; xl?: number }
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  }

  return (
    <div className={`
      grid gap-4
      ${cols.sm ? gridCols[cols.sm as keyof typeof gridCols] : ""}
      ${cols.md ? `md:${gridCols[cols.md as keyof typeof gridCols]}` : ""}
      ${cols.lg ? `lg:${gridCols[cols.lg as keyof typeof gridCols]}` : ""}
      ${cols.xl ? `xl:${gridCols[cols.xl as keyof typeof gridCols]}` : ""}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Touch-friendly button wrapper
export function TouchTarget({ 
  children,
  className = ""
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
    >
      {children}
    </motion.div>
  )
}
