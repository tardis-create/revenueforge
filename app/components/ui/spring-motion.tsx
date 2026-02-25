"use client"

import React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/cn"

interface SpringMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SpringMotion({
  children,
  className,
  delay = 0,
  ...props
}: SpringMotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SpringScale({
  children,
  className,
  delay = 0,
  ...props
}: SpringMotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
