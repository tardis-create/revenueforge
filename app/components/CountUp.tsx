"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"

interface CountUpProps {
  to: number
  duration?: number
  className?: string
}

export function CountUp({ to, duration = 2, className = "" }: CountUpProps) {
  const [isMounted, setIsMounted] = useState(false)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      animate(count, to, { duration })
    }
  }, [count, to, duration, isMounted])

  if (!isMounted) {
    return <span className={className}>{to}</span>
  }

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  )
}
