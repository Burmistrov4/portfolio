"use client"

import { useEffect, useState } from "react"

/**
 * @description Matrix-style particles background component.
 * @returns {JSX.Element} The particles background.
 */
export function ParticlesBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Simple CSS-based particle animation as fallback
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20 animate-pulse'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = '-10px'
      particle.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`

      const container = document.getElementById('particles-container')
      if (container) {
        container.appendChild(particle)

        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle)
          }
        }, 5000)
      }
    }

    // Create particles every 200ms
    const interval = setInterval(createParticle, 200)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10" />
  }

  return (
    <>
      <div
        id="particles-container"
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      />
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}