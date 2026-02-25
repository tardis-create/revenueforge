"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { cn } from "@/lib/cn"

interface TextAnimateProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  animation?: "fadeInUp" | "blurIn" | "slideIn"
}

export function TextAnimate({
  children,
  className,
  delay = 0,
  duration = 0.5,
  animation = "blurIn",
}: TextAnimateProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const words = children.split(" ")

  const variants = {
    hidden: {
      opacity: 0,
      y: animation === "fadeInUp" ? 20 : 0,
      filter: animation === "blurIn" ? "blur(10px)" : "none",
      x: animation === "slideIn" ? -20 : 0,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      x: 0,
      transition: {
        delay: delay + i * 0.1,
        duration,
        ease: "easeOut",
      },
    }),
  }

  return (
    <span ref={ref} className={cn("inline", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={controls}
          variants={variants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
