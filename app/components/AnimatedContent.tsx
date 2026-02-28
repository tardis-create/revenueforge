"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedContentProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimatedContent({ children, delay = 0, className = "" }: AnimatedContentProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}
