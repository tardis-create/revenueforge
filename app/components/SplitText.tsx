"use client"

import { motion, Variants } from "framer-motion"
import { useEffect, useState } from "react"

interface SplitTextProps {
  text: string
  className?: string
  charClassName?: string
  animation?: "fadeUp" | "fadeIn" | "slideUp" | "scale" | "rotate"
  staggerDuration?: number
  delay?: number
}

export function SplitText({
  text,
  className = "",
  charClassName = "",
  animation = "fadeUp",
  staggerDuration = 0.03,
  delay = 0
}: SplitTextProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const animations: Record<string, Variants> = {
    fadeUp: {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: delay + i * staggerDuration,
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      })
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: (i: number) => ({
        opacity: 1,
        transition: {
          delay: delay + i * staggerDuration,
          duration: 0.3
        }
      })
    },
    slideUp: {
      hidden: { opacity: 0, y: 50, rotateX: -90 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          delay: delay + i * staggerDuration,
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      })
    },
    scale: {
      hidden: { opacity: 0, scale: 0 },
      visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
          delay: delay + i * staggerDuration,
          duration: 0.4,
          type: "spring",
          stiffness: 200,
          damping: 10
        }
      })
    },
    rotate: {
      hidden: { opacity: 0, rotate: -180, scale: 0 },
      visible: (i: number) => ({
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
          delay: delay + i * staggerDuration,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 12
        }
      })
    }
  }

  if (!isMounted) {
    return <span className={className}>{text}</span>
  }

  const chars = text.split("")

  return (
    <motion.span 
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={animations[animation]}
          className={`inline-block ${charClassName}`}
          style={{ whiteSpace: "pre" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}
