'use client'

import { useState, useMemo, useRef } from 'react'
import { ProjectCard } from '@/components/project-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
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
   const [showTags, setShowTags] = useState(true)
   const [ripples, setRipples] = useState<Array<{
     id: number,
     x: number,
     y: number
   }>>([])
   const sectionRef = useRef<HTMLElement>(null)

  const createSplash = (event: React.MouseEvent) => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Simple ripple effect - just create expanding circles
    const rippleId = Date.now()
    const newRipple = {
      id: rippleId,
      x: clickX,
      y: clickY
    }

    setRipples(prev => [...prev, newRipple])

    // Remove after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId))
    }, 800)
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
        background: '#161B22',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(45deg, #0078FF 0.3, #0078FF 0.2) 1',
        borderRadius: '0.5rem',
        boxShadow: '0 0 40px rgba(0, 120, 255, 0.1), inset 0 0 40px rgba(0, 120, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}
    >
      {/* Subtle Water Surface Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-blue-100/15 dark:from-transparent dark:via-blue-950/10 dark:to-blue-900/15 rounded-lg"></div>

      {/* Enhanced Water Particles - Increased count with luminosity */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${20 + (i * 15) % 60}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${0.4 + (i % 3) * 0.2}), transparent)`,
              boxShadow: `0 0 ${4 + (i % 3) * 2}px hsl(var(--primary) / ${0.6 + (i % 3) * 0.2})`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Subtle Light Bursts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`burst-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle, hsl(var(--accent) / 0.1), transparent 70%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Water Ripple Effects - Simple expanding circles */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 197, 253, 0.2) 50%, transparent 70%)',
            zIndex: 1,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-foreground"
          style={{
            textShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)',
              '0 0 25px hsl(var(--accent) / 0.6), 0 0 50px hsl(var(--accent) / 0.4)',
              '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)'
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
        <div className="flex flex-wrap justify-center gap-2 mb-8">
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

        {/* Toggle Tags Button */}
        <div className="flex justify-center mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTags(!showTags)}
            className="flex items-center gap-2"
          >
            {showTags ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTags ? 'Ocultar Etiquetas' : 'Mostrar Etiquetas'}
          </Button>
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
               <ProjectCard key={project.id} project={project} showTags={showTags} />
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