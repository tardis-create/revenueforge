"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
}

export function BlurText({ text, className = "", delay = 0 }: BlurTextProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={className}
      initial={{ 
        opacity: 0, 
        filter: "blur(10px)",
        textShadow: "0 0 20px rgba(255,255,255,0.5)"
      }}
      animate={{ 
        opacity: 1, 
        filter: "blur(0px)",
        textShadow: "0 0 0px rgba(255,255,255,0)"
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: "easeOut"
      }}
    >
      {text}
    </motion.span>
  )
}
