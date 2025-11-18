'use client'

import { useState, useMemo } from 'react'
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
    <section className="relative py-16 px-4 sm:px-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-200/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-blue-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Mis Proyectos
        </h2>

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