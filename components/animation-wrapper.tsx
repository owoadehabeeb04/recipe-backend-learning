"use client"

import { useRef, useEffect, useState, ReactNode } from "react"
import { useInView } from "react-intersection-observer"

type AnimationWrapperProps = {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  className?: string
  threshold?: number
  once?: boolean
}

export default function AnimationWrapper({
  children,
  delay = 0,
  direction = "up",
  duration = 0.5,
  className = "",
  threshold = 0.2,
  once = true,
}: AnimationWrapperProps) {
  const { ref, inView } = useInView({
    threshold: threshold,
    triggerOnce: once,
  })

  const directionMap = {
    up: "translate-y-10",
    down: "-translate-y-10",
    left: "translate-x-10",
    right: "-translate-x-10",
    none: "translate-y-0",
  }

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0, 0)" : "",
        filter: inView ? "blur(0)" : "blur(5px)",
        transition: `all ${duration}s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
