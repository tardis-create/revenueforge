"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface RotatingTextProps {
  words: string[]
  className?: string
  interval?: number
  animation?: "fade" | "slide" | "flip" | "scale"
}

export function RotatingText({
  words,
  className = "",
  interval = 3000,
  animation = "slide"
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, interval)
    
    return () => clearInterval(timer)
  }, [words.length, interval, isMounted])

  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, y: 20, filter: "blur(4px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: -20, filter: "blur(4px)" }
    },
    flip: {
      initial: { opacity: 0, rotateX: -90 },
      animate: { opacity: 1, rotateX: 0 },
      exit: { opacity: 0, rotateX: 90 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.5 }
    }
  }

  const selectedAnimation = animations[animation]

  if (!isMounted) {
    return <span className={className}>{words[0]}</span>
  }

  return (
    <span className={`inline-block relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={selectedAnimation.initial}
          animate={selectedAnimation.animate}
          exit={selectedAnimation.exit}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-block"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
