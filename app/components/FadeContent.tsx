"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FadeContentProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeContent({ children, delay = 0, className = "" }: FadeContentProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}
