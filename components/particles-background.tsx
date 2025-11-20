"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

/**
 * @description Global floating particles background component with glow effects.
 * @returns {JSX.Element} The particles background.
 */
export function ParticlesBackground() {
  // Generate stable particle positions and properties
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + (i % 4), // Size between 2-5px
      delay: Math.random() * 3,
      duration: 6 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.3,
      glowIntensity: 0.3 + (i % 3) * 0.2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${particle.opacity}), transparent)`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / ${particle.glowIntensity}), 0 0 ${particle.size * 4}px hsl(var(--accent) / ${particle.glowIntensity * 0.5})`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [particle.opacity * 0.4, particle.opacity, particle.opacity * 0.4],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Additional subtle light bursts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`burst-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i * 11) % 70}%`,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, hsl(var(--accent) / 0.08), transparent 65%)`,
          }}
          animate={{
            scale: [0.8, 1.3, 0.8],
            opacity: [0.03, 0.12, 0.03],
          }}
          transition={{
            duration: 10 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}