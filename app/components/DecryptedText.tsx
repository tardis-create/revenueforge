"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

interface DecryptedTextProps {
  text: string
  className?: string
  speed?: number
  animateOnHover?: boolean
  characters?: string
}

export function DecryptedText({
  text,
  className = "",
  speed = 50,
  animateOnHover = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+"
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrambleText = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    
    const originalText = text
    let iteration = 0
    
    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (index < iteration) {
              return originalText[index]
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join("")
      )
      
      iteration += 1 / 3
      
      if (iteration >= originalText.length) {
        clearInterval(interval)
        setDisplayText(originalText)
        setIsAnimating(false)
      }
    }, speed)
    
    return () => clearInterval(interval)
  }, [text, speed, characters, isAnimating])

  useEffect(() => {
    if (isMounted && !animateOnHover) {
      const timeout = setTimeout(scrambleText, 500)
      return () => clearTimeout(timeout)
    }
  }, [isMounted, animateOnHover, scrambleText])

  if (!isMounted) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={`cursor-default ${className}`}
      onMouseEnter={animateOnHover ? scrambleText : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayText}
    </motion.span>
  )
}
