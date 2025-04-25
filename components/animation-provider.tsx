"use client"

import { createContext, useContext, useEffect, useState } from "react"

type AnimationContextType = {
  isAnimationEnabled: boolean
}

const AnimationContext = createContext<AnimationContextType>({
  isAnimationEnabled: true,
})

export function useAnimation() {
  return useContext(AnimationContext)
}

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initialize intersection observer for animations
    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    // Add initial animation class to body
    document.body.classList.add("animate-fade-in")
    
    // Wait for page to load before enabling animations
    setTimeout(() => {
      setIsLoaded(true)
      animatedElements.forEach((el) => {
        observer.observe(el)
      })
    }, 100)

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el)
      })
    }
  }, [])

  return (
    <AnimationContext.Provider value={{ isAnimationEnabled }}>
      <div className={isLoaded ? "animate-ready" : ""}>{children}</div>
    </AnimationContext.Provider>
  )
}
