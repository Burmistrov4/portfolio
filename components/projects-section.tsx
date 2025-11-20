'use client'

import { useState, useMemo, useRef } from 'react'
import { ProjectCard } from '@/components/project-card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Project {
  id: string
  title: string
  ai_summary: string
  file_paths: string[]
  technologies: string[]
}

interface ProjectsSectionProps {
  projects: Project[]
}

/**
 * @description Projects section with filtering capabilities.
 * @param {ProjectsSectionProps} props The props containing projects data.
 * @returns {JSX.Element} The projects section.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [waterDrops, setWaterDrops] = useState<Array<{
    id: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number
  }>>([])
  const sectionRef = useRef<HTMLElement>(null)

  const createSplash = (event: React.MouseEvent) => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Create realistic water splash with physics
    const drops: Array<{
      id: number,
      x: number,
      y: number,
      vx: number,
      vy: number,
      life: number,
      size: number
    }> = []
    const numDrops = 8 + Math.random() * 6 // 8-14 drops

    for (let i = 0; i < numDrops; i++) {
      const angle = (Math.PI * 2 * i) / numDrops + (Math.random() - 0.5) * 0.5
      const speed = 50 + Math.random() * 100 // 50-150 pixels
      const size = 2 + Math.random() * 3 // 2-5 pixels

      drops.push({
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.abs(Math.sin(angle)) * 30, // Upward bias
        life: 1,
        size
      })
    }

    setWaterDrops(prev => [...prev, ...drops])

    // Animate physics
    const animate = () => {
      setWaterDrops(prev =>
        prev.map(drop => ({
          ...drop,
          x: drop.x + drop.vx * 0.016, // 60fps
          y: drop.y + drop.vy * 0.016,
          vy: drop.vy + 300 * 0.016, // gravity
          life: drop.life - 0.02,
          vx: drop.vx * 0.98 // air resistance
        })).filter(drop => drop.life > 0 && drop.y < rect.height + 50)
      )
    }

    const interval = setInterval(animate, 16) // 60fps

    setTimeout(() => {
      clearInterval(interval)
      setWaterDrops(prev => prev.filter(drop => drop.id < Date.now() - 2000))
    }, 2000)
  }

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>()
    projects.forEach(project => {
      project.technologies?.forEach(tech => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  }, [projects])

  // Filter projects based on selected technology
  const filteredProjects = useMemo(() => {
    if (!selectedTech) return projects
    return projects.filter(project =>
      project.technologies?.includes(selectedTech)
    )
  }, [projects, selectedTech])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-4 sm:px-8 overflow-hidden cursor-pointer"
      onClick={createSplash}
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 50%, rgba(196, 181, 253, 0.1) 100%)',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.3), rgba(196, 181, 253, 0.3)) 1',
        borderRadius: '24px',
        boxShadow: '0 0 40px rgba(59, 130, 246, 0.2), inset 0 0 40px rgba(59, 130, 246, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}
    >
      {/* Realistic Water Splash Effects */}
      {waterDrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: drop.x - drop.size / 2,
            top: drop.y - drop.size / 2,
            width: drop.size,
            height: drop.size,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 197, 253, 0.6) 50%, rgba(59, 130, 246, 0.3) 100%)',
            boxShadow: '0 0 6px rgba(59, 130, 246, 0.8), 0 0 12px rgba(59, 130, 246, 0.6)',
            zIndex: 1,
            opacity: drop.life
          }}
          animate={{
            scale: [1, 0.8, 1.2],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Animated Water Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-cyan-50/30 to-indigo-50/40 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-indigo-950/40"></div>

        {/* Water-like flowing elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Optimized Light Particles */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-300/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.8), 0 0 16px rgba(59, 130, 246, 0.6)',
            }}
            animate={{
              y: [-25, 25, -25],
              x: [-10, 10, -10],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 8 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Additional water surface effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-100/5 to-blue-200/10 dark:from-transparent dark:via-blue-900/5 dark:to-blue-800/10 rounded-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          style={{
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
              '0 0 25px rgba(147, 197, 253, 0.6), 0 0 50px rgba(147, 197, 253, 0.4)',
              '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Mis Proyectos
        </motion.h2>

        {/* Technology Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Badge
            variant={selectedTech === null ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setSelectedTech(null)}
          >
            Todos
          </Badge>
          {allTechnologies.map(tech => (
            <Badge
              key={tech}
              variant={selectedTech === tech ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {selectedTech
                ? `No hay proyectos con la tecnología "${selectedTech}"`
                : "No hay proyectos disponibles"
              }
            </p>
          </div>
        )}
      </div>
    </section>
  )
}