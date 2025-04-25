"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const floatingElementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!floatingElementsRef.current || !heroRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = heroRef.current.getBoundingClientRect()
      
      // Calculate mouse position relative to the hero section
      const x = (clientX - left) / width - 0.5
      const y = (clientY - top) / height - 0.5
      
      // Apply parallax effect to floating elements
      const elements = floatingElementsRef.current.querySelectorAll('.floating-element')
      elements.forEach((el, i) => {
        const htmlEl = el as HTMLElement
        const speed = i % 2 === 0 ? 20 : -20
        htmlEl.style.transform = `translate(${x * speed}px, ${y * speed}px)`
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 animate-on-scroll">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 -z-10"></div>

      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left animate-slide-up">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-purple-pink text-white text-sm font-medium mb-6 animate-bounce-subtle">
                AI-Powered Recipe Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-text-gradient">
                Cook Smarter with <span className="text-transparent bg-clip-text bg-gradient-purple-pink">Recipia</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Discover, create, and share recipes with the help of AI. Plan your meals, ask cooking questions, and
                build your personal recipe collection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg bg-gradient-purple-pink text-white font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 animate-pulse-subtle"
              >
                Get Started Free
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="flex-1 relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transition-all hover:shadow-2xl hover:scale-[1.02] duration-500">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple-pink"></div>
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="Recipia app interface showing recipe creation"
                className="w-full h-auto"
              />
            </div>

            {/* Floating elements */}
            <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200 rotate-3 z-20 floating-element animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                      <path d="M7 7h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Suggestions</p>
                    <p className="text-xs text-gray-500">Personalized for you</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200 -rotate-3 z-20 floating-element animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Share Recipes</p>
                    <p className="text-xs text-gray-500">Public or private</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-xl shadow-lg border border-gray-200 rotate-6 z-20 floating-element animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Favorite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
        <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </div>
    </section>
  )
}
